export type EnvConfig = {
  frontendConfig: FrontendConfig;
  backendConfig: BackendConfig;
};

export type FrontendConfig = {
  viteApiUrl: string;
  viteSentryDsn: string;
  sentryAuthToken: string;
  sentryOrg: string;
  sentryProject: string;
};

export type BackendConfig = {
  postgresUser: string;
  postgresPassword: string;
  postgresDb: string;
  postgresPort: number;
};
