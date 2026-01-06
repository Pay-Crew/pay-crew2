import type { FC } from 'react';
import { authClient } from '../../lib/auth';
//tmp
import { $api } from '../../api/fetchClient';
import { Link } from 'react-router';

const Root: FC = () => {
  //tmp
  const { data, isLoading, isError, error } = $api.useQuery('get', '/api/session', {
    credentials: 'include',
  });

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
      <h1>Hello, World!</h1>
      <button onClick={handleDiscordSignin}>Sign in with Discord</button>
      <button onClick={googleSignIn}>Sign in with Google</button>
      <h2>Result</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <Link to="/profile">プロフィール編集へ</Link>
          <Link to="/group">グループ作成へ</Link>
        </>
      )}
    </div>
  );
};

export default Root;
