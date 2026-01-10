import { z } from '@hono/zod-openapi';

export const getUserProfileResponseSchema = z.object({
  display_name: z.string().min(1),
  avatar_url: z.url(),
  bio: z.string(),
});

export type GetUserProfileResponseSchemaType = z.infer<typeof getUserProfileResponseSchema>;
