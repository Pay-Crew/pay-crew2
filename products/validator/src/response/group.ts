import { z } from '@hono/zod-openapi';

export const createGroupResponseSchema = z.object({
  group_id: z.uuid(),
  invite_id: z.string().min(1),
});

export type CreateGroupResponseSchemaType = z.infer<typeof createGroupResponseSchema>;

export const joinGroupResponseSchema = z.object({
  group_id: z.uuid(),
});

export type JoinGroupResponseSchemaType = z.infer<typeof joinGroupResponseSchema>;

export const getGroupInfoResponseMemberElementSchema = z.object({
  user_id: z.string().min(1),
  user_name: z.string().min(1),
});

export const getGroupInfoResponseSchema = z.object({
  group_name: z.uuid(),
  created_by: z.string().min(1),
  members: z.array(getGroupInfoResponseMemberElementSchema),
});

export type GetGroupInfoResponseMemberElementSchemaType = z.infer<typeof getGroupInfoResponseMemberElementSchema>;
export type GetGroupInfoResponseSchemaType = z.infer<typeof getGroupInfoResponseSchema>;

export const getGroupDebtHistoryResponseElementSchema = z.object({
  debt_id: z.string().min(1),
  debtor_id: z.string().min(1),
  debtor_name: z.string().min(1),
  creditor_id: z.string().min(1),
  creditor_name: z.string().min(1),
  amount: z.number().min(0),
});

export const getGroupDebtHistoryResponseSchema = z.object({
  debts: z.array(getGroupDebtHistoryResponseElementSchema),
});

export type GetGroupDebtHistoryResponseElementSchemaType = z.infer<typeof getGroupDebtHistoryResponseElementSchema>;
export type GetGroupDebtHistoryResponseSchemaType = z.infer<typeof getGroupDebtHistoryResponseSchema>;

export const registerGroupDebtResponseSchema = z.object({
  creditorId: z.string().min(1),
  debtorId: z.string().min(1),
  amount: z.number().min(0),
  occurredAt: z.date(),
});

export type RegisterGroupDebtResponseSchemaType = z.infer<typeof registerGroupDebtResponseSchema>;

export const deleteGroupDebtResponseSchema = z.object({
  debt_id: z.string().min(1),
});

export type DeleteGroupDebtResponseSchemaType = z.infer<typeof deleteGroupDebtResponseSchema>;
