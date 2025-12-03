import { z } from '@hono/zod-openapi';

export const historyPostRequestSchema = z.object({
  from: z.string().min(1, { message: 'まとめて払った人の名前は必須です。' }),
  to: z.string().min(1, { message: '返金する人の名前は必須です。' }),
  amount: z.number().min(1, { message: '1円以上の金額を入力してください。' }),
});

export type HistoryPostRequestSchemaType = z.infer<typeof historyPostRequestSchema>;
