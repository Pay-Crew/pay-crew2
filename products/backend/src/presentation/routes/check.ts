// hono instance
import honoFactory from '../factory/hono';
// validator
import { sessionCheckResponseSchema, type SessionCheckResponseSchemaType } from 'validator';
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
    path: '/api/session',
    method: 'get',
    description: 'セッションが有効か確認するエンドポイント',
    security: [{ SessionCookie: [] }],
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: sessionCheckResponseSchema,
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

  // NOTE: 共通化できそう
  // ユーザ名を取得 (user table)
  const userName = await db
    .select({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
    })
    .from(user)
    .where(eq(user.id, loginUser.id))
    .limit(1);

  // レスポンス
  return c.json(
    {
      user_id: userName[0].id,
      user_name:
        userName[0].displayName !== null && userName[0].displayName.length > 0
          ? userName[0].displayName
          : userName[0].name,
    } satisfies SessionCheckResponseSchemaType,
    200
  );
});

export default hono;
