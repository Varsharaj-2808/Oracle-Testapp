import { Router } from 'express';
import {
  configStatus,
  detectLeakedSecrets,
  isBrevoConfigured,
  isSupabaseConfigured,
} from '../config/env.js';

const router = Router();

/**
 * Reports which environment variables are configured.
 *
 * Only a boolean `present` flag is returned per variable. No value is ever
 * included, so this endpoint is safe to call from the browser and to leave open
 * while testing.
 */
router.get('/', (req, res) => {
  const leaked = detectLeakedSecrets();

  res.json({
    variables: configStatus(),
    features: {
      supabase: { configured: isSupabaseConfigured() },
      brevo: { configured: isBrevoConfigured() },
    },
    warnings: leaked.length
      ? [
          `Secret value(s) found in browser-exposed variable(s): ${leaked.join(', ')}. ` +
            'Anything prefixed with VITE_ is inlined into the client bundle at build time.',
        ]
      : [],
  });
});

export default router;
