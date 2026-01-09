// hono instance
import { HTTPException } from 'hono/http-exception';
import honoFactory from '../factory/hono';
// validator
import {
  infoAboutUserTransactionsResponseSchema,
  type InfoAboutUserTransactionsResponseTransactionElementSchemaType,
  type InfoAboutUserTransactionsResponseSchemaType,
  infoAboutGroupsTheUserBelongsToResponseSchema,
  type InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType,
  type InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType,
  type InfoAboutGroupsTheUserBelongsToResponseSchemaType,
  deleteInfoAboutUserRepaymentRequestSchema,
  deleteInfoAboutUserRepaymentResponseSchema,
  DeleteInfoAboutUserRepaymentResponseSchemaType,
} from 'validator';
// error schema
import { route } from '../share/error';
// drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, or, eq, inArray, isNull } from 'drizzle-orm';
import { group, debt, groupMembership } from '../../db/pay-crew2-schema';
import { user, userProfile } from '../../db/auth-schema';

const hono = honoFactory();

//TODO: ユーザが参加しているグループ一覧を返す
const infoAboutGroupsTheUserBelongsToSchema = route.createSchema(
  {
    path: '/api/info/group',
    method: 'get',
    description: 'get info about groups the user belongs to',
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

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  //* get group info that belongs to the user *//
  let groupInfo: InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType[] = [];
  const groupsData = await db
    .select({
      id: group.id,
      name: group.name,
      createdBy: group.createdBy,
    })
    .from(group)
    .where(
      inArray(
        group.id,
        db
          .select({ groupId: groupMembership.groupId })
          .from(groupMembership)
          .where(eq(groupMembership.userId, loginUser.id))
      )
    );

  for (const groupData of groupsData) {
    //* get members *//
    // get all member userIds from groupMembership table
    const membersData = await db.select().from(groupMembership).where(eq(groupMembership.groupId, groupData.id));
    const memberUserIds = membersData.map((member) => member.userId);
    // get user name or display name for each member
    const members: InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType[] = [];
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
    // push to groupInfo array
    groupInfo.push({
      group_id: groupData.id,
      group_name: groupData.name,
      created_by: groupData.createdBy,
      members: members,
    });
  }

  // return response
  return c.json(
    {
      groups: groupInfo,
    } satisfies InfoAboutGroupsTheUserBelongsToResponseSchemaType,
    200
  );
});

//TODO: ユーザの貸し借りの履歴を返す
const infoAboutUserTransactionsSchema = route.createSchema(
  {
    path: '/api/info/transaction',
    method: 'get',
    description: 'get info about user transactions',
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

type TransactionType = {
  user_id: string; // 取引相手のユーザID
  lent_amount: number; // 貸した金額
  borrowed_amount: number; // 借りた金額
};

hono.openapi(infoAboutUserTransactionsSchema, async (c) => {
  const loginUser = c.get('user');

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  // loginUserが貸している取引履歴を取得
  // マイナス n 円
  const creditorTransactions = await db
    .select()
    .from(debt)
    .where(and(eq(debt.creditorId, loginUser.id), isNull(debt.deletedAt)));

  // loginUserが借りている取引履歴を取得
  // プラス n 円
  const debtorTransactions = await db
    .select()
    .from(debt)
    .where(and(eq(debt.debtorId, loginUser.id), isNull(debt.deletedAt)));

  // 取引相手ごとに集計
  const transactions: Map<string, TransactionType> = new Map();

  // 貸している取引を集計
  for (const transaction of creditorTransactions) {
    const userId = transaction.debtorId;
    const amount = transaction.amount;
    if (!transactions.has(userId)) {
      transactions.set(userId, { user_id: userId, lent_amount: 0, borrowed_amount: 0 });
    }
    const existing = transactions.get(userId)!;
    existing.lent_amount += amount;
  }

  // 借りている取引を集計
  for (const transaction of debtorTransactions) {
    const userId = transaction.creditorId;
    const amount = transaction.amount;
    if (!transactions.has(userId)) {
      transactions.set(userId, { user_id: userId, lent_amount: 0, borrowed_amount: 0 });
    }
    const existing = transactions.get(userId)!;
    existing.borrowed_amount += amount;
  }

  // netAmount の計算
  const aggregatedTransactions: InfoAboutUserTransactionsResponseTransactionElementSchemaType[] = [];
  for (const transaction of transactions.values()) {
    // calculate net amount: netAmount = borrowed_amount - lent_amount
    const netAmount = transaction.borrowed_amount - transaction.lent_amount;

    let userName = '';
    // get user name from user table
    const userInfo = await db.select().from(user).where(eq(user.id, transaction.user_id)).limit(1);
    if (userInfo.length === 0) {
      throw new HTTPException(500, { message: 'A transaction counterparty was not found' });
    }
    userName = userInfo[0].name;
    // get display name from user_profile table
    const displayNameInfo = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, transaction.user_id))
      .limit(1);
    if (
      displayNameInfo.length > 0 &&
      typeof displayNameInfo[0].displayName === 'string' &&
      displayNameInfo[0].displayName.length > 0
    ) {
      userName = displayNameInfo[0].displayName;
    }

    // push to aggregatedTransactions array if netAmount is not zero
    if (netAmount !== 0) {
      aggregatedTransactions.push({
        counterparty_id: transaction.user_id,
        counterparty_name: userName,
        amount: netAmount,
      });
    }
  }

  // return response
  return c.json(
    {
      transactions: aggregatedTransactions,
    } satisfies InfoAboutUserTransactionsResponseSchemaType,
    200
  );
});

//TODO: ユーザの返済処理を行う
const infoUserRepaymentSchema = route.createSchema(
  {
    path: '/api/info/transaction',
    method: 'delete',
    description: 'do user repayment',
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
      200: {
        description: 'Deleted',
        content: {
          'application/json': {
            schema: deleteInfoAboutUserRepaymentResponseSchema,
          },
        },
      },
    },
  },
  [400, 401, 500] as const
);

hono.openapi(infoUserRepaymentSchema, async (c) => {
  const body = c.req.valid('json');
  const loginUser = c.get('user');

  // validation
  if (!body || !body.counterparty_id) {
    throw new HTTPException(400, { message: 'Bad Request' });
  }

  // connect to db
  const db = drizzle({ connection: c.env.HYPERDRIVE });

  const now = new Date();
  // loginUser <-> counterparty_id 間の取引履歴を削除（deletedAt, deletedBy をセット）
  const creditorTransactions = await db
    .update(debt)
    .set({
      deletedBy: loginUser.id,
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      or(
        and(eq(debt.creditorId, loginUser.id), eq(debt.debtorId, body.counterparty_id), isNull(debt.deletedAt)),
        and(eq(debt.debtorId, loginUser.id), eq(debt.creditorId, body.counterparty_id), isNull(debt.deletedAt))
      )
    )
    .returning();

  // return response
  return c.json(
    {
      counterparty_id: body.counterparty_id,
    } satisfies DeleteInfoAboutUserRepaymentResponseSchemaType,
    200
  );
});

export default hono;
