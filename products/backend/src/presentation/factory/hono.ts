import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthType, Bindings } from '../../types';
import { HTTPException } from 'hono/http-exception';

const honoFactory = () => {
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

  return app;
};

export default honoFactory;
