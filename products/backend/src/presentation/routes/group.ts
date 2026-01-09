// hono instance
import { HTTPException } from 'hono/http-exception';
import honoFactory from '../factory/hono';
// validator
import {
  createGroupRequestSchema,
  createGroupResponseSchema,
  type CreateGroupResponseSchemaType,
  getGroupInfoRequestSchema,
  getGroupInfoResponseSchema,
  type GetGroupInfoResponseSchemaType,
  joinGroupRequestSchema,
  joinGroupResponseSchema,
  type JoinGroupResponseSchemaType,
  getGroupDebtHistoryRequestSchema,
  getGroupDebtHistoryResponseSchema,
  type GetGroupDebtHistoryResponseElementSchemaType,
  type GetGroupDebtHistoryResponseSchemaType,
  GetGroupInfoResponseMemberElementSchemaType,
  registerGroupDebtRequestSchema,
  registerGroupDebtResponseSchema,
  type RegisterGroupDebtResponseSchemaType,
  deleteGroupDebtRequestSchema,
  deleteGroupDebtResponseSchema,
  type DeleteGroupDebtResponseSchemaType,
} from 'validator';
// error schema
import { route } from '../share/error';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq, isNull } from 'drizzle-orm';
import { group, debt, groupMembership } from '../../db/pay-crew2-schema';
import { user, userProfile } from '../../db/auth-schema';

const hono = honoFactory();

//TODO: グループ作成エンドポイントの登録
const createGroupSchema = route.createSchema(
  {
    path: '/api/group/create',
    method: 'post',
    description: 'create a new group',
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
  [400, 401, 500] as const
);

hono.openapi(createGroupSchema, async (c) => {
  c.status(201);
  const body = c.req.valid('json');
  const user = c.get('user');

  //validation
  if (!body || !body.name) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  // set group name
  const groupName = body.name;

  // create invited_id
  let uuid1 = crypto.randomUUID();
  let uuid2 = crypto.randomUUID();
  // invite_id format: <uuid1>-<uuid2>
  const invite_id = `${uuid1}-${uuid2}`;

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* insert group data *//
  const result = await db
    .insert(group)
    .values({
      id: crypto.randomUUID(),
      name: groupName,
      invite_id: invite_id,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  //* insert created_by user to groupMembership *//
  await db
    .insert(groupMembership)
    .values({
      id: crypto.randomUUID(),
      groupId: result[0].id,
      userId: user.id,
      joinedAt: new Date(),
    })
    .returning();

  // return response
  return c.json(
    {
      group_id: result[0].id,
      invite_id: result[0].invite_id,
    } satisfies CreateGroupResponseSchemaType,
    201
  );
});

//TODO: メンバー登録のエンドポイントの登録
const joinGroupSchema = route.createSchema(
  {
    path: '/api/group/join',
    method: 'post',
    description: 'join an existing group',
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
  c.status(201);
  const body = c.req.valid('json');
  const user = c.get('user');

  //validation
  if (!body || !body.invite_id) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  const inviteId = body.invite_id;

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // find group by invite_id
  const groupData = await db.select().from(group).where(eq(group.invite_id, inviteId)).limit(1);
  if (groupData.length === 0) {
    // validate invite_id
    throw new HTTPException(401, { message: 'Invalid invite_id' });
  }

  // add user to the group
  const groupId = groupData[0].id;
  const result = await db
    .insert(groupMembership)
    .values({
      id: crypto.randomUUID(),
      groupId: groupId,
      userId: user.id,
      joinedAt: new Date(),
    })
    .returning();

  // return response
  return c.json(
    {
      group_id: result[0].groupId,
    } satisfies JoinGroupResponseSchemaType,
    201
  );
});

//TODO: 各グループ情報取得エンドポイントの登録
const getGroupInfoSchema = route.createSchema(
  {
    path: '/api/group/info',
    method: 'post',
    description: 'get group information',
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
      200: {
        description: 'OK',
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
  c.status(201);
  const body = c.req.valid('json');
  const loginUser = c.get('user');

  // NOTE: このvalidationは、groupのhistoryの取得のエンドポイントでも全く同じものを使うので、共通化を検討すること
  // NOTE: --- 共通化開始 ---
  // validation
  if (!body || !body.group_id) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  const groupId = body.group_id;

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // find me from the group (validation)
  const me = await db
    .select()
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.userId, loginUser.id)))
    .limit(1);
  if (me.length === 0) {
    // validate membership
    throw new HTTPException(401, { message: 'User is not a member of the group' });
  }
  // NOTE: --- 共通化終了 ---

  //* get group info *//
  const groupData = await db.select().from(group).where(eq(group.id, groupId)).limit(1);
  if (groupData.length === 0) {
    // validate group_id
    throw new HTTPException(401, { message: 'Invalid group_id' });
  }

  //* get created_by member's name *//
  const createdByUserId = groupData[0].createdBy;
  let createdByUserName = '';
  // get user name from user table
  const createdByUserInfo = await db.select().from(user).where(eq(user.id, createdByUserId)).limit(1);
  if (createdByUserInfo.length === 0) {
    throw new HTTPException(500, { message: 'The creator of the group was not found' });
  }
  createdByUserName = createdByUserInfo[0].name;
  // get display name from user_profile table
  const createdByDisplayNameInfo = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, createdByUserId))
    .limit(1);
  if (
    createdByDisplayNameInfo.length > 0 &&
    typeof createdByDisplayNameInfo[0].displayName === 'string' &&
    createdByDisplayNameInfo[0].displayName.length > 0
  ) {
    createdByUserName = createdByDisplayNameInfo[0].displayName;
  }

  //* get members *//
  // get all member userIds from groupMembership table
  const membersData = await db.select().from(groupMembership).where(eq(groupMembership.groupId, groupId));
  const memberUserIds = membersData.map((member) => member.userId);
  // get user name or display name for each member
  const members: GetGroupInfoResponseMemberElementSchemaType[] = [];
  for (const memberUserId of memberUserIds) {
    // initialize user name
    let userName = '';

    // get user name from user table
    const userNameInfo = await db.select().from(user).where(eq(user.id, memberUserId)).limit(1);
    if (userNameInfo.length === 0) {
      throw new HTTPException(500, { message: 'A group member was not found' });
    }
    //set user name
    userName = userNameInfo[0].name;

    // get display name from user_profile table
    const displayNameInfo = await db.select().from(userProfile).where(eq(userProfile.userId, memberUserId)).limit(1);
    if (
      displayNameInfo.length > 0 &&
      typeof displayNameInfo[0].displayName === 'string' &&
      displayNameInfo[0].displayName.length > 0
    ) {
      userName = displayNameInfo[0].displayName;
    }

    // push to members array
    members.push({
      user_id: memberUserId,
      user_name: userName,
    });
  }

  // return response
  return c.json(
    {
      group_name: groupData[0].name,
      created_by: createdByUserName,
      members: members,
    } satisfies GetGroupInfoResponseSchemaType,
    200
  );
});

// TODO: 各グループの貸し借り履歴取得エンドポイントの登録
const getGroupDebtHistorySchema = route.createSchema(
  {
    path: '/api/group/debt/history',
    method: 'post',
    description: 'get group debt history',
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
      200: {
        description: 'OK',
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
  c.status(201);
  const body = c.req.valid('json');
  const loginUser = c.get('user');

  // NOTE: このvalidationは、各グループの情報を取得するエンドポイントでも全く同じものを使うので、共通化を検討すること
  // NOTE: --- 共通化開始 ---
  // validation
  if (!body || !body.group_id) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  const groupId = body.group_id;

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // find me from the group (validation)
  const me = await db
    .select()
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.userId, loginUser.id)))
    .limit(1);
  if (me.length === 0) {
    // validate membership
    throw new HTTPException(401, { message: 'User is not a member of the group' });
  }
  // NOTE: --- 共通化終了 ---

  //* get each group debt info *//
  let debtData: GetGroupDebtHistoryResponseElementSchemaType[] = [];
  const rawDebtData = await db
    .select()
    .from(debt)
    .where(and(eq(debt.groupId, groupId), isNull(debt.deletedAt)));
  for (const debtEntry of rawDebtData) {
    // get debtor name from user table
    const debtorInfo = await db.select().from(user).where(eq(user.id, debtEntry.debtorId)).limit(1);
    if (debtorInfo.length === 0) {
      throw new HTTPException(500, { message: 'A debtor user was not found' });
    }
    let debtorName = debtorInfo[0].name;
    // get display name from user_profile table
    const debtorDisplayNameInfo = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, debtEntry.debtorId))
      .limit(1);
    if (
      debtorDisplayNameInfo.length > 0 &&
      typeof debtorDisplayNameInfo[0].displayName === 'string' &&
      debtorDisplayNameInfo[0].displayName.length > 0
    ) {
      debtorName = debtorDisplayNameInfo[0].displayName;
    }

    // get creditor name from user table
    const creditorInfo = await db.select().from(user).where(eq(user.id, debtEntry.creditorId)).limit(1);
    if (creditorInfo.length === 0) {
      throw new HTTPException(500, { message: 'A creditor user was not found' });
    }
    let creditorName = creditorInfo[0].name;
    // get display name from user_profile table
    const creditorDisplayNameInfo = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, debtEntry.creditorId))
      .limit(1);
    if (
      creditorDisplayNameInfo.length > 0 &&
      typeof creditorDisplayNameInfo[0].displayName === 'string' &&
      creditorDisplayNameInfo[0].displayName.length > 0
    ) {
      creditorName = creditorDisplayNameInfo[0].displayName;
    }

    // push to debtData array
    debtData.push({
      debt_id: debtEntry.id,
      debtor_id: debtEntry.debtorId,
      debtor_name: debtorName,
      creditor_id: debtEntry.creditorId,
      creditor_name: creditorName,
      amount: debtEntry.amount,
    });
  }

  // return response
  return c.json(
    {
      debts: debtData,
    } satisfies GetGroupDebtHistoryResponseSchemaType,
    200
  );
});

// TODO: 貸し借りの履歴の追加エンドポイントの登録
const registerGroupDebtSchema = route.createSchema(
  {
    path: '/api/group/debt/register',
    method: 'post',
    description: 'register group debt entry',
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
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: registerGroupDebtResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(registerGroupDebtSchema, async (c) => {
  c.status(201);
  const body = c.req.valid('json');
  const loginUser = c.get('user');

  // NOTE: このvalidationは、各グループの情報を取得するエンドポイントでも全く同じものを使うので、共通化を検討すること
  // NOTE: --- 共通化開始 ---
  // validation
  if (!body || !body.group_id) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  const groupId = body.group_id;

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // find me from the group (validation)
  const me = await db
    .select()
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.userId, loginUser.id)))
    .limit(1);
  if (me.length === 0) {
    // validate membership
    throw new HTTPException(401, { message: 'User is not a member of the group' });
  }
  // NOTE: --- 共通化終了 ---

  // register group debt entry
  const result = await db
    .insert(debt)
    .values({
      id: crypto.randomUUID(),
      groupId: groupId,
      creditorId: body.creditor_id,
      debtorId: body.debtor_id,
      amount: body.amount,
      description: body.description ? body.description : null,
      occurredAt: body.occurred_at ? new Date(body.occurred_at) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedBy: null,
    })
    .returning();

  return c.json(
    {
      creditorId: result[0].creditorId,
      debtorId: result[0].debtorId,
      amount: result[0].amount,
      occurredAt: result[0].occurredAt,
    } satisfies RegisterGroupDebtResponseSchemaType,
    201
  );
});

// TODO: 貸し借りの履歴の削除エンドポイントの登録
const deleteGroupDebtSchema = route.createSchema(
  {
    path: '/api/group/debt/delete',
    method: 'delete',
    description: 'delete group debt entry',
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
      200: {
        description: 'Created',
        content: {
          'application/json': {
            schema: deleteGroupDebtResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(deleteGroupDebtSchema, async (c) => {
  c.status(200);
  const body = c.req.valid('json');
  const loginUser = c.get('user');

  // NOTE: このvalidationは、各グループの情報を取得するエンドポイントでも全く同じものを使うので、共通化を検討すること
  // NOTE: --- 共通化開始 ---
  // validation
  if (!body || !body.group_id) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }
  const groupId = body.group_id;

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // find me from the group (validation)
  const me = await db
    .select()
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.userId, loginUser.id)))
    .limit(1);
  if (me.length === 0) {
    // validate membership
    throw new HTTPException(401, { message: 'User is not a member of the group' });
  }
  // NOTE: --- 共通化終了 ---

  const now = new Date();
  // delete group debt entry (soft delete)
  const result = await db
    .update(debt)
    .set({
      deletedBy: loginUser.id,
      deletedAt: now,
      updatedAt: now,
    })
    .where(and(eq(debt.id, body.debt_id), eq(debt.groupId, groupId)))
    .returning();

  return c.json(
    {
      debt_id: result[0].id,
    } satisfies DeleteGroupDebtResponseSchemaType,
    200
  );
});

export default hono;
