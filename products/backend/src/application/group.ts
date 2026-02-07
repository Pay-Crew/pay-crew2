import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { group, debt, groupMembership } from '../db/pay-crew2-schema';
import type { Bindings } from '../types';
import { createDb } from './db';
import { ensureGroupMember, fetchGroupMembers } from './shared/group';
import { fetchUserDisplayName, fetchUserNameMap } from './shared/user';

export const createGroup = async (
  env: Bindings,
  userId: string,
  groupName: string
): Promise<{ groupId: string; inviteId: string }> => {
  const db = createDb(env);

  const result = await db
    .insert(group)
    .values({
      id: crypto.randomUUID(),
      name: groupName,
      inviteId: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
      createdBy: userId,
    })
    .returning({
      id: group.id,
      inviteId: group.inviteId,
    });

  await db.insert(groupMembership).values({
    id: crypto.randomUUID(),
    groupId: result[0].id,
    userId: userId,
  });

  return { groupId: result[0].id, inviteId: result[0].inviteId };
};

export const joinGroup = async (
  env: Bindings,
  userId: string,
  inviteId: string
): Promise<{ groupId: string }> => {
  const db = createDb(env);

  const groupData = await db
    .select({ id: group.id })
    .from(group)
    .where(eq(group.inviteId, inviteId))
    .limit(1);

  if (groupData.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }

  const existingMembership = await db
    .select({ groupMembershipId: groupMembership.id })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupData[0].id), eq(groupMembership.userId, userId)))
    .limit(1);

  if (existingMembership.length > 0) {
    return { groupId: groupData[0].id };
  }

  const result = await db
    .insert(groupMembership)
    .values({
      id: crypto.randomUUID(),
      groupId: groupData[0].id,
      userId: userId,
    })
    .returning({ groupId: groupMembership.groupId });

  return { groupId: result[0].groupId };
};

export const getGroupInfo = async (
  env: Bindings,
  userId: string,
  groupId: string
): Promise<{
  groupName: string;
  inviteId: string;
  createdById: string;
  createdByName: string;
  members: Awaited<ReturnType<typeof fetchGroupMembers>>;
}> => {
  const db = createDb(env);

  await ensureGroupMember(db, groupId, userId);

  const groupData = await db
    .select({
      name: group.name,
      inviteId: group.inviteId,
      createdBy: group.createdBy,
    })
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  const createdByName = await fetchUserDisplayName(db, groupData[0].createdBy);
  const members = await fetchGroupMembers(db, groupId);

  return {
    groupName: groupData[0].name,
    inviteId: groupData[0].inviteId,
    createdById: groupData[0].createdBy,
    createdByName,
    members,
  };
};

export type GroupDebtHistoryEntry = {
  debt_id: string;
  debtor_id: string;
  debtor_name: string;
  creditor_id: string;
  creditor_name: string;
  amount: number;
  description: string;
  occurred_at: Date;
  deleted_at: string | null;
  deleted_by_id: string | null;
  deleted_by_name: string | null;
};

export const getGroupDebtHistory = async (
  env: Bindings,
  userId: string,
  groupId: string
): Promise<GroupDebtHistoryEntry[]> => {
  const db = createDb(env);

  await ensureGroupMember(db, groupId, userId);

  const rawDebtData = await db
    .select({
      id: debt.id,
      debtorId: debt.debtorId,
      creditorId: debt.creditorId,
      amount: debt.amount,
      description: debt.description,
      occurredAt: debt.occurredAt,
      deletedAt: debt.deletedAt,
      deletedBy: debt.deletedBy,
    })
    .from(debt)
    .where(eq(debt.groupId, groupId));

  const userIds = rawDebtData.flatMap((entry) =>
    [entry.debtorId, entry.creditorId, entry.deletedBy].filter((value): value is string => value !== null)
  );
  const nameMap = await fetchUserNameMap(db, userIds);

  return rawDebtData.map((entry) => ({
    debt_id: entry.id,
    debtor_id: entry.debtorId,
    debtor_name: nameMap.get(entry.debtorId) ?? '',
    creditor_id: entry.creditorId,
    creditor_name: nameMap.get(entry.creditorId) ?? '',
    amount: entry.amount,
    description: entry.description === null ? '' : entry.description,
    occurred_at: entry.occurredAt,
    deleted_at:
      entry.deletedAt
        ?.toLocaleDateString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '-') || null,
    deleted_by_id: entry.deletedBy,
    deleted_by_name: entry.deletedBy ? nameMap.get(entry.deletedBy) ?? null : null,
  }));
};

export const registerGroupDebt = async (
  env: Bindings,
  userId: string,
  payload: {
    groupId: string;
    creditorId: string;
    debtorId: string;
    amount: number;
    description?: string;
    occurredAt: Date;
  }
): Promise<void> => {
  const db = createDb(env);

  await ensureGroupMember(db, payload.groupId, userId);

  await db.insert(debt).values({
    id: crypto.randomUUID(),
    groupId: payload.groupId,
    creditorId: payload.creditorId,
    debtorId: payload.debtorId,
    amount: payload.amount,
    description: typeof payload.description === 'undefined' ? null : payload.description,
    occurredAt: payload.occurredAt,
  });
};

export const deleteGroupDebt = async (
  env: Bindings,
  userId: string,
  payload: { groupId: string; debtId: string }
): Promise<void> => {
  const db = createDb(env);

  await ensureGroupMember(db, payload.groupId, userId);

  const now = new Date();

  await db
    .update(debt)
    .set({
      deletedBy: userId,
      deletedAt: now,
    })
    .where(and(eq(debt.id, payload.debtId), eq(debt.groupId, payload.groupId), isNull(debt.deletedAt)));
};

export const cancelGroupDebt = async (
  env: Bindings,
  userId: string,
  payload: { groupId: string; debtId: string }
): Promise<void> => {
  const db = createDb(env);

  await ensureGroupMember(db, payload.groupId, userId);

  await db
    .update(debt)
    .set({
      deletedBy: null,
      deletedAt: null,
    })
    .where(and(eq(debt.id, payload.debtId), eq(debt.groupId, payload.groupId), isNotNull(debt.deletedAt)));
};
