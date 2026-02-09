// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { Bindings } from '../../types';
import { DatabaseType } from './types';

export const createDbConnection = (env: Bindings): DatabaseType => {
  return drizzle({ connection: env.HYPERDRIVE });
};
