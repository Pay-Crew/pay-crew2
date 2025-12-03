import fs from 'fs';
import { dotenvLoader, fileWriter } from './functions';

const main = () => {
  //* Change directory to the project root where the .env file is located *//
  process.chdir('../');

  //* Check current directory is project root *//
  if (!fs.existsSync('pay-crew')) {
    throw new Error('This script must be run from the root directory of the project');
  }

  //* Load environment variables from .env file *//
  const envConfig = dotenvLoader();

  //* Create secret configuration files *//
  {
    // frontend
    const frontendDotenvData = `VITE_API_URL=${envConfig.frontendConfig.viteApiUrl}
VITE_SENTRY_DSN=${envConfig.frontendConfig.viteSentryDsn}
SENTRY_AUTH_TOKEN=${envConfig.frontendConfig.sentryAuthToken}
SENTRY_ORG=${envConfig.frontendConfig.sentryOrg}
SENTRY_PROJECT=${envConfig.frontendConfig.sentryProject}
`;
    fileWriter('./products/frontend/.env', frontendDotenvData);
  }

  {
    // backend
    const wranglerData = `{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "pay-crew-backend",
    "main": "src/index.ts",
    "compatibility_date": "2025-09-21",
    "compatibility_flags": [
        "nodejs_compat"
    ],
    "hyperdrive": [
        {
            "binding": "HYPERDRIVE",
            "id": "dummy",
            "localConnectionString": "postgresql://${envConfig.backendConfig.postgresUser}:${envConfig.backendConfig.postgresPassword}@localhost:${envConfig.backendConfig.postgresPort}/${envConfig.backendConfig.postgresDb}"
        }
    ]
}
`;
    fileWriter('./products/backend/wrangler.local.jsonc', wranglerData);

    const backendDotenvData = `POSTGRES_URL=postgresql://${envConfig.backendConfig.postgresUser}:${envConfig.backendConfig.postgresPassword}@localhost:${envConfig.backendConfig.postgresPort}/${envConfig.backendConfig.postgresDb}
`;
    fileWriter('./products/backend/.env', backendDotenvData);
  }

  {
    // notify
    const wranglerData = `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "pay-crew-notify",
  "main": "src/index.ts",
  "compatibility_date": "2025-11-19",
  "observability": {
    "enabled": true,
  },
  "vars": {
    "API_URL": "${envConfig.notifyConfig.apiUrl}",
  },
}
`;
    fileWriter('./products/notify/wrangler.local.jsonc', wranglerData);
  }
};

main();
