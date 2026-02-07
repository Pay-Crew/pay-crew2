import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { groupMembership } from '../../db/pay-crew2-schema';
import type { Db } from '../db';
import { fetchUserNameMap } from './user';

export const ensureGroupMember = async (db: Db, groupId: string, userId: string): Promise<void> => {
  const me = await db
    .select({ groupMembershipId: groupMembership.id })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.userId, userId)))
    .limit(1);

  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
};

export type GroupMemberInfo = {
  user_id: string;
  user_name: string;
};

export const fetchGroupMembers = async (db: Db, groupId: string): Promise<GroupMemberInfo[]> => {
  const memberUserIds = await db
    .select({ userId: groupMembership.userId })
    .from(groupMembership)
    .where(eq(groupMembership.groupId, groupId));

  const userIds = memberUserIds.map((member) => member.userId);
  const nameMap = await fetchUserNameMap(db, userIds);

  return memberUserIds.map((member) => ({
    user_id: member.userId,
    user_name: nameMap.get(member.userId) ?? '',
  }));
};
