import { Router } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { missingSupabaseVars } from '../config/env.js';

const router = Router();

const requireSupabase = (req, res, next) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is not configured.',
      missing: missingSupabaseVars(),
    });
  }
  req.supabase = supabase;
  next();
};

router.use(requireSupabase);

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

  if (!name) return res.status(400).json({ error: 'Name is required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const { data, error } = await req.supabase
    .from('customers')
    .insert({ name, email })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
