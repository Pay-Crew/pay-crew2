// hono
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
// validator
import {
  type InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType,
  type InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType,
  type InfoAboutGroupsTheUserBelongsToResponseSchemaType,
  type InfoAboutUserTransactionsResponseSchemaType,
  type InfoAboutUserTransactionsResponseTransactionElementSchemaType,
} from 'validator';
// drizzle
import { createDbConnection } from './utils/db';
import { eq, and, isNull, inArray, or } from 'drizzle-orm';
import { debt, group, groupMembership } from '../db/schema';
// types
import { TransactionType } from './utils/types';
// utils
import { getUserNameMap } from './utils/user';
import { getGroupMembers } from './utils/group';

export const infoAboutGroupsTheUserBelongsToUseCase = async (
  env: Bindings,
  loginUserId: string
): Promise<InfoAboutGroupsTheUserBelongsToResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  //* ユーザが参加しているグループ情報を取得 (group table) *//
  const groupData = await db
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
          .where(eq(groupMembership.userId, loginUserId))
      )
    );

  // createdByのユーザ名の取得
  const uniqueCreatedByIds = Array.from(new Set(groupData.map((group) => group.createdBy)));
  const createdByNameMap = await getUserNameMap(db, uniqueCreatedByIds);

  // グループ情報の整形
  const groupInfo: InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType[] = await Promise.all(
    groupData.map(async (groupData) => {
      // createdByのユーザ名取得
      const createdByName = createdByNameMap.get(groupData.createdBy);
      if (createdByName === undefined) {
        throw new HTTPException(500, { message: 'Internal Server Error' });
      }

      // グループメンバーの取得
      const members = (await getGroupMembers(db, groupData.id)).map((member) => {
        return {
          user_id: member.id,
          user_name: member.name,
        } as InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType;
      });

      return {
        group_id: groupData.id,
        group_name: groupData.name,
        created_by_id: groupData.createdBy,
        created_by_name: createdByName,
        members: members,
      };
    })
  );

  // レスポンス
  return {
    groups: groupInfo,
  } satisfies InfoAboutGroupsTheUserBelongsToResponseSchemaType;
};

export const infoAboutUserTransactionsUseCase = async (
  env: Bindings,
  loginUserId: string
): Promise<InfoAboutUserTransactionsResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  //* loginUserが貸している取引履歴を取得 *//
  // マイナス n 円
  const creditorTransactions = await db
    .select({
      debtorId: debt.debtorId,
      amount: debt.amount,
    })
    .from(debt)
    .where(and(eq(debt.creditorId, loginUserId), isNull(debt.deletedAt)));

  //* loginUserが借りている取引履歴を取得 *//
  // プラス n 円
  const debtorTransactions = await db
    .select({
      creditorId: debt.creditorId,
      amount: debt.amount,
    })
    .from(debt)
    .where(and(eq(debt.debtorId, loginUserId), isNull(debt.deletedAt)));

  //* 取引相手ごとに集計 *//
  // 集計結果を格納するMap
  // Map<userId, { user_id: string; lent_amount: number; borrowed_amount: number }>
  const transactions: Map<string, TransactionType> = new Map();

  // 貸している取引を集計
  for (const creditorTransaction of creditorTransactions) {
    const userId = creditorTransaction.debtorId;
    const amount = creditorTransaction.amount;
    if (!transactions.has(userId)) {
      transactions.set(userId, { user_id: userId, lent_amount: 0, borrowed_amount: 0 });
    }
    const existing = transactions.get(userId)!;
    existing.lent_amount += amount;
  }

  // 借りている取引を集計
  for (const debtorTransaction of debtorTransactions) {
    const userId = debtorTransaction.creditorId;
    const amount = debtorTransaction.amount;
    if (!transactions.has(userId)) {
      transactions.set(userId, { user_id: userId, lent_amount: 0, borrowed_amount: 0 });
    }
    const existing = transactions.get(userId)!;
    existing.borrowed_amount += amount;
  }

  // ユーザ名の取得
  const userIds = Array.from(transactions.keys());
  const userNameMap = await getUserNameMap(db, userIds);

  // 貸し借りの合算
  const aggregatedTransactions: InfoAboutUserTransactionsResponseTransactionElementSchemaType[] = Array.from(
    transactions.values().map((transaction) => {
      // 合算結果: netAmount = borrowed_amount - lent_amount
      const netAmount = transaction.borrowed_amount - transaction.lent_amount;

      // netAmount が 0 の場合はスキップ
      if (netAmount === 0) {
        return null;
      }

      // ユーザ名の取得
      const counterpartyName = userNameMap.get(transaction.user_id);
      if (counterpartyName === undefined) {
        throw new HTTPException(500, { message: 'Internal Server Error' });
      }

      return {
        counterparty_id: transaction.user_id,
        counterparty_name: counterpartyName,
        amount: netAmount,
      } as InfoAboutUserTransactionsResponseTransactionElementSchemaType;
    })
  ).filter((item): item is InfoAboutUserTransactionsResponseTransactionElementSchemaType => item !== null);

  // レスポンス
  return {
    transactions: aggregatedTransactions,
  } satisfies InfoAboutUserTransactionsResponseSchemaType;
};

export const infoUserRepaymentUseCase = async (
  env: Bindings,
  loginUserId: string,
  counterpartyId: string
): Promise<void> => {
  // データベース接続
  const db = createDbConnection(env);

  // loginUser <-> counterparty_id 間の取引履歴を削除（deletedAt, deletedBy をセット）
  await db
    .update(debt)
    .set({
      deletedBy: loginUserId,
      deletedAt: new Date(), // 現在時刻の取得 (UTC)
    })
    .where(
      or(
        and(eq(debt.creditorId, loginUserId), eq(debt.debtorId, counterpartyId), isNull(debt.deletedAt)),
        and(eq(debt.debtorId, loginUserId), eq(debt.creditorId, counterpartyId), isNull(debt.deletedAt))
      )
    );
};
