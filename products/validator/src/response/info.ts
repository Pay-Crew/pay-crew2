import { z } from '@hono/zod-openapi';

export const infoAboutGroupsTheUserBelongsToResponseMemberElementSchema = z.object({
  user_id: z.string().min(1),
  user_name: z.string().min(1),
});

export const infoAboutGroupsTheUserBelongsToResponseGroupElementSchema = z.object({
  group_id: z.uuid(),
  group_name: z.string().min(1),
  created_by: z.string().min(1),
  members: z.array(infoAboutGroupsTheUserBelongsToResponseMemberElementSchema),
});

export const infoAboutGroupsTheUserBelongsToResponseSchema = z.object({
  groups: z.array(infoAboutGroupsTheUserBelongsToResponseGroupElementSchema),
});

export type InfoAboutGroupsTheUserBelongsToResponseMemberElementSchemaType = z.infer<
  typeof infoAboutGroupsTheUserBelongsToResponseMemberElementSchema
>;

export type InfoAboutGroupsTheUserBelongsToResponseGroupElementSchemaType = z.infer<
  typeof infoAboutGroupsTheUserBelongsToResponseGroupElementSchema
>;

export type InfoAboutGroupsTheUserBelongsToResponseSchemaType = z.infer<
  typeof infoAboutGroupsTheUserBelongsToResponseSchema
>;

export const infoAboutUserTransactionsResponseTransactionElementSchema = z.object({
  counterparty_id: z.string().min(1),
  counterparty_name: z.string().min(1),
  amount: z.number().min(0),
});

export const infoAboutUserTransactionsResponseSchema = z.object({
  transactions: z.array(infoAboutUserTransactionsResponseTransactionElementSchema),
});

export type InfoAboutUserTransactionsResponseTransactionElementSchemaType = z.infer<
  typeof infoAboutUserTransactionsResponseTransactionElementSchema
>;

export type InfoAboutUserTransactionsResponseSchemaType = z.infer<typeof infoAboutUserTransactionsResponseSchema>;
