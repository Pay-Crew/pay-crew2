// drizzle
import { eq, inArray } from 'drizzle-orm/sql/expressions/conditions';
import { groupMembership, user } from '../../db/schema';
// types
import { DatabaseType, FormattedUserTableType, UserInfoType, UserNameType } from './types';

export const formatUserName = (userName: UserNameType): string => {
  return userName.displayName !== null && userName.displayName.length > 0 ? userName.displayName : userName.name;
};

export const getUserInfo = async (db: DatabaseType, userId: string): Promise<FormattedUserTableType> => {
  // user table からユーザ名を取得
  const userNameInfo = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      displayName: user.displayName,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return {
    id: userNameInfo[0].id,
    // ユーザ名をフォーマット
    name: formatUserName({ name: userNameInfo[0].name, displayName: userNameInfo[0].displayName }),
    email: userNameInfo[0].email,
    emailVerified: userNameInfo[0].emailVerified,
    image: userNameInfo[0].image,
    createdAt: userNameInfo[0].createdAt,
    updatedAt: userNameInfo[0].updatedAt,
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
