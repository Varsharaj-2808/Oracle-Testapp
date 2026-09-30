import { Router } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { missingSupabaseVars } from '../config/env.js';

const router = Router();

const requireSupabase = (req, res, next) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not configured.', missing: missingSupabaseVars() });
  }
  req.supabase = supabase;
  next();
};

router.use(requireSupabase);

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('orders')
    .select('id, quantity, total, created_at, customers ( id, name, email ), products ( id, name, price )')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const customerId = typeof req.body?.customerId === 'string' ? req.body.customerId : '';
  const productId = typeof req.body?.productId === 'string' ? req.body.productId : '';
  const quantity = Number(req.body?.quantity);

  if (!customerId) return res.status(400).json({ error: 'customerId is required.' });
  if (!productId) return res.status(400).json({ error: 'productId is required.' });
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer.' });
  }

  const { data: product, error: productError } = await req.supabase
    .from('products')
    .select('id, price')
    .eq('id', productId)
    .maybeSingle();

  if (productError) return res.status(500).json({ error: productError.message });
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const total = Number((Number(product.price) * quantity).toFixed(2));

  const { data, error } = await req.supabase
    .from('orders')
    .insert({ customer_id: customerId, product_id: productId, quantity, total })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
