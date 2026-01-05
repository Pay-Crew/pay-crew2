// drizzle
import { pgTable, text, timestamp, index, uuid, uniqueIndex, integer } from 'drizzle-orm/pg-core';
//auth-schema
import { user } from './auth-schema';

export const group = pgTable(
  'group',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  // name に対する二次索引を作成
  (table) => [index('group_name_idx').on(table.name)]
);

export const groupMembership = pgTable(
  'group_membership',
  {
    id: uuid('id').primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    // groupId と userId の組み合わせが一意であることを保証
    uniqueIndex('group_membership_groupId_userId_idx').on(table.groupId, table.userId),
    // groupId と userId に対する二次索引を作成
    index('group_membership_userId_idx').on(table.userId),
    index('group_membership_groupId_idx').on(table.groupId),
  ]
);

export const debt = pgTable(
  'debt',
  {
    id: uuid('id').primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => group.id, { onDelete: 'cascade' }),
    creditorId: text('creditor_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    debtorId: text('debtor_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    description: text('description'),
    occurredAt: timestamp('occurred_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp('deleted_at'),
    deletedBy: text('deleted_by').references(() => user.id, { onDelete: 'set null' }),
  },
  (table) => [
    // groupId と creditorId と debtorId に対する二次索引を作成
    index('debt_groupId_idx').on(table.groupId),
    index('debt_creditorId_idx').on(table.creditorId),
    index('debt_debtorId_idx').on(table.debtorId),
  ]
);
