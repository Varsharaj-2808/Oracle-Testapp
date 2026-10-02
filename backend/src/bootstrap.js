import { loadVaultEnvironment } from './lib/vault-env.js';

await loadVaultEnvironment();

await import('./index.js');
