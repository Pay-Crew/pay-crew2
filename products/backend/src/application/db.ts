import { drizzle } from 'drizzle-orm/node-postgres';
import type { Bindings } from '../types';

export const createDb = (env: Bindings) => drizzle({ connection: env.HYPERDRIVE });

export type Db = ReturnType<typeof createDb>;
