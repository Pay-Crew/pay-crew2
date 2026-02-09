// drizzle
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export type DatabaseType = NodePgDatabase<Record<string, never>> & {
  $client: Pool;
};

export type TransactionType = {
  user_id: string; // 取引相手のユーザID
  lent_amount: number; // 貸した金額
  borrowed_amount: number; // 借りた金額
};

export type UserNameType = {
  name: string;
  displayName: string | null;
};

export type UserInfoType = {
  id: string;
  name: string;
};
