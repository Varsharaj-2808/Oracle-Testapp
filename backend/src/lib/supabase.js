import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '../config/env.js';

let client = null;

/**
 * Server-side Supabase client using the service-role key.
 *
 * This module must only ever be imported by backend code. The service-role key
 * bypasses Row Level Security, so treat anything that imports this as sensitive.
 * Returns null when credentials are missing so routes can answer 503 instead of
 * throwing at import time.
 */
export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;

  client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
