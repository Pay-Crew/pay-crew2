import type { FC } from 'react';
// better-auth
import { authClient } from '../../lib/auth';
// icons
import { FaDiscord, FaGoogle } from 'react-icons/fa6';
// css
import styles from './index.module.css';
// components
import { LoginButton } from './components';
import { Title, WarningMessage } from '../../share';

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
      <Title title="ログイン" />
      <p className={styles.description}>Discord または Google アカウントを使用してログインしてください。</p>
      <div className={styles.container}>
        <LoginButton onClick={handleDiscordSignin} Icon={FaDiscord} label="Discord" />
        <LoginButton onClick={googleSignIn} Icon={FaGoogle} label="Google" />
      </div>
      <WarningMessage />
    </div>
  );
};

export default Login;
