// hono instance
import honoFactory from '../factory/hono';
// validator
import {
  infoAboutUserTransactionsResponseSchema,
  infoAboutGroupsTheUserBelongsToResponseSchema,
  deleteInfoAboutUserRepaymentRequestSchema,
} from 'validator';
// error schema
import { route } from '../share/error';
// types
import {
  infoAboutGroupsTheUserBelongsToUseCase,
  infoAboutUserTransactionsUseCase,
  infoUserRepaymentUseCase,
} from '../../application/info';

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

  // ビジネスロジック呼び出し
  const response = await infoAboutGroupsTheUserBelongsToUseCase(c.env, loginUser.id);

  // レスポンス
  return c.json(response, 200);
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

  // ビジネスロジック呼び出し
  const response = await infoAboutUserTransactionsUseCase(c.env, loginUser.id);

  // レスポンス
  return c.json(response, 200);
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

  // ビジネスロジック呼び出し
  await infoUserRepaymentUseCase(c.env, loginUser.id, body.counterparty_id);

  // レスポンス
  return c.body(null, 204);
});

export default hono;
