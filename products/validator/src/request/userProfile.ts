import { z } from '@hono/zod-openapi';

export const updateUserProfileRequestSchema = z.object({
  display_name: z.string().optional(),
  avatar_url: z.url().optional(),
});

export type UpdateUserProfileRequestSchemaType = z.infer<typeof updateUserProfileRequestSchema>;
