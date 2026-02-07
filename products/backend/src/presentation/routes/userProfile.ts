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
import { getUserProfile, updateUserProfile } from '../../application/userProfile';

const hono = honoFactory();

//TODO: userProfileの取得
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
  [401, 500] as const
);

hono.openapi(getUserProfileSchema, async (c) => {
  const loginUser = c.get('user');

  const profile = await getUserProfile(c.env, loginUser.id);

  // レスポンス
  return c.json(profile satisfies GetUserProfileResponseSchemaType, 200);
});

//TODO: userProfileの更新
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

  await updateUserProfile(c.env, loginUser.id, body.display_name);

  // レスポンス
  return c.body(null, 204);
});

export default hono;
