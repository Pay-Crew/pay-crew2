import { HTTPException } from 'hono/http-exception';
import { OpenAPIHono } from '@hono/zod-openapi';
import { route } from '../share';
import type { Bindings } from '../share/binding';
import { HistoryService } from '../../application';
import {
  historyGetResponseSchema,
  historyPostResponseSchema,
  historyPostRequestSchema,
  historyDeleteRequestSchema,
  historyDeleteResponseSchema,
} from 'validator';

const history = new OpenAPIHono<{
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

const historyGetSchema = route.createSchema(
  {
    path: '/api/history',
    method: 'get',
    description: '履歴の取得',
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: historyGetResponseSchema,
          },
        },
      },
    },
  },
  [500]
);

history.openapi(historyGetSchema, async (c) => {
  // NOTE: application層のサービスを呼び出す
  const service = new HistoryService(c.env.HYPERDRIVE);
  const result = await service.getHistoryService();

  return c.json(result);
});

const historyPostSchema = route.createSchema(
  {
    path: '/api/history',
    method: 'post',
    description: '履歴の追加',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: historyPostRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: historyPostResponseSchema,
          },
        },
      },
    },
  },
  [500]
);

history.openapi(historyPostSchema, async (c) => {
  c.status(201);
  const data = c.req.valid('json');
  // NOTE: application層のサービスを呼び出す
  const service = new HistoryService(c.env.HYPERDRIVE);
  const result = await service.postHistoryService(data);

  return c.json(result);
});

const historyDeleteSchema = route.createSchema(
  {
    path: '/api/history',
    method: 'delete',
    description: '履歴の削除',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: historyDeleteRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: historyDeleteResponseSchema,
          },
        },
      },
    },
  },
  [500]
);

history.openapi(historyDeleteSchema, async (c) => {
  const data = c.req.valid('json');
  // NOTE: application層のサービスを呼び出す
  const service = new HistoryService(c.env.HYPERDRIVE);
  const result = await service.deleteHistoryService(data);

  return c.json(result);
});

export default history;
