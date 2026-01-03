// better-auth
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
// drizzle
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
// drizzle schema
import * as schema from './db/schema';

// drizzle setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// drizzle instance
export const db = drizzle({ client: pool });

// better-auth setup
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,
  // allow requests from the frontend development server
  trustedOrigins: ['http://localhost:5173'],
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
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
