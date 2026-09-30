import { Router } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { missingSupabaseVars } from '../config/env.js';

const router = Router();

router.get('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not configured.', missing: missingSupabaseVars() });
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
