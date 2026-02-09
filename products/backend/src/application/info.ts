// hono
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
import { user } from '../db/auth-schema';
import { debt, group, groupMembership } from '../db/schema';
import { TransactionType } from './utils/types';

// TODO: 共通化
export const infoAboutGroupsTheUserBelongsToUseCase = async (
  env: Bindings,
  loginUserId: string
): Promise<InfoAboutGroupsTheUserBelongsToResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  // グループ情報格納用配列
  let groupInfo: InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType[] = [];

  //* ユーザが参加しているグループ情報を取得 (group table) *//
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
          .where(eq(groupMembership.userId, loginUserId))
      )
    );

  for (const groupData of groupsData) {
    //* body.group_id のグループ作成者情報を取得 *//
    // NOTE: 共通化できそう
    // ユーザ名を取得 (user table)
    const createdByUserNameInfo = await db
      .select({
        name: user.name,
        displayName: user.displayName,
      })
      .from(user)
      .where(eq(user.id, groupData.createdBy))
      .limit(1);

    // NOTE: --- 共通化開始 ---
    //* groupData.id のメンバー情報を取得 *//
    // グループメンバーのユーザーIDを取得 (group_membership table)
    const memberUserIds = await db
      .select({
        userId: groupMembership.userId,
      })
      .from(groupMembership)
      .where(eq(groupMembership.groupId, groupData.id));

    // メンバー情報を格納する配列
    const members: InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType[] = [];

    for (const memberUserId of memberUserIds) {
      // NOTE: 共通化できそう
      // ユーザ名を取得 (user table)
      const userNameInfo = await db
        .select({
          name: user.name,
          displayName: user.displayName,
        })
        .from(user)
        .where(eq(user.id, memberUserId.userId))
        .limit(1);

      // メンバー情報を配列に追加
      members.push({
        user_id: memberUserId.userId,
        user_name:
          userNameInfo[0].displayName !== null && userNameInfo[0].displayName.length > 0
            ? userNameInfo[0].displayName
            : userNameInfo[0].name,
      });
    }
    // NOTE: --- 共通化終了 ---

    // グループ情報を配列に追加
    groupInfo.push({
      group_id: groupData.id,
      group_name: groupData.name,
      created_by_id: groupData.createdBy,
      created_by_name:
        createdByUserNameInfo[0].displayName !== null && createdByUserNameInfo[0].displayName.length > 0
          ? createdByUserNameInfo[0].displayName
          : createdByUserNameInfo[0].name,
      members: members,
    });
  }

  // レスポンス
  return {
    groups: groupInfo,
  } satisfies InfoAboutGroupsTheUserBelongsToResponseSchemaType;
};

// TODO: 共通化
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

  // 集計結果を格納する配列
  const aggregatedTransactions: InfoAboutUserTransactionsResponseTransactionElementSchemaType[] = [];

  // 貸し借りの合算
  for (const transaction of transactions.values()) {
    // 合算結果: netAmount = borrowed_amount - lent_amount
    const netAmount = transaction.borrowed_amount - transaction.lent_amount;

    // NOTE: 共通化できそう
    // ユーザ名を取得 (user table)
    const userNameInfo = await db
      .select({
        name: user.name,
        displayName: user.displayName,
      })
      .from(user)
      .where(eq(user.id, transaction.user_id))
      .limit(1);

    // netAmount が 0 でない場合のみ配列に追加
    if (netAmount !== 0) {
      aggregatedTransactions.push({
        counterparty_id: transaction.user_id,
        counterparty_name:
          userNameInfo[0].displayName !== null && userNameInfo[0].displayName.length > 0
            ? userNameInfo[0].displayName
            : userNameInfo[0].name,
        amount: netAmount,
      });
    }
  }

  // return response
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
