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
  invite_id: z.string().min(1),
  created_by_id: z.string().min(1),
  created_by_name: z.string().min(1),
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
  description: z.string().min(0),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const getGroupDebtHistoryResponseSchema = z.object({
  debts: z.array(getGroupDebtHistoryResponseElementSchema),
});

export type GetGroupDebtHistoryResponseElementSchemaType = z.infer<typeof getGroupDebtHistoryResponseElementSchema>;
export type GetGroupDebtHistoryResponseSchemaType = z.infer<typeof getGroupDebtHistoryResponseSchema>;
