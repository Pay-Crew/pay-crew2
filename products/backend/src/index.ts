import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { cors } from 'hono/cors';
import type { ErrorResponseSchemaType } from 'validator';
import { Scalar } from '@scalar/hono-api-reference';
import type { Bindings } from './presentation/share/binding';
import { default as root } from './presentation';

const app = new OpenAPIHono<{
  Bindings: Bindings;
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
  '*',
  cors({
    origin: ['https://pay-crew.yukiosada.work', 'http://localhost:5173'],
    allowHeaders: ['Content-Type', 'baggage', 'sentry-trace'],
    allowMethods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS'],
  })
);

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

// エンドポイントのルートの登録
app.route('/', root);

export default app;
