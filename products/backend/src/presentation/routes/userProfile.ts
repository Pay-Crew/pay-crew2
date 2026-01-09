// hono instance
import { HTTPException } from 'hono/http-exception';
import honoFactory from '../factory/hono';
// validator
import {
  getUserProfileResponseSchema,
  type GetUserProfileResponseSchemaType,
  updateUserProfileRequestSchema,
  updateUserProfileResponseSchema,
  type UpdateUserProfileResponseSchemaType,
} from 'validator';
// error schema
import { route } from '../share/error';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { userProfile } from '../../db/auth-schema';

const hono = honoFactory();

//TODO: userProfileの取得
const getUserProfile = route.createSchema(
  {
    path: '/api/profile',
    method: 'get',
    description: 'get user profile',
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
  [400, 401, 500] as const
);

hono.openapi(getUserProfile, async (c) => {
  const user = c.get('user');

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* get user profile *//
  const userProfileData = await db
    .select({ display_name: userProfile.displayName, avatar_url: userProfile.avatarUrl, bio: userProfile.bio })
    .from(userProfile)
    .where(eq(userProfile.userId, user.id))
    .limit(1);

  if (userProfileData.length === 0) {
    return c.json(
      {
        display_name: '',
        avatar_url: '',
        bio: '',
      } satisfies GetUserProfileResponseSchemaType,
      200
    );
  }

  // return response
  return c.json(
    {
      display_name: userProfileData[0].display_name === null ? '' : userProfileData[0].display_name,
      avatar_url: userProfileData[0].avatar_url === null ? '' : userProfileData[0].avatar_url,
      bio: userProfileData[0].bio === null ? '' : userProfileData[0].bio,
    } satisfies GetUserProfileResponseSchemaType,
    200
  );
});

//TODO: userProfileの更新
const updateUserProfile = route.createSchema(
  {
    path: '/api/profile',
    method: 'put',
    description: 'update user profile',
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
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: updateUserProfileResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(updateUserProfile, async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* check user profile exists *//
  const isUserProfileData = await db
    .select({ display_name: userProfile.displayName, avatar_url: userProfile.avatarUrl, bio: userProfile.bio })
    .from(userProfile)
    .where(eq(userProfile.userId, user.id))
    .limit(1);

  if (isUserProfileData.length === 0) {
    //* insert empty profile *//
    const result = await db.insert(userProfile).values({
      userId: user.id,
      displayName: typeof body.display_name === 'undefined' ? null : body.display_name,
      avatarUrl: typeof body.avatar_url === 'undefined' ? null : body.avatar_url,
      bio: typeof body.bio === 'undefined' ? null : body.bio,
    });

    console.log('Update Result:', result);
  } else {
    //* update user profile *//
    const result = await db
      .update(userProfile)
      .set({
        displayName: typeof body.display_name === 'undefined' ? null : body.display_name,
        avatarUrl: typeof body.avatar_url === 'undefined' ? null : body.avatar_url,
        bio: typeof body.bio === 'undefined' ? null : body.bio,
      })
      .where(eq(userProfile.userId, user.id));

    console.log('Update Result:', result);
  }

  //* get updated user profile *//
  const userProfileData = await db
    .select({ display_name: userProfile.displayName, avatar_url: userProfile.avatarUrl, bio: userProfile.bio })
    .from(userProfile)
    .where(eq(userProfile.userId, user.id))
    .limit(1);

  // validation
  if (userProfileData.length === 0) {
    throw new HTTPException(500, { message: 'Failed to retrieve updated user profile' });
  }

  // return response
  return c.json(
    {
      display_name: userProfileData[0].display_name === null ? '' : userProfileData[0].display_name,
      avatar_url: userProfileData[0].avatar_url === null ? '' : userProfileData[0].avatar_url,
      bio: userProfileData[0].bio === null ? '' : userProfileData[0].bio,
    } satisfies UpdateUserProfileResponseSchemaType,
    200
  );
});

export default hono;
