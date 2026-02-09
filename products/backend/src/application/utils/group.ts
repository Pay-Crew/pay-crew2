// hono
import { HTTPException } from 'hono/http-exception';
// drizzle
import { eq, and } from 'drizzle-orm';
import { groupMembership } from '../../db/schema';
// types
import { DatabaseType, UserInfoType } from './types';
// utils
import { getUserNameMap } from './user';

export const getGroupMembers = async (db: DatabaseType, groupId: string, loginUserId: string): Promise<void> => {
  // loginUser が body.group_id のグループのメンバーであることを確認
  const me = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.userId, loginUserId)))
    .limit(1);

  // body.group_id のグループのメンバーでない場合はエラー
  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
};

export const ensureNotGroupMembership = async (db: DatabaseType, groupId: string): Promise<UserInfoType[]> => {
  // グループに所属しているユーザIDを取得
  const memberUserIds = await db
    .select({ userId: groupMembership.userId })
    .from(groupMembership)
    .where(eq(groupMembership.groupId, groupId));

  // グループに所属しているユーザ名を取得
  const userIds = memberUserIds.map((member) => member.userId);
  const nameMap = await getUserNameMap(db, userIds);

  return memberUserIds.map((member) => {
    const name = nameMap.get(member.userId);
    if (typeof name === 'undefined') {
      // データ整合性の問題として扱い、サーバエラーを返す
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
    return {
      id: member.userId,
      name: name,
    };
  });
};
