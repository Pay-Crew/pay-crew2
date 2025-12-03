export type EnvConfig = {
  frontendConfig: FrontendConfig;
  backendConfig: BackendConfig;
  notifyConfig: NotifyConfig;
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

export type NotifyConfig = {
  apiUrl: string;
};
