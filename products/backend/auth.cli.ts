// drizzle
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
// drizzle schema
import * as schema from './src/db/relation';
//dotenv
import * as dotenv from 'dotenv';
import { DotEnvCaster } from 'dotenv-caster';
// better-auth config
import { betterAuthConfig } from './src/auth.config';

// load .env variables
dotenv.config();
const caster = new DotEnvCaster();

// cast variables
const databaseUrl = caster.castString(process.env.DATABASE_URL);
const betterAuthSecret = caster.castString(process.env.BETTER_AUTH_SECRET);
const betterAuthUrl = caster.castString(process.env.BETTER_AUTH_URL);
const discordClientId = caster.castString(process.env.DISCORD_CLIENT_ID);
const discordClientSecret = caster.castString(process.env.DISCORD_CLIENT_SECRET);
const googleClientId = caster.castString(process.env.GOOGLE_CLIENT_ID);
const googleClientSecret = caster.castString(process.env.GOOGLE_CLIENT_SECRET);

// drizzle setup
const pool = new Pool({
  connectionString: databaseUrl,
});

// drizzle instance
const db = drizzle({ client: pool });

// better-auth setup
export const auth = betterAuthConfig(
  db,
  schema,
  betterAuthSecret,
  betterAuthUrl,
  discordClientId,
  discordClientSecret,
  googleClientId,
  googleClientSecret
);
