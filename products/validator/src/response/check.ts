import { z } from '@hono/zod-openapi';

export const sessionCheckResponseSchema = z.object({
  user_id: z.string().min(1),
  user_name: z.string().min(1),
});

export type SessionCheckResponseSchemaType = z.infer<typeof sessionCheckResponseSchema>;
