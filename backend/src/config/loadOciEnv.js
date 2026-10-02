import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const dotenv = require('dotenv');
const common = require('oci-common');
const secrets = require('oci-secrets');

dotenv.config({ path: '../.env' });

const {
  InstancePrincipalsAuthenticationDetailsProviderBuilder,
} = common;

const { ConfigFileAuthenticationDetailsProvider } = common;

const { SecretsClient } = secrets;

export async function loadOciEnv() {
  const { APP_NAME, APP_ENV, OCI_VAULT_ID } = process.env;

  if (!APP_NAME || !APP_ENV || !OCI_VAULT_ID) {
    throw new Error('Missing OCI bootstrap configuration');
  }

  const secretName = `${APP_NAME}-${APP_ENV}`;

  let provider;

  if (process.platform === 'win32') {
    provider = new ConfigFileAuthenticationDetailsProvider();
  } else {
    provider = await new InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
  }
  
  const client = new SecretsClient({
    authenticationDetailsProvider: provider,
  });

  const response = await client.getSecretBundleByName({
    secretName,
    vaultId: OCI_VAULT_ID,
  });

  const encoded =
    response.secretBundle?.secretBundleContent?.content;

  if (!encoded) {
    throw new Error(`Empty OCI secret: ${secretName}`);
  }

  const parsed = dotenv.parse(
    Buffer.from(encoded, 'base64').toString('utf8')
  );

  for (const [key, value] of Object.entries(parsed)) {
    process.env[key] = value;
  }

  console.log(`Vault environment loaded: ${secretName}`);
}