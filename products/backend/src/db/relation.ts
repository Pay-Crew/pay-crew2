// drizzle
import { relations } from 'drizzle-orm';
import { account, session, user, userProfile } from './auth-schema';
import { debt, group, groupMembership } from './pay-crew2-schema';
// tables
export { user, userProfile, session, account, verification } from './auth-schema';
export { group, groupMembership, debt } from './pay-crew2-schema';

// auth-schema
export const userRelations = relations(user, ({ one, many }) => ({
  userProfiles: one(userProfile, {
    fields: [user.id],
    references: [userProfile.userId],
  }),
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
  debt_creditor: many(debt, {
    relationName: 'user__debt_creditor',
  }),
  debt_debtor: many(debt, {
    relationName: 'user__debt_debtor',
  }),
  debt_deletedByUser: many(debt, {
    relationName: 'user__debt_deletedByUser',
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
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
  creator: one(user, {
    fields: [group.createdBy],
    references: [user.id],
    relationName: 'user__group_creator',
  }),
  memberships: many(groupMembership, { relationName: 'group__group_membership_groupId' }),
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
  creditor: one(user, {
    fields: [debt.creditorId],
    references: [user.id],
    relationName: 'user__debt_creditor',
  }),
  debtor: one(user, {
    fields: [debt.debtorId],
    references: [user.id],
    relationName: 'user__debt_debtor',
  }),
  deletedByUser: one(user, {
    fields: [debt.deletedBy],
    references: [user.id],
    relationName: 'user__debt_deletedByUser',
  }),
}));
