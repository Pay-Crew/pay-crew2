// hono instance
import honoFactory from '../factory/hono';
// validator
import { getUserProfileResponseSchema, updateUserProfileRequestSchema } from 'validator';
// error schema
import { route } from '../share/error';
// application layer use cases
import { getUserProfileUseCase, updateUserProfileUseCase } from '../../application/userProfile';

const hono = honoFactory();

// NOTE: userProfileの取得
const getUserProfileSchema = route.createSchema(
  {
    path: '/api/profile',
    method: 'get',
    description: 'ログインユーザーのプロフィール情報を取得するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: getUserProfileResponseSchema,
          },
        },
      },
    },
  },
  [401, 404, 500] as const
);

hono.openapi(getUserProfileSchema, async (c) => {
  const loginUser = c.get('user');

  // ビジネスロジック呼び出し
  const response = await getUserProfileUseCase(c.env, loginUser.id);

  // レスポンス
  return c.json(response, 200);
});

// NOTE: userProfileの更新
const updateUserProfileSchema = route.createSchema(
  {
    path: '/api/profile',
    method: 'patch',
    description: 'ログインユーザーのプロフィール情報を更新するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: updateUserProfileRequestSchema,
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

hono.openapi(updateUserProfileSchema, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // ビジネスロジック呼び出し
  await updateUserProfileUseCase(c.env, loginUser.id, body.display_name);

  // レスポンス
  return c.body(null, 204);
});

export default hono;
