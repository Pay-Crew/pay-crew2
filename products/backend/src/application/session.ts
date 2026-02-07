import type { Bindings } from '../types';
import { createDb } from './db';
import { fetchUserDisplayName } from './shared/user';

export const getSessionUserInfo = async (
  env: Bindings,
  userId: string
): Promise<{ user_id: string; user_name: string }> => {
  const db = createDb(env);
  const userName = await fetchUserDisplayName(db, userId);

  return { user_id: userId, user_name: userName };
};
