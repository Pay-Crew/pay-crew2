import { z } from '@hono/zod-openapi';

export const getInfoAboutGroupsTheUserBelongsToResponseMemberElementSchema = z.object({
  user_id: z.string().min(1),
  user_name: z.string().min(1),
});

export const getInfoAboutGroupsTheUserBelongsToResponseGroupElementSchema = z.object({
  group_id: z.uuid(),
  group_name: z.string().min(1),
  created_by_id: z.string().min(1),
  created_by_name: z.string().min(1),
  members: z.array(getInfoAboutGroupsTheUserBelongsToResponseMemberElementSchema),
});

export const getInfoAboutGroupsTheUserBelongsToResponseSchema = z.object({
  groups: z.array(getInfoAboutGroupsTheUserBelongsToResponseGroupElementSchema),
});

export type GetInfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType = z.infer<
  typeof getInfoAboutGroupsTheUserBelongsToResponseMemberElementSchema
>;

export type GetInfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType = z.infer<
  typeof getInfoAboutGroupsTheUserBelongsToResponseGroupElementSchema
>;

export type GetInfoAboutGroupsTheUserBelongsToResponseSchemaType = z.infer<
  typeof getInfoAboutGroupsTheUserBelongsToResponseSchema
>;

export const getInfoAboutUserTransactionsResponseTransactionElementSchema = z.object({
  counterparty_id: z.string().min(1),
  counterparty_name: z.string().min(1),
  amount: z.number().min(0),
});

export const getInfoAboutUserTransactionsResponseSchema = z.object({
  transactions: z.array(getInfoAboutUserTransactionsResponseTransactionElementSchema),
});

export type GetInfoAboutUserTransactionsResponseTransactionElementSchemaType = z.infer<
  typeof getInfoAboutUserTransactionsResponseTransactionElementSchema
>;

export type GetInfoAboutUserTransactionsResponseSchemaType = z.infer<typeof getInfoAboutUserTransactionsResponseSchema>;
