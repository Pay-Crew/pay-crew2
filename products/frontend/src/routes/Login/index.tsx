import type { FC } from 'react';
// react-router
import { useLocation } from 'react-router';
// better-auth
import { authClient } from '../../lib/auth';
// icons
import { FaDiscord, FaGoogle } from 'react-icons/fa6';
// css
import styles from './index.module.css';
// components
import { LoginButton } from './components';
import { Title, WarningMessage } from '../../share';
import { buildCallbackURL, getRedirectPath } from '../../lib/redirect';

const Login: FC = () => {
  // callbackURLを構築
  // 1. 現在のURLを取得
  // status: https://pay-crew2.yukiosada.work/login?redirect=/some/safe/path
  const location = useLocation();
  // 2. redirectクエリパラメータを取得
  // status: /some/safe/path
  const redirectPath = getRedirectPath(location.search);
  // 3. callbackURLを構築
  // status: import.meta.env.VITE_CLIENT_URL + ?redirect=/some/safe/path
  const callbackURL = buildCallbackURL(redirectPath);

  // OAuth signin handlers
  const handleDiscordSignin = async () => {
    await authClient.signIn.social({
      provider: 'discord',
      callbackURL,
    });
  };
  const googleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL,
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
