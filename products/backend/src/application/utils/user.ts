// drizzle
import { eq, inArray } from 'drizzle-orm';
import { user } from '../../db/schema';
// types
import { DatabaseType, UserInfoType, UserNameType } from './types';
import { HTTPException } from 'hono/http-exception';

export const formatUserName = (userName: UserNameType): string => {
  return userName.displayName !== null && userName.displayName.length > 0 ? userName.displayName : userName.name;
};

export const getUserInfo = async (db: DatabaseType, userId: string): Promise<UserInfoType> => {
  // user table からユーザ名を取得
  const userNameInfo = await db
    .select({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // ユーザが存在しない場合はエラー
  if (userNameInfo.length === 0) {
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }

  return {
    id: userNameInfo[0].id,
    // ユーザ名をフォーマット
    name: formatUserName({ name: userNameInfo[0].name, displayName: userNameInfo[0].displayName }),
  };
};

export const getUserNameMap = async (db: DatabaseType, userIds: string[]): Promise<Map<string, string>> => {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({ id: user.id, name: user.name, displayName: user.displayName })
    .from(user)
    .where(inArray(user.id, uniqueIds));

  // Map<userId, formattedUserName>
  const nameMap = new Map<string, string>();
  for (const row of rows) {
    nameMap.set(row.id, formatUserName(row));
  }

  return nameMap;
};
