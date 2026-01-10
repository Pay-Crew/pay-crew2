// drizzle
import { relations } from 'drizzle-orm';
// tables
import { account, session, user } from './auth-schema';
import { debt, group, groupMembership } from './pay-crew2-schema';

// auth-schema
export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session, {
    relationName: 'user__session_userId',
  }),
  accounts: many(account, {
    relationName: 'user__account_userId',
  }),
  groups: many(group, {
    relationName: 'user__group_creator',
  }),
  groupMemberships: many(groupMembership, {
    relationName: 'user__group_membership_userId',
  }),
  debts_creditor: many(debt, {
    relationName: 'user__debt_creditor',
  }),
  debts_debtor: many(debt, {
    relationName: 'user__debt_debtor',
  }),
  debts_deletedByUser: many(debt, {
    relationName: 'user__debt_deletedByUser',
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
    relationName: 'user__session_userId',
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
    relationName: 'user__account_userId',
  }),
}));

// pay-crew2-schema
export const groupRelations = relations(group, ({ many, one }) => ({
  user: one(user, {
    fields: [group.createdBy],
    references: [user.id],
    relationName: 'user__group_creator',
  }),
  groupMemberships: many(groupMembership, { relationName: 'group__group_membership_groupId' }),
  debts: many(debt, { relationName: 'group__debt_groupId' }),
}));

export const groupMembershipRelations = relations(groupMembership, ({ one }) => ({
  group: one(group, {
    fields: [groupMembership.groupId],
    references: [group.id],
    relationName: 'group__group_membership_groupId',
  }),
  user: one(user, {
    fields: [groupMembership.userId],
    references: [user.id],
    relationName: 'user__group_membership_userId',
  }),
}));

export const debtRelations = relations(debt, ({ one }) => ({
  group: one(group, {
    fields: [debt.groupId],
    references: [group.id],
    relationName: 'group__debt_groupId',
  }),
  user_creditor: one(user, {
    fields: [debt.creditorId],
    references: [user.id],
    relationName: 'user__debt_creditor',
  }),
  user_debtor: one(user, {
    fields: [debt.debtorId],
    references: [user.id],
    relationName: 'user__debt_debtor',
  }),
  user_deletedByUser: one(user, {
    fields: [debt.deletedBy],
    references: [user.id],
    relationName: 'user__debt_deletedByUser',
  }),
}));
