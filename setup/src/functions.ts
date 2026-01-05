import * as dotenv from 'dotenv';
import { DotEnvCaster } from 'dotenv-caster';
import fs from 'fs';
import { BackendConfig, EnvConfig, FrontendConfig } from './types';

export const dotenvLoader = (): EnvConfig => {
  dotenv.config();

  const caster = new DotEnvCaster();

  const viteApiUrl = caster.castString(process.env.VITE_API_URL);
  const viteRedirectUrl = caster.castString(process.env.VITE_REDIRECT_URL);
  const postgresUser = caster.castString(process.env.POSTGRES_USER);
  const postgresPassword = caster.castString(process.env.POSTGRES_PASSWORD);
  const postgresDb = caster.castString(process.env.POSTGRES_DB);
  const postgresPort = parseInt(caster.castString(process.env.POSTGRES_PORT), 10);
  const dbCredentialsSslRejectUnauthorized = caster.castBoolean(
    process.env.DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED
  );
  const betterAuthUrl = caster.castString(process.env.BETTER_AUTH_URL);
  const betterAuthSecret = caster.castString(process.env.BETTER_AUTH_SECRET);
  const discordClientId = caster.castString(process.env.DISCORD_CLIENT_ID);
  const discordClientSecret = caster.castString(process.env.DISCORD_CLIENT_SECRET);
  const googleClientId = caster.castString(process.env.GOOGLE_CLIENT_ID);
  const googleClientSecret = caster.castString(process.env.GOOGLE_CLIENT_SECRET);
  if (Number.isNaN(postgresPort)) {
    throw new Error('POSTGRES_PORT has to be a number');
  }

  console.info('Environment variables loaded from .env file');
  console.table({
    VITE_API_URL: viteApiUrl,
    VITE_REDIRECT_URL: viteRedirectUrl,
    POSTGRES_USER: postgresUser,
    POSTGRES_PASSWORD: postgresPassword ? '*****' : '',
    POSTGRES_DB: postgresDb,
    POSTGRES_PORT: postgresPort,
    DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED: dbCredentialsSslRejectUnauthorized,
    BETTER_AUTH_URL: betterAuthUrl,
    BETTER_AUTH_SECRET: betterAuthSecret ? '*****' : '',
    DISCORD_CLIENT_ID: discordClientId,
    DISCORD_CLIENT_SECRET: discordClientSecret ? '*****' : '',
    GOOGLE_CLIENT_ID: googleClientId,
    GOOGLE_CLIENT_SECRET: googleClientSecret ? '*****' : '',
  });

  const frontendConfig: FrontendConfig = {
    viteApiUrl,
    viteRedirectUrl,
  };
  const backendConfig: BackendConfig = {
    postgresUser,
    postgresPassword,
    postgresDb,
    postgresPort,
    dbCredentialsSslRejectUnauthorized,
    betterAuthUrl,
    betterAuthSecret,
    discordClientId,
    discordClientSecret,
    googleClientId,
    googleClientSecret,
  };

  const envConfig = {
    frontendConfig,
    backendConfig,
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
