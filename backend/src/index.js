import express from 'express';
import cors from 'cors';


import {
  configStatus,
  detectLeakedSecrets,
  env,
  isBrevoConfigured,
  isSupabaseConfigured,
  missingBrevoVars,
  missingSupabaseVars,
} from './config/env.js';

import healthRouter from './routes/health.js';
import configRouter from './routes/config.js';
import customersRouter from './routes/customers.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import emailRouter from './routes/email.js';

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/email', emailRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// Express 5 forwards rejected async handlers here automatically.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${err.message}`);
  }
  res.status(status).json({ error: err.message || 'Unexpected server error.' });
});

function start() {
  const leaked = detectLeakedSecrets();
  for (const name of leaked) {
    console.warn(`[warn] ${name} is set but secrets must never use a VITE_ prefix (it is bundled into the browser).`);
  }

  const missing = configStatus().filter((entry) => entry.required && !entry.present);

  console.log('--- secret-management sample backend ---');

  
  console.log(`  supabase       : ${isSupabaseConfigured() ? 'configured' : `not configured, missing ${missingSupabaseVars().join(', ')}`}`);
  console.log(`  brevo          : ${isBrevoConfigured() ? 'configured' : `not configured, missing ${missingBrevoVars().join(', ')}`}`);
  console.log(`  listening on   : http://localhost:${env.PORT}`);
  console.log('---------------------------------------');

  app.listen(env.PORT, () => {});
}

start();
