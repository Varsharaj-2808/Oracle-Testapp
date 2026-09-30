import { env, isBrevoConfigured } from '../config/env.js';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/**
 * Send one transactional email through Brevo's v3 SMTP API using native fetch.
 *
 * Brevo's API key is sent in the `api-key` header and must stay server-side.
 * Errors are surfaced to the caller but the key is never echoed back or logged.
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!isBrevoConfigured()) {
    const error = new Error('Email provider is not configured.');
    error.status = 503;
    error.code = 'BREVO_NOT_CONFIGURED';
    throw error;
  }

  const recipient = typeof to === 'string' ? to.trim() : '';
  if (!isEmail(recipient)) {
    const error = new Error('A valid recipient email address is required.');
    error.status = 400;
    error.code = 'INVALID_RECIPIENT';
    throw error;
  }

  const payload = {
    sender: {
      name: env.BREVO_SENDER_NAME || 'Secret Test App',
      email: env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: recipient }],
    subject: subject || 'Test email from the secret-management sample app',
    // Brevo v3 requires htmlContent or textContent; the v2 `text`/`html`
    // field names are rejected with `missing_parameter`.
    textContent: text || 'This is a test email sent to verify Brevo configuration.',
  };

  if (html) payload.htmlContent = html;

  let response;
  try {
    response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (cause) {
    const error = new Error('Could not reach the Brevo API.');
    error.status = 502;
    error.code = 'BREVO_UNREACHABLE';
    error.cause = cause;
    throw error;
  }

  const raw = await response.text();
  let body = {};
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = { message: raw };
    }
  }

  if (!response.ok) {
    const error = new Error(
      body.message || `Brevo rejected the request with status ${response.status}.`,
    );
    error.status = response.status >= 400 && response.status < 500 ? 400 : 502;
    error.code = body.code || 'BREVO_ERROR';
    throw error;
  }

  return {
    messageId: body.messageId ?? null,
    to: recipient,
    subject: payload.subject,
    sender: payload.sender.email,
  };
}
