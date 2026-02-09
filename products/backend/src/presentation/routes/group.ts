// hono instance
import honoFactory from '../factory/hono';
// validator
import {
  createGroupRequestSchema,
  createGroupResponseSchema,
  getGroupInfoRequestSchema,
  getGroupInfoResponseSchema,
  joinGroupRequestSchema,
  joinGroupResponseSchema,
  getGroupDebtHistoryRequestSchema,
  getGroupDebtHistoryResponseSchema,
  registerGroupDebtRequestSchema,
  deleteGroupDebtRequestSchema,
  cancelGroupDebtRequestSchema,
} from 'validator';
// error schema
import { route } from '../share/error';
// application
import {
  cancelGroupDebtUseCase,
  createGroupUseCase,
  deleteGroupDebtUseCase,
  getGroupDebtHistoryUseCase,
  getGroupInfoUseCase,
  joinGroupUseCase,
  registerGroupDebtUseCase,
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

  // ビジネスロジック呼び出し
  const response = await createGroupUseCase(c.env, loginUser.id, body.group_name);

  // レスポンス
  return c.json(response, 201);
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
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // ビジネスロジック呼び出し
  const response = await joinGroupUseCase(c.env, loginUser.id, body.invite_id);

  // レスポンス
  return c.json(response, 201);
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
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // ビジネスロジック呼び出し
  const response = await getGroupInfoUseCase(c.env, loginUser.id, body.group_id);

  // レスポンス
  return c.json(response, 201);
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

  // ビジネスロジック呼び出し
  const response = await getGroupDebtHistoryUseCase(c.env, loginUser.id, body.group_id);

  // レスポンス
  return c.json(response, 201);
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

  // ビジネスロジック呼び出し
  await registerGroupDebtUseCase(
    c.env,
    loginUser.id,
    body.group_id,
    body.creditor_id,
    body.debtor_id,
    body.amount,
    body.occurred_at,
    body.description
  );

  // レスポンス
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

  // ビジネスロジック呼び出し
  await deleteGroupDebtUseCase(c.env, loginUser.id, body.group_id, body.debt_id);

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

  // ビジネスロジック呼び出し
  await cancelGroupDebtUseCase(c.env, loginUser.id, body.group_id, body.debt_id);

  // レスポンス
  return c.body(null, 204);
});

export default hono;
