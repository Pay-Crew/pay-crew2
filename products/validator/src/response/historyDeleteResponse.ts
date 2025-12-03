import { z } from '@hono/zod-openapi';

export const historyDeleteResponseSchema = z
  .object({
    id: z.number().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    amount: z.number().min(1),
  })
  .or(z.null());

export type HistoryDeleteResponseSchemaType = z.infer<typeof historyDeleteResponseSchema>;
