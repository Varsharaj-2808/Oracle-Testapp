import { getVaultSecret } from './lib/vault.js';

const secretId = 'ocid1.vaultsecret.oc1.ap-hyderabad-1.amaaaaaamgys6taajhfxxffm5yyxabfboe2jaxg33pccd5dsuwiyyb6ib4kq';

try {
  const secret = await getVaultSecret(secretId);

  console.log('Vault access successful.');
  console.log(`Secret length: ${secret.length}`);
} catch (error) {
  console.error('Vault access failed:', error.message);
  process.exitCode = 1;
}
