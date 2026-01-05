// better-auth
import { betterAuth, google, type Auth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
// drizzle
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { type Pool } from 'pg';

export const betterAuthConfig = (
  db: NodePgDatabase<Record<string, never>> & { $client: Pool },
  schema: Record<string, any>,
  betterAuthSecret: string,
  betterAuthUrl: string,
  discordClientId: string,
  discordClientSecret: string,
  googleClientId: string,
  googleClientSecret: string
): Auth => {
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg', // or "mysql", "sqlite"
      schema,
    }),
    secret: betterAuthSecret,
    baseURL: betterAuthUrl,
    // allow requests from the frontend development server
    trustedOrigins: ['https://pay-crew2.yukiosada.work', 'http://localhost:5173'],
    socialProviders: {
      discord: {
        clientId: discordClientId,
        clientSecret: discordClientSecret,
        scope: ['identify', 'email'],
      },
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        scope: [
          'openid',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: false,
      },
    },
  });

  return auth;
};
