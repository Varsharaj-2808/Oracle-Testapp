import { loadOciEnv } from './config/loadOciEnv.js';

try {
  await loadOciEnv();
  await import('./index.js');
} catch (error) {
  console.error('Secret bootstrap failed:', error.message);
  process.exit(1);
}