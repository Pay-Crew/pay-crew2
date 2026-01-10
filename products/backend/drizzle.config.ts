// drizzle
import type { Config } from 'drizzle-kit';
// dotenv
import * as dotenv from 'dotenv';
import { DotEnvCaster } from 'dotenv-caster';

// load .env variables
dotenv.config();
const caster = new DotEnvCaster();

// cast variables
const databaseUrl = caster.castString(process.env.DATABASE_URL);
const databaseCredentialsSslRejectUnauthorized = caster.castBoolean(
  process.env.DATABASE_CREDENTIALS_SSL_REJECT_UNAUTHORIZED
);

export default {
  dialect: 'postgresql',
  schema: ['./src/db/auth-schema.ts', './src/db/pay-crew2-schema.ts', './src/db/relation.ts'],
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
    ssl: {
      rejectUnauthorized: databaseCredentialsSslRejectUnauthorized,
    },
  },
} satisfies Config;
