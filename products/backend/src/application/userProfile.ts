import { eq } from 'drizzle-orm';
import { user } from '../db/auth-schema';
import type { Bindings } from '../types';
import { createDb } from './db';

export const getUserProfile = async (env: Bindings, userId: string): Promise<{ display_name: string }> => {
  const db = createDb(env);

  const userData = await db
    .select({ display_name: user.displayName })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return { display_name: userData[0].display_name === null ? '' : userData[0].display_name };
};

export const updateUserProfile = async (
  env: Bindings,
  userId: string,
  displayName?: string
): Promise<void> => {
  const db = createDb(env);

  await db
    .update(user)
    .set({
      displayName: typeof displayName === 'undefined' ? null : displayName,
    })
    .where(eq(user.id, userId));
};
