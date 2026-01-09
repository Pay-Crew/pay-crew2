import { z } from '@hono/zod-openapi';

export const deleteInfoAboutUserRepaymentRequestSchema = z.object({
  counterparty_id: z.string().min(1),
});

export type DeleteInfoAboutUserRepaymentRequestSchemaType = z.infer<typeof deleteInfoAboutUserRepaymentRequestSchema>;
