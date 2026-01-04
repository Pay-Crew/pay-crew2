import fs from 'fs';
import { dotenvLoader, fileWriter } from './functions';

const main = () => {
  //* Change directory to the project root where the .env file is located *//
  process.chdir('../');

  //* Check current directory is project root *//
  if (!fs.existsSync('pay-crew2')) {
    throw new Error('This script must be run from the root directory of the project');
  }

  //* Load environment variables from .env file *//
  const envConfig = dotenvLoader();

  //* Create secret configuration files *//
  {
    // frontend
    const frontendDotenvData = `VITE_API_URL=${envConfig.frontendConfig.viteApiUrl}
VITE_REDIRECT_URL=${envConfig.frontendConfig.viteRedirectUrl}
`;
    fileWriter('./products/frontend/.env', frontendDotenvData);
  }

  {
    // backend
    const wranglerData = `{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "pay-crew2-backend",
    "main": "src/index.ts",
    "compatibility_date": "2025-12-04",
    "compatibility_flags": [
        "nodejs_compat"
    ],
    "hyperdrive": [
        {
            "binding": "HYPERDRIVE",
            "id": "dummy",
            "localConnectionString": "postgresql://${envConfig.backendConfig.postgresUser}:${envConfig.backendConfig.postgresPassword}@localhost:${envConfig.backendConfig.postgresPort}/${envConfig.backendConfig.postgresDb}"
        }
    ],
    "vars": {
        "BETTER_AUTH_URL": "${envConfig.backendConfig.betterAuthUrl}",
        "BETTER_AUTH_SECRET": "${envConfig.backendConfig.betterAuthSecret}",
        "DISCORD_CLIENT_ID": "${envConfig.backendConfig.discordClientId}",
        "DISCORD_CLIENT_SECRET": "${envConfig.backendConfig.discordClientSecret}"
    }
}
`;
    fileWriter('./products/backend/wrangler.local.jsonc', wranglerData);

    const backendDotenvData = `DATABASE_URL=postgresql://${envConfig.backendConfig.postgresUser}:${envConfig.backendConfig.postgresPassword}@localhost:${envConfig.backendConfig.postgresPort}/${envConfig.backendConfig.postgresDb}
DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED=${envConfig.backendConfig.dbCredentialsSslRejectUnauthorized}
BETTER_AUTH_URL=${envConfig.backendConfig.betterAuthUrl}
BETTER_AUTH_SECRET=${envConfig.backendConfig.betterAuthSecret}
DISCORD_CLIENT_ID=${envConfig.backendConfig.discordClientId}
DISCORD_CLIENT_SECRET=${envConfig.backendConfig.discordClientSecret}
`;
    fileWriter('./products/backend/.env', backendDotenvData);
  }
};

main();
