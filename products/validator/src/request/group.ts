import { z } from '@hono/zod-openapi';

export const createGroupRequestSchema = z.object({
  group_name: z.string().min(1),
});

export type CreateGroupRequestSchemaType = z.infer<typeof createGroupRequestSchema>;

export const joinGroupRequestSchema = z.object({
  invite_id: z.string().min(1),
});

export type JoinGroupRequestSchemaType = z.infer<typeof joinGroupRequestSchema>;

export const getGroupInfoRequestSchema = z.object({
  group_id: z.string().min(1),
});

export type GetGroupInfoRequestSchemaType = z.infer<typeof getGroupInfoRequestSchema>;

export const getGroupDebtHistoryRequestSchema = z.object({
  group_id: z.string().min(1),
});

export type GetGroupDebtHistoryRequestSchemaType = z.infer<typeof getGroupDebtHistoryRequestSchema>;

export const registerGroupDebtRequestSchema = z.object({
  group_id: z.string().min(1),
  creditor_id: z.string().min(1),
  debtor_id: z.string().min(1),
  amount: z.number().min(0),
  description: z.string().optional(),
  occurred_at: z.string().optional(),
});

export type RegisterGroupDebtRequestSchemaType = z.infer<typeof registerGroupDebtRequestSchema>;

export const deleteGroupDebtRequestSchema = z.object({
  group_id: z.string().min(1),
  debt_id: z.string().min(1),
});

export type DeleteGroupDebtRequestSchemaType = z.infer<typeof deleteGroupDebtRequestSchema>;
