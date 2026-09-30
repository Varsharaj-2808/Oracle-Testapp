import { Router } from 'express';
import { sendEmail } from '../lib/brevo.js';
import { isBrevoConfigured, missingBrevoVars } from '../config/env.js';

const router = Router();

router.post('/test', async (req, res) => {
  if (!isBrevoConfigured()) {
    return res.status(503).json({ error: 'Brevo is not configured.', missing: missingBrevoVars() });
  }

  try {
    const result = await sendEmail({
      to: req.body?.to,
      subject: req.body?.subject,
      text: req.body?.text,
      html: req.body?.html,
    });
    res.status(200).json({ sent: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
      code: error.code || 'EMAIL_SEND_FAILED',
    });
  }
});

export default router;
