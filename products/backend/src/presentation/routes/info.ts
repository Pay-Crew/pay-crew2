// hono instance
import honoFactory from '../factory/hono';
// validator
import {
  infoAboutUserTransactionsResponseSchema,
  type InfoAboutUserTransactionsResponseTransactionElementSchemaType,
  type InfoAboutUserTransactionsResponseSchemaType,
  infoAboutGroupsTheUserBelongsToResponseSchema,
  type InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType,
  type InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType,
  type InfoAboutGroupsTheUserBelongsToResponseSchemaType,
  deleteInfoAboutUserRepaymentRequestSchema,
} from 'validator';
// error schema
import { route } from '../share/error';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, or, eq, inArray, isNull } from 'drizzle-orm';
import { group, debt, groupMembership } from '../../db/pay-crew2-schema';
import { user } from '../../db/auth-schema';
// types
import { TransactionType } from '../utils/types';

const hono = honoFactory();

//TODO: ユーザが参加しているグループ一覧を返す
const infoAboutGroupsTheUserBelongsToSchema = route.createSchema(
  {
    path: '/api/info/group',
    method: 'get',
    description: 'ログインユーザーが参加しているグループ一覧を取得するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: infoAboutGroupsTheUserBelongsToResponseSchema,
          },
        },
      },
    },
  },
  [401, 500] as const
);

hono.openapi(infoAboutGroupsTheUserBelongsToSchema, async (c) => {
  const loginUser = c.get('user');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

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
          .where(eq(groupMembership.userId, loginUser.id))
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
  return c.json(
    {
      groups: groupInfo,
    } satisfies InfoAboutGroupsTheUserBelongsToResponseSchemaType,
    200
  );
});

//TODO: ユーザの貸し借りの履歴を返す
const infoAboutUserTransactionsSchema = route.createSchema(
  {
    path: '/api/info/transaction',
    method: 'get',
    description: 'ログインユーザーの貸し借りの履歴を取得するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: infoAboutUserTransactionsResponseSchema,
          },
        },
      },
    },
  },
  [401, 500] as const
);

hono.openapi(infoAboutUserTransactionsSchema, async (c) => {
  const loginUser = c.get('user');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* loginUserが貸している取引履歴を取得 *//
  // マイナス n 円
  const creditorTransactions = await db
    .select({
      debtorId: debt.debtorId,
      amount: debt.amount,
    })
    .from(debt)
    .where(and(eq(debt.creditorId, loginUser.id), isNull(debt.deletedAt)));

  //* loginUserが借りている取引履歴を取得 *//
  // プラス n 円
  const debtorTransactions = await db
    .select({
      creditorId: debt.creditorId,
      amount: debt.amount,
    })
    .from(debt)
    .where(and(eq(debt.debtorId, loginUser.id), isNull(debt.deletedAt)));

  //* 取引相手ごとに集計 *//
  // 集計結果を格納するMap
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
  return c.json(
    {
      transactions: aggregatedTransactions,
    } satisfies InfoAboutUserTransactionsResponseSchemaType,
    200
  );
});

//TODO: ユーザの返済処理を行う
const infoUserRepaymentSchema = route.createSchema(
  {
    path: '/api/info/transaction',
    method: 'delete',
    description: 'ログインユーザーと指定された取引相手間の取引履歴を削除する (完済する) エンドポイント',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: deleteInfoAboutUserRepaymentRequestSchema,
          },
        },
      },
    },
    responses: {
      204: {
        description: 'No Content',
      },
    },
  },
  [401, 500] as const
);

hono.openapi(infoUserRepaymentSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  const now = new Date();
  // loginUser <-> counterparty_id 間の取引履歴を削除（deletedAt, deletedBy をセット）
  await db
    .update(debt)
    .set({
      deletedBy: loginUser.id,
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      or(
        and(eq(debt.creditorId, loginUser.id), eq(debt.debtorId, body.counterparty_id), isNull(debt.deletedAt)),
        and(eq(debt.debtorId, loginUser.id), eq(debt.creditorId, body.counterparty_id), isNull(debt.deletedAt))
      )
    );

  // レスポンス
  return c.body(null, 204);
});

export default hono;
