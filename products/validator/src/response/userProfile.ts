import { z } from '@hono/zod-openapi';

export const getUserProfileResponseSchema = z.object({
  display_name: z.string().min(1),
});

export type GetUserProfileResponseSchemaType = z.infer<typeof getUserProfileResponseSchema>;
