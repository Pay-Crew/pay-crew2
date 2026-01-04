export type EnvConfig = {
  frontendConfig: FrontendConfig;
  backendConfig: BackendConfig;
};

export type FrontendConfig = {
  viteApiUrl: string;
  viteRedirectUrl: string;
};

export type BackendConfig = {
  postgresUser: string;
  postgresPassword: string;
  postgresDb: string;
  postgresPort: number;
  dbCredentialsSslRejectUnauthorized: boolean;
  betterAuthUrl: string;
  betterAuthSecret: string;
  discordClientId: string;
  discordClientSecret: string;
};
