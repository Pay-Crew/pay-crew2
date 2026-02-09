// hono instance
import honoFactory from '../factory/hono';
// validator
import { sessionCheckResponseSchema, type SessionCheckResponseSchemaType } from 'validator';
// error schema
import { route } from '../share/error';
// application
import { getSessionCheckUseCase } from '../../application/session';

const hono = honoFactory();

//TODO: userProfileの取得
const getSessionCheckSchema = route.createSchema(
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

hono.openapi(getSessionCheckSchema, async (c) => {
  const loginUser = c.get('user');

  // ビジネスロジック呼び出し
  const response = await getSessionCheckUseCase(c.env, loginUser.id);

  // レスポンス
  return c.json(response, 200);
});

export default hono;
