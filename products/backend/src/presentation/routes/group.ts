// hono instance
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
import {
  cancelGroupDebt,
  createGroup,
  deleteGroupDebt,
  getGroupDebtHistory,
  getGroupInfo,
  joinGroup,
  registerGroupDebt,
} from '../../application/group';

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

  const result = await createGroup(c.env, loginUser.id, body.group_name);

  // レスポンス
  return c.json(
    {
      group_id: result.groupId,
      invite_id: result.inviteId,
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

  const result = await joinGroup(c.env, user.id, body.invite_id);

  // レスポンス
  return c.json(
    {
      group_id: result.groupId,
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

  const groupInfo = await getGroupInfo(c.env, loginUser.id, body.group_id);

  // return response
  return c.json(
    {
      group_name: groupInfo.groupName,
      invite_id: groupInfo.inviteId,
      created_by_id: groupInfo.createdById,
      created_by_name: groupInfo.createdByName,
      members: groupInfo.members as GetGroupInfoResponseMemberElementSchemaType[],
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

  const debtData = await getGroupDebtHistory(c.env, loginUser.id, body.group_id);

  // レスポンス
  return c.json(
    {
      debts: debtData as GetGroupDebtHistoryResponseElementSchemaType[],
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

  await registerGroupDebt(c.env, loginUser.id, {
    groupId: body.group_id,
    creditorId: body.creditor_id,
    debtorId: body.debtor_id,
    amount: body.amount,
    description: body.description,
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

  await deleteGroupDebt(c.env, loginUser.id, { groupId: body.group_id, debtId: body.debt_id });

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

  await cancelGroupDebt(c.env, loginUser.id, { groupId: body.group_id, debtId: body.debt_id });

  // レスポンス
  return c.body(null, 204);
});

export default hono;
