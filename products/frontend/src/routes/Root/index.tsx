import type { FC } from 'react';
import { authClient } from '../..//lib/auth';
//tmp
import { $api } from '../../api/fetchClient';

const Root: FC = () => {
  //tmp
  const { data, isLoading, isError, error } = $api.useQuery('get', '/api/session', {
    credentials: 'include',
  });

  const handleDiscordSignin = async () => {
    await authClient.signIn.social({
      provider: 'discord',
      callbackURL: 'http://localhost:5173/',
    });
  };

  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={handleDiscordSignin}>Sign in with Discord</button>
      <h2>Result</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};

export default Root;
