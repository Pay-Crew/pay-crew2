// hono
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
// validator
import {
  type JoinGroupResponseSchemaType,
  type CreateGroupResponseSchemaType,
  type GetGroupInfoResponseSchemaType,
  type GetGroupDebtHistoryResponseSchemaType,
  type GetGroupDebtHistoryResponseElementSchemaType,
} from 'validator';
// drizzle
import { createDbConnection } from './utils/db';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { debt, group, groupMembership } from '../db/schema';
// utils
import { validateIsGroupMember, getGroupMembers } from './utils/group';
import { getUserInfo, getUserNameMap } from './utils/user';

export const createGroupUseCase = async (
  env: Bindings,
  loginUserId: string,
  groupName: string
): Promise<CreateGroupResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  //* グループ情報を挿入 *//
  const result = await db
    .insert(group)
    .values({
      id: crypto.randomUUID(),
      name: groupName,
      inviteId: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
      createdBy: loginUserId,
    })
    .returning({
      id: group.id,
      inviteId: group.inviteId,
    });

  //* グループ作成者をgroupMembershipに挿入 *//
  await db.insert(groupMembership).values({
    id: crypto.randomUUID(),
    groupId: result[0].id,
    userId: loginUserId,
  });

  // レスポンス
  return {
    group_id: result[0].id,
    invite_id: result[0].inviteId,
  } satisfies CreateGroupResponseSchemaType;
};

export const joinGroupUseCase = async (
  env: Bindings,
  loginUserId: string,
  inviteId: string
): Promise<JoinGroupResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  // invite_id から group を取得
  const groupData = await db
    .select({
      id: group.id,
    })
    .from(group)
    .where(eq(group.inviteId, inviteId))
    .limit(1);

  // invite_id が不正な場合はエラー
  if (groupData.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }

  // すでに参加している場合は即座に返す
  const existingMembership = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupData[0].id), eq(groupMembership.userId, loginUserId)))
    .limit(1);

  if (existingMembership.length > 0) {
    // レスポンス
    return {
      group_id: groupData[0].id,
    } satisfies JoinGroupResponseSchemaType;
  }

  // loginUser を invite_id の group に参加させる
  const result = await db
    .insert(groupMembership)
    .values({
      id: crypto.randomUUID(),
      groupId: groupData[0].id,
      userId: loginUserId,
    })
    .returning({
      groupId: groupMembership.groupId,
    });

  // レスポンス
  return {
    group_id: result[0].groupId,
  } satisfies JoinGroupResponseSchemaType;
};

export const getGroupInfoUseCase = async (
  env: Bindings,
  loginUserId: string,
  groupId: string
): Promise<GetGroupInfoResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  // loginUser が グループのメンバーであることを確認
  await validateIsGroupMember(db, groupId, loginUserId);

  //* body.group_id のグループ情報を取得 *//
  const groupData = await db
    .select({
      name: group.name,
      inviteId: group.inviteId,
      createdBy: group.createdBy,
    })
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  //* body.group_id のグループ作成者情報を取得 *//
  // ユーザ情報を取得
  const createdByUserInfo = await getUserInfo(db, groupData[0].createdBy);

  // グループのメンバー情報を取得
  const members = (await getGroupMembers(db, groupId)).map((member) => ({
    user_id: member.id,
    user_name: member.name,
  }));

  // レスポンス
  return {
    group_name: groupData[0].name,
    invite_id: groupData[0].inviteId,
    created_by_id: groupData[0].createdBy,
    created_by_name: createdByUserInfo.name,
    members,
  } satisfies GetGroupInfoResponseSchemaType;
};

export const getGroupDebtHistoryUseCase = async (
  env: Bindings,
  loginUserId: string,
  groupId: string
): Promise<GetGroupDebtHistoryResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  // loginUser がグループのメンバーであることを確認
  await validateIsGroupMember(db, groupId, loginUserId);

  //* グループの貸し借り履歴を取得 *//
  // body.group_id の貸し借り履歴を取得 (debt table)
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

  const userIds = rawDebtData.flatMap((debtEntry) =>
    [debtEntry.debtorId, debtEntry.creditorId, debtEntry.deletedBy].filter((id): id is string => id !== null)
  );

  // ユーザ名の取得
  const uniqueUserIds = Array.from(new Set(userIds));
  const userNameMap = await getUserNameMap(db, uniqueUserIds);

  // 貸し借り履歴データを配列に追加
  const debtData: GetGroupDebtHistoryResponseElementSchemaType[] = rawDebtData.map((debtEntry) => {
    // debt_name, creditor_name を取得
    const debtorName = userNameMap.get(debtEntry.debtorId);
    const creditorName = userNameMap.get(debtEntry.creditorId);
    if (debtorName === undefined || creditorName === undefined) {
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }

    // deleted_by_name を取得
    let deletedByName = null;
    if (debtEntry.deletedBy !== null) {
      // deletedByが存在する場合のみ名前を取得
      const name = userNameMap.get(debtEntry.deletedBy);
      if (name === undefined) {
        throw new HTTPException(500, { message: 'Internal Server Error' });
      }
      deletedByName = name;
    }

    return {
      debt_id: debtEntry.id,
      debtor_id: debtEntry.debtorId,
      debtor_name: debtorName,
      creditor_id: debtEntry.creditorId,
      creditor_name: creditorName,
      amount: debtEntry.amount,
      description: debtEntry.description === null ? '' : debtEntry.description,
      occurred_at: debtEntry.occurredAt,
      deleted_at:
        debtEntry.deletedAt
          ?.toLocaleDateString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replace(/\//g, '-') || null,
      deleted_by_id: debtEntry.deletedBy,
      deleted_by_name: deletedByName,
    };
  });

  // レスポンス
  return {
    debts: debtData,
  } satisfies GetGroupDebtHistoryResponseSchemaType;
};

export const registerGroupDebtUseCase = async (
  env: Bindings,
  loginUserId: string,
  groupId: string,
  creditorId: string,
  debtorId: string,
  amount: number,
  occurredAt: string,
  description: string | undefined
): Promise<void> => {
  // データベース接続
  const db = createDbConnection(env);

  // loginUser が グループのメンバーであることを確認
  await validateIsGroupMember(db, groupId, loginUserId);

  // body.group_id に貸し借り履歴を追加 (debt table)
  await db.insert(debt).values({
    id: crypto.randomUUID(),
    groupId,
    creditorId,
    debtorId,
    amount,
    description: typeof description === 'undefined' ? null : description,
    occurredAt,
  });
};

export const deleteGroupDebtUseCase = async (
  env: Bindings,
  loginUserId: string,
  groupId: string,
  debtId: string
): Promise<void> => {
  // データベース接続
  const db = createDbConnection(env);

  // loginUser が グループのメンバーであることを確認
  await validateIsGroupMember(db, groupId, loginUserId);

  //* body.debt_id の貸し借りの履歴の削除 (論理削除) *//
  await db
    .update(debt)
    .set({
      deletedBy: loginUserId,
      deletedAt: new Date(), // 現在時刻の取得 (UTC)
    })
    .where(and(eq(debt.id, debtId), eq(debt.groupId, groupId), isNull(debt.deletedAt)));
};

export const cancelGroupDebtUseCase = async (
  env: Bindings,
  loginUserId: string,
  groupId: string,
  debtId: string
): Promise<void> => {
  // データベース接続
  const db = createDbConnection(env);

  // loginUser が グループのメンバーであることを確認
  await validateIsGroupMember(db, groupId, loginUserId);

  //* body.debt_id の貸し借りの履歴の削除の取り消し (論理削除の取り消し) *//
  await db
    .update(debt)
    .set({
      deletedBy: null,
      deletedAt: null,
    })
    .where(and(eq(debt.id, debtId), eq(debt.groupId, groupId), isNotNull(debt.deletedAt)));
};
