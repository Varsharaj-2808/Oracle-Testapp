import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..', '..', '..');

// The project root is always searched first, so the app behaves the same no
// matter which directory `node` was started from. Set DOTENV_CONFIG_PATH to
// point somewhere else if you need to.
const envPath = process.env.DOTENV_CONFIG_PATH || path.join(projectRoot, '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const isSet = (value) => typeof value === 'string' && value.trim() !== '';

/**
 * Every variable the app knows about, split by whether it must be present for a
 * given feature to work. `secret: true` means the value must never reach the
 * browser, a log line, or an API response.
 */
const schema = [
  { name: 'PORT', required: false, secret: false, feature: 'server' },
  { name: 'NODE_ENV', required: false, secret: false, feature: 'server' },
  { name: 'CORS_ORIGIN', required: false, secret: false, feature: 'server' },
  { name: 'SUPABASE_URL', required: true, secret: false, feature: 'supabase' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, secret: true, feature: 'supabase' },
  { name: 'SUPABASE_ANON_KEY', required: false, secret: false, feature: 'supabase' },
  { name: 'BREVO_API_KEY', required: true, secret: true, feature: 'brevo' },
  { name: 'BREVO_SENDER_EMAIL', required: true, secret: false, feature: 'brevo' },
  { name: 'BREVO_SENDER_NAME', required: false, secret: false, feature: 'brevo' },
];

const readVar = (name) => (isSet(process.env[name]) ? process.env[name].trim() : '');

export const env = {
  envPath,

  PORT: Number(readVar('PORT')) || 4000,
  NODE_ENV: readVar('NODE_ENV') || 'development',

  CORS_ORIGIN: readVar('CORS_ORIGIN')
    ? readVar('CORS_ORIGIN').split(',').map((origin) => origin.trim()).filter(Boolean)
    : true,

  SUPABASE_URL: readVar('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: readVar('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_ANON_KEY: readVar('SUPABASE_ANON_KEY'),

  BREVO_API_KEY: readVar('BREVO_API_KEY'),
  BREVO_SENDER_EMAIL: readVar('BREVO_SENDER_EMAIL'),
  BREVO_SENDER_NAME: readVar('BREVO_SENDER_NAME'),
};

/** Report which variables are present. Values are never included. */
export const configStatus = () =>
  schema.map((entry) => ({
    name: entry.name,
    feature: entry.feature,
    required: entry.required,
    secret: entry.secret,
    present: isSet(process.env[entry.name]),
  }));

const missingFor = (feature) =>
  schema.filter((entry) => entry.feature === feature && entry.required && !isSet(process.env[entry.name]));

export const isSupabaseConfigured = () => missingFor('supabase').length === 0;
export const isBrevoConfigured = () => missingFor('brevo').length === 0;
export const missingSupabaseVars = () => missingFor('supabase').map((entry) => entry.name);
export const missingBrevoVars = () => missingFor('brevo').map((entry) => entry.name);

/**
 * A `VITE_`-prefixed variable is inlined into the browser bundle at build time.
 * If a real secret is ever given that prefix it is effectively published, so we
 * flag it loudly on startup rather than quietly shipping it.
 */
export const detectLeakedSecrets = () =>
  schema
    .filter((entry) => entry.secret && isSet(process.env[`VITE_${entry.name}`]))
    .map((entry) => `VITE_${entry.name}`);

export { isSet };
