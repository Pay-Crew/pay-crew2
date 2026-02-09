// hono
import { Bindings } from '../types';
// validator
import { type GetUserProfileResponseSchemaType } from 'validator';
// drizzle
import { createDbConnection } from './utils/db';
import { eq } from 'drizzle-orm';
import { user } from '../db/auth-schema';
import { HTTPException } from 'hono/http-exception';

export const getUserProfileUseCase = async (
  env: Bindings,
  loginUserId: string
): Promise<GetUserProfileResponseSchemaType> => {
  // データベース接続
  const db = createDbConnection(env);

  //* ユーザ情報を取得 (user table) *//
  const userData = await db
    .select({ display_name: user.displayName })
    .from(user)
    .where(eq(user.id, loginUserId))
    .limit(1);

  // ユーザが存在しない場合は例外をスロー
  if (userData.length === 0) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  // レスポンス
  return {
    display_name: userData[0].display_name === null ? '' : userData[0].display_name,
  } satisfies GetUserProfileResponseSchemaType;
};

export const updateUserProfileUseCase = async (
  env: Bindings,
  loginUserId: string,
  displayName: string | undefined
): Promise<void> => {
  // データベース接続
  const db = createDbConnection(env);

  //* ユーザ情報を更新 (user table) *//
  await db
    .update(user)
    .set({
      displayName: typeof displayName === 'undefined' ? null : displayName,
    })
    .where(eq(user.id, loginUserId));
};
