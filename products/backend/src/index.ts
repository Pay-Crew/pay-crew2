import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { cors } from 'hono/cors';
import { errorResponseSchema, type ErrorResponseSchemaType } from 'validator';
import { Scalar } from '@scalar/hono-api-reference';
// tmp
import { auth } from './auth';
import type { AuthType, Bindings } from './auth';
// share tmp
import { route } from './share';
// validator tmp
import { sampleSchema } from 'validator';

const app = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: AuthType;
}>({
  // Open API Honoのインスタンスを生成
  // ZodのバリデーションエラーをHTTPExceptionで投げるように設定
  // result.successがfalseの場合はZodErrorが入っている
  defaultHook: (result) => {
    if (!result.success) {
      console.error(result.error);
      throw new HTTPException(400, {
        message: 'Zod Validation Error',
      });
    }
  },
});

// CORSの設定
app.use(
  '/api/*',
  cors({
    origin: ['https://pay-crew2.yukiosada.work', 'http://localhost:5173'],
    allowHeaders: ['Content-Type', 'Authorization', 'baggage', 'sentry-trace'],
    allowMethods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// mount handlers
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth(c.env).handler(c.req.raw);
});

// session middleware
app.use('/api/*', async (c, next) => {
  const session = await auth(c.env).api.getSession({ headers: c.req.raw.headers });

  // session validation
  if (!session) {
    // no session, set user and session to null
    c.set('user', null);
    c.set('session', null);
    await next();
    return;
  }

  // set user and session to context
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

//NOTE: サンプルのエンドポイント
// sample protected route
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

app.openapi(sampleGetSchema, (c) => {
  // const session = c.get('session');
  const user = c.get('user');

  // user authentication check
  if (!user) {
    return c.json(
      {
        status: 401,
        message: 'Unauthorized',
      } satisfies ErrorResponseSchemaType,
      401
    );
  }

  return c.json(
    {
      id: user.id,
      email: user.email,
    },
    200
  );
});

////////////////////////////////////
// 404のエラーハンドリング
app.notFound((c) => {
  console.error(`Not Found: ${c.req.url}`);
  return c.json({ status: 404, message: 'Not Found' } satisfies ErrorResponseSchemaType, 404);
});

// 404以外のエラーハンドリング
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json(
      {
        status: error.status,
        message: error.message,
      } satisfies ErrorResponseSchemaType,
      error.status
    );
  }
  return c.json(
    {
      status: 500,
      message: 'Internal Server Error',
    } satisfies ErrorResponseSchemaType,
    500
  );
});

// OpenAPI Spec Endpoint
app.doc('/openapi', {
  openapi: '3.1.0',
  info: {
    title: 'Echo API',
    version: '1.0.0',
    description: '受け取った入力値をそのまま応答するAPI',
  },
});

// Scalar Web UI Endpoint
// References
// https://guides.scalar.com/scalar/scalar-api-references/integrations/hono
app.get('/docs', Scalar({ url: '/openapi' }));

export default app;
