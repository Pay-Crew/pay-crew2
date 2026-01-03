import { z } from '@hono/zod-openapi';

export const sampleSchema = z
  .object({
    id: z.string().min(1),
    email: z.string().min(1),
  })
  .or(z.null());

export type sampleSchemaType = z.infer<typeof sampleSchema>;
