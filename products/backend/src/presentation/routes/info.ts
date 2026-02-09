// hono instance
import honoFactory from '../factory/hono';
// validator
import {
  getInfoAboutUserTransactionsResponseSchema,
  getInfoAboutGroupsTheUserBelongsToResponseSchema,
  deleteInfoAboutUserRepaymentRequestSchema,
} from 'validator';
// error schema
import { route } from '../share/error';
// application
import {
  getInfoAboutGroupsTheUserBelongsToUseCase,
  getInfoAboutUserTransactionsUseCase,
  deleteInfoUserRepaymentUseCase,
} from '../../application/info';

const hono = honoFactory();

// NOTE: ユーザが参加しているグループ一覧を返す
const getInfoAboutGroupsTheUserBelongsToSchema = route.createSchema(
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
            schema: getInfoAboutGroupsTheUserBelongsToResponseSchema,
          },
        },
      },
    },
  },
  [401, 500] as const
);

hono.openapi(getInfoAboutGroupsTheUserBelongsToSchema, async (c) => {
  const loginUser = c.get('user');

  // ビジネスロジック呼び出し
  const response = await getInfoAboutGroupsTheUserBelongsToUseCase(c.env, loginUser.id);

  // レスポンス
  return c.json(response, 200);
});

// NOTE: ユーザの貸し借りの履歴を返す
const getInfoAboutUserTransactionsSchema = route.createSchema(
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
            schema: getInfoAboutUserTransactionsResponseSchema,
          },
        },
      },
    },
  },
  [401, 500] as const
);

hono.openapi(getInfoAboutUserTransactionsSchema, async (c) => {
  const loginUser = c.get('user');

  // ビジネスロジック呼び出し
  const response = await getInfoAboutUserTransactionsUseCase(c.env, loginUser.id);

  // レスポンス
  return c.json(response, 200);
});

// NOTE: ユーザの返済処理を行う
const deleteInfoUserRepaymentSchema = route.createSchema(
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

hono.openapi(deleteInfoUserRepaymentSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // ビジネスロジック呼び出し
  await deleteInfoUserRepaymentUseCase(c.env, loginUser.id, body.counterparty_id);

  // レスポンス
  return c.body(null, 204);
});

export default hono;
