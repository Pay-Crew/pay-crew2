// hono instance
import honoFactory from '../factory/hono';
// validator
import { sampleSchema, type SampleSchemaType } from 'validator';
// error schema
import { route } from '../share/error';

const sample = honoFactory();

// サンプルエンドポイントの登録
const sampleGetSchema = route.createSchema(
  {
    path: '/api/session',
    method: 'get',
    description: 'sample endpoint to get session info',
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: sampleSchema,
          },
        },
      },
    },
  },
  [401] as const
);

sample.openapi(sampleGetSchema, (c) => {
  // const session = c.get('session');
  const user = c.get('user');

  // return response
  return c.json(
    {
      id: user.id,
      email: user.email,
    } satisfies SampleSchemaType,
    200
  );
});

export default sample;
