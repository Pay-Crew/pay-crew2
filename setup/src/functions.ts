import * as dotenv from 'dotenv';
import { DotEnvCaster } from 'dotenv-caster';
import fs from 'fs';
import { BackendConfig, EnvConfig, FrontendConfig, NotifyConfig } from './types';

export const dotenvLoader = (): EnvConfig => {
  dotenv.config();

  const caster = new DotEnvCaster();

  const viteApiUrl = caster.castString(process.env.VITE_API_URL);
  const viteSentryDsn = caster.castString(process.env.VITE_SENTRY_DSN);
  const sentryAuthToken = caster.castString(process.env.SENTRY_AUTH_TOKEN);
  const sentryOrg = caster.castString(process.env.SENTRY_ORG);
  const sentryProject = caster.castString(process.env.SENTRY_PROJECT);
  const postgresUser = caster.castString(process.env.POSTGRES_USER);
  const postgresPassword = caster.castString(process.env.POSTGRES_PASSWORD);
  const postgresDb = caster.castString(process.env.POSTGRES_DB);
  const postgresPort = parseInt(caster.castString(process.env.POSTGRES_PORT), 10);
  if (Number.isNaN(postgresPort)) {
    throw new Error('POSTGRES_PORT has to be a number');
  }

  console.info('Environment variables loaded from .env file');
  console.table({
    VITE_API_URL: viteApiUrl,
    VITE_SENTRY_DSN: viteSentryDsn ? '*****' : '',
    SENTRY_AUTH_TOKEN: sentryAuthToken ? '*****' : '',
    SENTRY_ORG: sentryOrg,
    SENTRY_PROJECT: sentryProject,
    POSTGRES_USER: postgresUser,
    POSTGRES_PASSWORD: postgresPassword ? '*****' : '',
    POSTGRES_DB: postgresDb,
    POSTGRES_PORT: postgresPort,
  });

  const frontendConfig: FrontendConfig = {
    viteApiUrl,
    viteSentryDsn,
    sentryAuthToken,
    sentryOrg,
    sentryProject,
  };
  const backendConfig: BackendConfig = {
    postgresUser,
    postgresPassword,
    postgresDb,
    postgresPort,
  };
  const notifyConfig: NotifyConfig = {
    apiUrl: viteApiUrl,
  };

  const envConfig = {
    frontendConfig,
    backendConfig,
    notifyConfig,
  };

  return envConfig;
};

export const fileWriter = (path: string, data: string) => {
  fs.writeFile(path, data, (error) => {
    if (error) {
      throw new Error(`Failed to write ${path}: ${error.message}`);
    }
  });
  console.info(`Succeeded to write ${path}`);
};
