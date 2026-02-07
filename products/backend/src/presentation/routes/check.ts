// hono instance
import honoFactory from '../factory/hono';
// validator
import { sessionCheckResponseSchema, type SessionCheckResponseSchemaType } from 'validator';
// error schema
import { route } from '../share/error';
import { getSessionUserInfo } from '../../application/session';

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

  const userInfo = await getSessionUserInfo(c.env, loginUser.id);

  // レスポンス
  return c.json(userInfo satisfies SessionCheckResponseSchemaType, 200);
});

export default hono;
