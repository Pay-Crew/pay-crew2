// hono instance
import honoFactory from '../factory/hono';
// validator
import {
  getUserProfileResponseSchema,
  type GetUserProfileResponseSchemaType,
  updateUserProfileRequestSchema,
} from 'validator';
// error schema
import { route } from '../share/error';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { user } from '../../db/auth-schema';

const hono = honoFactory();

//TODO: userProfileの取得
const getUserProfile = route.createSchema(
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
  [401, 500] as const
);

hono.openapi(getUserProfile, async (c) => {
  const loginUser = c.get('user');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* ユーザ情報を取得 (user table) *//
  const userData = await db
    .select({ display_name: user.displayName, avatar_url: user.avatarUrl })
    .from(user)
    .where(eq(user.id, loginUser.id))
    .limit(1);

  // レスポンス
  return c.json(
    {
      display_name: userData[0].display_name === null ? '' : userData[0].display_name,
      avatar_url: userData[0].avatar_url === null ? '' : userData[0].avatar_url,
    } satisfies GetUserProfileResponseSchemaType,
    200
  );
});

//TODO: userProfileの更新
const updateUserProfile = route.createSchema(
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

hono.openapi(updateUserProfile, async (c) => {
  const loginUser = c.get('user');
  const body = c.req.valid('json');

  // データベース接続
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* ユーザ情報を更新 (user table) *//
  await db
    .update(user)
    .set({
      displayName: typeof body.display_name === 'undefined' ? null : body.display_name,
      avatarUrl: typeof body.avatar_url === 'undefined' ? null : body.avatar_url,
    })
    .where(eq(user.id, loginUser.id));

  // レスポンス
  return c.body(null, 204);
});

export default hono;
