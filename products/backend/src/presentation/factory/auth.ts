// better-auth
import type { Auth } from 'better-auth';
// better-auth config
import { betterAuthConfig } from '../../auth.config';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
// drizzle schema
import * as schema from '../../db/schema';
// types
import { Bindings } from '../../types';

// auth関数の型定義
export type AuthFactoryType = (env: Bindings) => Auth;

// better-auth setup
export const authFactory = (env: Bindings): Auth => {
  // drizzle instance
  const db = drizzle(env.HYPERDRIVE.connectionString);

  // env variables from bindings
  const betterAuthSecret = env.BETTER_AUTH_SECRET;
  const betterAuthUrl = env.BETTER_AUTH_URL;
  const discordClientId = env.DISCORD_CLIENT_ID;
  const discordClientSecret = env.DISCORD_CLIENT_SECRET;
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;

  // better-auth instance
  const betterAuthInstance = betterAuthConfig(
    db,
    schema,
    betterAuthSecret,
    betterAuthUrl,
    discordClientId,
    discordClientSecret,
    googleClientId,
    googleClientSecret
  );

  return betterAuthInstance;
};
