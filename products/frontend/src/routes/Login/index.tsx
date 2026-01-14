import type { FC } from 'react';
// better-auth
import { authClient } from '../../lib/auth';
import { Title } from '../../share';

const Login: FC = () => {
  // OAuth signin handlers
  const handleDiscordSignin = async () => {
    await authClient.signIn.social({
      provider: 'discord',
      callbackURL: import.meta.env.VITE_REDIRECT_URL satisfies string,
    });
  };
  const googleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: import.meta.env.VITE_REDIRECT_URL satisfies string,
    });
  };

  return (
    <div>
      <Title title="ログイン / サインイン" />
      <button onClick={handleDiscordSignin}>Discordで サインイン / ログイン</button>
      <button onClick={googleSignIn}>Googleで サインイン / ログイン</button>
    </div>
  );
};

export default Login;
