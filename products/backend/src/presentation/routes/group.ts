// hono instance
import { HTTPException } from 'hono/http-exception';
import honoFactory from '../factory/hono';
// validator
import {
  createGroupRequestSchema,
  createGroupResponseSchema,
  type CreateGroupResponseSchemaType,
  getGroupInfoRequestSchema,
  getGroupInfoResponseSchema,
  type GetGroupInfoResponseSchemaType,
  joinGroupRequestSchema,
  joinGroupResponseSchema,
  type JoinGroupResponseSchemaType,
  getGroupDebtHistoryRequestSchema,
  getGroupDebtHistoryResponseSchema,
  type GetGroupDebtHistoryResponseElementSchemaType,
  type GetGroupDebtHistoryResponseSchemaType,
  GetGroupInfoResponseMemberElementSchemaType,
  registerGroupDebtRequestSchema,
  deleteGroupDebtRequestSchema,
  cancelGroupDebtRequestSchema,
} from 'validator';
// error schema
import { route } from '../share/error';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { group, debt, groupMembership } from '../../db/pay-crew2-schema';
import { user } from '../../db/auth-schema';

const hono = honoFactory();

//TODO: グループ作成エンドポイントの登録
const createGroupSchema = route.createSchema(
  {
    path: '/api/group/create',
    method: 'post',
    description: 'グループを新規作成するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: createGroupRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: createGroupResponseSchema,
          },
        },
      },
    },
  },
  [401, 500] as const
);

hono.openapi(createGroupSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* グループ情報を挿入 *//
  const result = await db
    .insert(group)
    .values({
      id: crypto.randomUUID(),
      name: body.group_name,
      inviteId: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
      createdBy: loginUser.id,
    })
    .returning({
      id: group.id,
      inviteId: group.inviteId,
    });

  //* グループ作成者をgroupMembershipに挿入 *//
  await db.insert(groupMembership).values({
    id: crypto.randomUUID(),
    groupId: result[0].id,
    userId: loginUser.id,
  });

  // レスポンス
  return c.json(
    {
      group_id: result[0].id,
      invite_id: result[0].inviteId,
    } satisfies CreateGroupResponseSchemaType,
    201
  );
});

//TODO: メンバー登録のエンドポイントの登録
const joinGroupSchema = route.createSchema(
  {
    path: '/api/group/join',
    method: 'post',
    description: '招待IDを使ってグループに参加するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: joinGroupRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: joinGroupResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(joinGroupSchema, async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // invite_id から group を取得
  const groupData = await db
    .select({
      id: group.id,
    })
    .from(group)
    .where(eq(group.inviteId, body.invite_id))
    .limit(1);

  // invite_id が不正な場合はエラー
  if (groupData.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }

  // すでに参加している場合は即座に返スす
  const existingMembership = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupData[0].id), eq(groupMembership.userId, user.id)))
    .limit(1);

  if (existingMembership.length > 0) {
    // レスポンス
    return c.json(
      {
        group_id: groupData[0].id,
      } satisfies JoinGroupResponseSchemaType,
      201
    );
  }

  // loginUser を invite_id の group に参加させる
  const result = await db
    .insert(groupMembership)
    .values({
      id: crypto.randomUUID(),
      groupId: groupData[0].id,
      userId: user.id,
    })
    .returning({
      groupId: groupMembership.groupId,
    });

  // レスポンス
  return c.json(
    {
      group_id: result[0].groupId,
    } satisfies JoinGroupResponseSchemaType,
    201
  );
});

//TODO: 各グループ情報取得エンドポイントの登録
const getGroupInfoSchema = route.createSchema(
  {
    path: '/api/group/info',
    method: 'post',
    description: 'get group information',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: getGroupInfoRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: getGroupInfoResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(getGroupInfoSchema, async (c) => {
  const body = c.req.valid('json');
  const loginUser = c.get('user');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // NOTE: --- 共通化開始 ---
  // loginUser が body.group_id のグループのメンバーであることを確認
  const me = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, body.group_id), eq(groupMembership.userId, loginUser.id)))
    .limit(1);

  // body.group_id のグループのメンバーでない場合はエラー
  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  // NOTE: --- 共通化終了 ---

  //* body.group_id のグループ情報を取得 *//
  const groupData = await db
    .select({
      name: group.name,
      inviteId: group.inviteId,
      createdBy: group.createdBy,
    })
    .from(group)
    .where(eq(group.id, body.group_id))
    .limit(1);

  //* body.group_id のグループ作成者情報を取得 *//
  // NOTE: 共通化できそう
  // ユーザ名を取得 (user table)
  const createdByUserNameInfo = await db
    .select({
      name: user.name,
      displayName: user.displayName,
    })
    .from(user)
    .where(eq(user.id, groupData[0].createdBy))
    .limit(1);

  // NOTE: 共通化できそう (info.ts と group.ts で共通化)
  // NOTE: --- 共通化開始 ---
  //* body.group_id のメンバー情報を取得 *//
  // グループメンバーのユーザーIDを取得 (group_membership table)
  const memberUserIds = await db
    .select({
      userId: groupMembership.userId,
    })
    .from(groupMembership)
    .where(eq(groupMembership.groupId, body.group_id));

  // メンバー情報を格納する配列
  const members: GetGroupInfoResponseMemberElementSchemaType[] = [];

  for (const memberUserId of memberUserIds) {
    // NOTE: 共通化できそう
    // ユーザ名を取得 (user table)
    const memberUserNameInfo = await db
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
        memberUserNameInfo[0].displayName !== null && memberUserNameInfo[0].displayName.length > 0
          ? memberUserNameInfo[0].displayName
          : memberUserNameInfo[0].name,
    });
  }
  // NOTE: --- 共通化終了 ---

  // return response
  return c.json(
    {
      group_name: groupData[0].name,
      invite_id: groupData[0].inviteId,
      created_by_id: groupData[0].createdBy,
      created_by_name:
        createdByUserNameInfo[0].displayName !== null && createdByUserNameInfo[0].displayName.length > 0
          ? createdByUserNameInfo[0].displayName
          : createdByUserNameInfo[0].name,
      members: members,
    } satisfies GetGroupInfoResponseSchemaType,
    201
  );
});

// TODO: 各グループの貸し借り履歴取得エンドポイントの登録
const getGroupDebtHistorySchema = route.createSchema(
  {
    path: '/api/group/debt/history',
    method: 'post',
    description: 'get group debt history',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: getGroupDebtHistoryRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: getGroupDebtHistoryResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(getGroupDebtHistorySchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // NOTE: --- 共通化開始 ---
  // loginUser が body.group_id のグループのメンバーであることを確認
  const me = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, body.group_id), eq(groupMembership.userId, loginUser.id)))
    .limit(1);

  // body.group_id のグループのメンバーでない場合はエラー
  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  // NOTE: --- 共通化終了 ---

  //* グループの貸し借り履歴を取得 *//
  // 貸し借り履歴を格納する配列
  let debtData: GetGroupDebtHistoryResponseElementSchemaType[] = [];

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
    .where(eq(debt.groupId, body.group_id));

  for (const debtEntry of rawDebtData) {
    // debt_name を取得
    // NOTE: 共通化できそう
    // ユーザ名を取得 (user table)
    const debtorNameInfo = await db
      .select({
        name: user.name,
        displayName: user.displayName,
      })
      .from(user)
      .where(eq(user.id, debtEntry.debtorId))
      .limit(1);

    // creditor_name を取得
    // NOTE: 共通化できそう
    // ユーザ名を取得 (user table)
    const creditorNameInfo = await db
      .select({
        name: user.name,
        displayName: user.displayName,
      })
      .from(user)
      .where(eq(user.id, debtEntry.creditorId))
      .limit(1);

    // deleted_by_name を取得
    // NOTE: 共通化できそう
    // ユーザ名を取得 (user table)
    let deletedByNameInfo = null;
    if (debtEntry.deletedBy !== null) {
      deletedByNameInfo = await db
        .select({
          name: user.name,
          displayName: user.displayName,
        })
        .from(user)
        .where(eq(user.id, debtEntry.deletedBy))
        .limit(1);
    }

    // 貸し借り履歴データを配列に追加
    debtData.push({
      debt_id: debtEntry.id,
      debtor_id: debtEntry.debtorId,
      debtor_name:
        debtorNameInfo[0].displayName !== null && debtorNameInfo[0].displayName.length > 0
          ? debtorNameInfo[0].displayName
          : debtorNameInfo[0].name,
      creditor_id: debtEntry.creditorId,
      creditor_name:
        creditorNameInfo[0].displayName !== null && creditorNameInfo[0].displayName.length > 0
          ? creditorNameInfo[0].displayName
          : creditorNameInfo[0].name,
      amount: debtEntry.amount,
      description: debtEntry.description === null ? '' : debtEntry.description,
      occurred_at: debtEntry.occurredAt,
      deleted_at: debtEntry.deletedAt?.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' }) || null,
      deleted_by_id: debtEntry.deletedBy,
      deleted_by_name:
        debtEntry.deletedBy && deletedByNameInfo
          ? deletedByNameInfo[0].displayName !== null && deletedByNameInfo[0].displayName.length > 0
            ? deletedByNameInfo[0].displayName
            : deletedByNameInfo[0].name
          : null,
    });
  }

  // レスポンス
  return c.json(
    {
      debts: debtData,
    } satisfies GetGroupDebtHistoryResponseSchemaType,
    201
  );
});

// TODO: 貸し借りの履歴の追加エンドポイントの登録
const registerGroupDebtSchema = route.createSchema(
  {
    path: '/api/group/debt/register',
    method: 'post',
    description: 'register group debt entry',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: registerGroupDebtRequestSchema,
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
  [400, 401, 500] as const
);

hono.openapi(registerGroupDebtSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // NOTE: --- 共通化開始 ---
  // loginUser が body.group_id のグループのメンバーであることを確認
  const me = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, body.group_id), eq(groupMembership.userId, loginUser.id)))
    .limit(1);

  // body.group_id のグループのメンバーでない場合はエラー
  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  // NOTE: --- 共通化終了 ---

  // body.group_id に貸し借り履歴を追加 (debt table)
  await db.insert(debt).values({
    id: crypto.randomUUID(),
    groupId: body.group_id,
    creditorId: body.creditor_id,
    debtorId: body.debtor_id,
    amount: body.amount,
    description: typeof body.description === 'undefined' ? null : body.description,
    occurredAt: body.occurred_at,
  });

  return c.body(null, 204);
});

// TODO: 貸し借りの履歴の削除エンドポイントの登録
const deleteGroupDebtSchema = route.createSchema(
  {
    path: '/api/group/debt/delete',
    method: 'delete',
    description: 'delete group debt entry',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: deleteGroupDebtRequestSchema,
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
  [400, 401, 500] as const
);

hono.openapi(deleteGroupDebtSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // 現在時刻の取得 (UTC)
  const now = new Date();

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // NOTE: --- 共通化開始 ---
  // loginUser が body.group_id のグループのメンバーであることを確認
  const me = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, body.group_id), eq(groupMembership.userId, loginUser.id)))
    .limit(1);

  // body.group_id のグループのメンバーでない場合はエラー
  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  // NOTE: --- 共通化終了 ---

  //* body.debt_id の貸し借りの履歴の削除 (論理削除) *//
  await db
    .update(debt)
    .set({
      deletedBy: loginUser.id,
      deletedAt: now,
    })
    .where(and(eq(debt.id, body.debt_id), eq(debt.groupId, body.group_id), isNull(debt.deletedAt)));

  // レスポンス
  return c.body(null, 204);
});

// TODO: 貸し借り履歴の削除の取り消しエンドポイントの登録
const cancelGroupDebtSchema = route.createSchema(
  {
    path: '/api/group/debt/cancel',
    method: 'post',
    description: 'cancel deleted group debt entry',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: cancelGroupDebtRequestSchema,
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
  [400, 401, 500] as const
);

hono.openapi(cancelGroupDebtSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // NOTE: --- 共通化開始 ---
  // loginUser が body.group_id のグループのメンバーであることを確認
  const me = await db
    .select({
      groupMembershipId: groupMembership.id,
    })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, body.group_id), eq(groupMembership.userId, loginUser.id)))
    .limit(1);

  // body.group_id のグループのメンバーでない場合はエラー
  if (me.length === 0) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  // NOTE: --- 共通化終了 ---

  //* body.debt_id の貸し借りの履歴の削除の取り消し (論理削除の取り消し) *//
  await db
    .update(debt)
    .set({
      deletedBy: null,
      deletedAt: null,
    })
    .where(and(eq(debt.id, body.debt_id), eq(debt.groupId, body.group_id), isNotNull(debt.deletedAt)));

  // レスポンス
  return c.body(null, 204);
});

export default hono;
