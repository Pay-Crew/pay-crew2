// hono
import { Bindings } from '../types';
// validator
import { type SessionCheckResponseSchemaType } from 'validator';
// drizzle
import { createDbConnection } from './utils/db';
// utils
import { getUserInfo } from './utils/user';

export const getSessionCheckUseCase = async (
  env: Bindings,
  loginUserId: string
): Promise<SessionCheckResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  // ユーザ情報を取得
  const userInfo = await getUserInfo(db, loginUserId);

  return {
    user_id: userInfo.id,
    user_name: userInfo.name,
  } satisfies SessionCheckResponseSchemaType;
};
