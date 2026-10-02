import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const common = require('oci-common');
const secrets = require('oci-secrets');

const {
  InstancePrincipalsAuthenticationDetailsProviderBuilder,
} = common;

const { SecretsClient } = secrets;

const provider =
  await new InstancePrincipalsAuthenticationDetailsProviderBuilder().build();

const client = new SecretsClient({
  authenticationDetailsProvider: provider,
});

const vaultId =
  'ocid1.vault.oc1.ap-hyderabad-1.gfvlz63naaan4.abuhsljrxfcx6xkjabsxyqy6uzwfiz34quhvqtifkpvvroqaukb53o47w3ua';

export async function loadVaultEnvironment() {
  const secretNames = [
    'PORT',
    'NODE_ENV',
    'CORS_ORIGIN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'BREVO_API_KEY',
    'BREVO_SENDER_EMAIL',
    'BREVO_SENDER_NAME',
  ];

  for (const secretName of secretNames) {
    const response = await client.getSecretBundleByName({
      secretName,
      vaultId,
    });

    const content =
      response.secretBundle.secretBundleContent?.content;

    if (!content) {
      throw new Error(`Vault secret has no content: ${secretName}`);
    }

    process.env[secretName] =
      Buffer.from(content, 'base64').toString('utf8');
  }
}
