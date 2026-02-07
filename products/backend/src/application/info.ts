import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { debt, group, groupMembership } from '../db/pay-crew2-schema';
import type { Bindings } from '../types';
import { createDb } from './db';
import { fetchGroupMembers } from './shared/group';
import { fetchUserDisplayName, fetchUserNameMap } from './shared/user';
import type { TransactionType } from './types';

export const getGroupsForUser = async (
  env: Bindings,
  userId: string
): Promise<
  {
    group_id: string;
    group_name: string;
    created_by_id: string;
    created_by_name: string;
    members: Awaited<ReturnType<typeof fetchGroupMembers>>;
  }[]
> => {
  const db = createDb(env);

  const groupsData = await db
    .select({
      id: group.id,
      name: group.name,
      createdBy: group.createdBy,
    })
    .from(group)
    .where(
      inArray(
        group.id,
        db
          .select({ groupId: groupMembership.groupId })
          .from(groupMembership)
          .where(eq(groupMembership.userId, userId))
      )
    );

  const groupInfo = [] as {
    group_id: string;
    group_name: string;
    created_by_id: string;
    created_by_name: string;
    members: Awaited<ReturnType<typeof fetchGroupMembers>>;
  }[];

  for (const groupData of groupsData) {
    const createdByName = await fetchUserDisplayName(db, groupData.createdBy);
    const members = await fetchGroupMembers(db, groupData.id);

    groupInfo.push({
      group_id: groupData.id,
      group_name: groupData.name,
      created_by_id: groupData.createdBy,
      created_by_name: createdByName,
      members,
    });
  }

  return groupInfo;
};

export const getUserTransactions = async (
  env: Bindings,
  userId: string
): Promise<{ counterparty_id: string; counterparty_name: string; amount: number }[]> => {
  const db = createDb(env);

  const creditorTransactions = await db
    .select({
      debtorId: debt.debtorId,
      amount: debt.amount,
    })
    .from(debt)
    .where(and(eq(debt.creditorId, userId), isNull(debt.deletedAt)));

  const debtorTransactions = await db
    .select({
      creditorId: debt.creditorId,
      amount: debt.amount,
    })
    .from(debt)
    .where(and(eq(debt.debtorId, userId), isNull(debt.deletedAt)));

  const transactions: Map<string, TransactionType> = new Map();

  for (const creditorTransaction of creditorTransactions) {
    const counterpartyId = creditorTransaction.debtorId;
    if (!transactions.has(counterpartyId)) {
      transactions.set(counterpartyId, { user_id: counterpartyId, lent_amount: 0, borrowed_amount: 0 });
    }
    const existing = transactions.get(counterpartyId)!;
    existing.lent_amount += creditorTransaction.amount;
  }

  for (const debtorTransaction of debtorTransactions) {
    const counterpartyId = debtorTransaction.creditorId;
    if (!transactions.has(counterpartyId)) {
      transactions.set(counterpartyId, { user_id: counterpartyId, lent_amount: 0, borrowed_amount: 0 });
    }
    const existing = transactions.get(counterpartyId)!;
    existing.borrowed_amount += debtorTransaction.amount;
  }

  const counterpartyIds = Array.from(transactions.keys());
  const nameMap = await fetchUserNameMap(db, counterpartyIds);

  const aggregatedTransactions: { counterparty_id: string; counterparty_name: string; amount: number }[] = [];

  for (const transaction of transactions.values()) {
    const netAmount = transaction.borrowed_amount - transaction.lent_amount;
    if (netAmount !== 0) {
      aggregatedTransactions.push({
        counterparty_id: transaction.user_id,
        counterparty_name: nameMap.get(transaction.user_id) ?? '',
        amount: netAmount,
      });
    }
  }

  return aggregatedTransactions;
};

export const repayUserTransactions = async (
  env: Bindings,
  userId: string,
  counterpartyId: string
): Promise<void> => {
  const db = createDb(env);
  const now = new Date();

  await db
    .update(debt)
    .set({
      deletedBy: userId,
      deletedAt: now,
    })
    .where(
      or(
        and(eq(debt.creditorId, userId), eq(debt.debtorId, counterpartyId), isNull(debt.deletedAt)),
        and(eq(debt.debtorId, userId), eq(debt.creditorId, counterpartyId), isNull(debt.deletedAt))
      )
    );
};
