// better-auth
import { Auth, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
// drizzle schema
import * as schema from './db/schema';

// NOTE: Honoに渡す型定義 1
export type Bindings = {
  // better-auth
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  // hyperdrive
  HYPERDRIVE: Hyperdrive;
};

// better-auth setup
export const auth = (env: Bindings) => {
  // drizzle instance
  const db = drizzle(env.HYPERDRIVE.connectionString);

  // better-auth instance
  const betterAuthInstance = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg', // or "mysql", "sqlite"
      schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    // allow requests from the frontend development server
    trustedOrigins: ['http://localhost:5173'],
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        scope: ['identify', 'email'],
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: false,
      },
    },
  });

  return betterAuthInstance;
};

// NOTE: Honoに渡す型定義 2
export type AuthType = {
  user: Auth['$Infer']['Session']['user'] | null;
  session: Auth['$Infer']['Session']['session'] | null;
};
