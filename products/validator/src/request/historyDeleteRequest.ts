import { z } from '@hono/zod-openapi';

export const historyDeleteRequestSchema = z.object({
  id: z.number().positive({ message: 'IDは正の数である必要があります。' }),
});

export type HistoryDeleteRequestSchemaType = z.infer<typeof historyDeleteRequestSchema>;
