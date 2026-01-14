import type { FC } from 'react';
// better-auth
import { authClient } from '../../lib/auth';
import { Title } from '../../share';
// icons
import { FaDiscord, FaGoogle } from 'react-icons/fa6';
// css
import styles from './index.module.css';

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
      <Title title="登録 / ログイン" />
      <div className={styles.container}>
        <div>
          <button type="button" className={styles.button} onClick={handleDiscordSignin}>
            <FaDiscord className={styles.icon} />
          </button>
          <p className={styles.label}>Discord</p>
        </div>
        <div>
          <button type="button" className={styles.button} onClick={googleSignIn}>
            <FaGoogle className={styles.icon} />
          </button>
          <p className={styles.label}>Google</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
