import { eq, inArray } from 'drizzle-orm';
import { user } from '../../db/auth-schema';
import type { Db } from '../db';

const formatUserName = (userInfo: { name: string; displayName: string | null }): string =>
  userInfo.displayName !== null && userInfo.displayName.length > 0
    ? userInfo.displayName
    : userInfo.name;

export const fetchUserDisplayName = async (db: Db, userId: string): Promise<string> => {
  const userInfo = await db
    .select({ name: user.name, displayName: user.displayName })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return formatUserName(userInfo[0]);
};

export const fetchUserNameMap = async (db: Db, userIds: string[]): Promise<Map<string, string>> => {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({ id: user.id, name: user.name, displayName: user.displayName })
    .from(user)
    .where(inArray(user.id, uniqueIds));

  const nameMap = new Map<string, string>();
  for (const row of rows) {
    nameMap.set(row.id, formatUserName(row));
  }

  return nameMap;
};
