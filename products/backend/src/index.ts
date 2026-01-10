// hono
import { HTTPException } from 'hono/http-exception';
import { cors } from 'hono/cors';
import type { ErrorResponseSchemaType } from 'validator';
import { Scalar } from '@scalar/hono-api-reference';
// hono object factory
import honoFactory from './presentation/factory/hono';
// better-auth object factory
import { authFactory } from './presentation/factory/auth';
// routes
import apiPublic from './presentation/api.public';
import apiProtected from './presentation/api.protected';

// hono instance
const app = honoFactory();

// cors settings
app.use(
  '/api/*',
  cors({
    origin: ['https://pay-crew2.yukiosada.work', 'http://localhost:5173'],
    allowHeaders: ['Content-Type', 'Authorization', 'baggage', 'sentry-trace'],
    allowMethods: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// public routes
app.route('/', apiPublic(authFactory));
// protected routes
app.route('/', apiProtected(authFactory));

// error handling
// `404 Not Found` handling
app.notFound((c) => {
  console.error(`Not Found: ${c.req.url}`);
  return c.json({ status: 404, message: 'Not Found' } satisfies ErrorResponseSchemaType, 404);
});
// General error handling (excluding `404 Not Found`)
app.onError((error, c) => {
  console.error(`Error: ${error.message}`);
  // HTTPExceptionの場合はそのステータスコードで返す
  if (error instanceof HTTPException) {
    return c.json(
      {
        status: error.status,
        message: error.message,
      } satisfies ErrorResponseSchemaType,
      error.status
    );
  }
  // その他のエラーは500で返す
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
    title: 'Pay Crew2 API',
    version: '0.0.1',
    description: 'API documentation for Pay Crew2 backend',
  },
});

// Scalar Web UI Endpoint
// References
// https://guides.scalar.com/scalar/scalar-api-references/integrations/hono
app.get('/docs', Scalar({ url: '/openapi' }));

export default app;
