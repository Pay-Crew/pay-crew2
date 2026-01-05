// better-auth
import { type Auth } from 'better-auth';

// Honoが保持する環境変数の型定義
export type Bindings = {
  // better-auth
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  // hyperdrive
  HYPERDRIVE: Hyperdrive;
};

// Honoが保持する認証情報の型定義
export type AuthType = {
  user: Auth['$Infer']['Session']['user'];
  session: Auth['$Infer']['Session']['session'];
};
