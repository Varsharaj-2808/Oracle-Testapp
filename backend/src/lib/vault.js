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

export async function getVaultSecret(secretId) {
  const response = await client.getSecretBundle({
    secretId,
  });

  const content = response.secretBundle.secretBundleContent?.content;

  if (!content) {
    throw new Error('Secret content was not returned from OCI Vault.');
  }

  return Buffer.from(content, 'base64').toString('utf8');
}



