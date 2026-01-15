import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { Outlet, useNavigate } from 'react-router';
// components
import { Loading } from '../../share';

const SessionCheck: FC = () => {
  // sessionのチェック
  const navigate = useNavigate();
  const sessionCheckMutation = $api.useMutation('get', '/api/session', {
    onError: () => {
      navigate('/login', { replace: true });
    },
  });
  useEffect(() => {
    sessionCheckMutation.mutate({ credentials: 'include' });
  }, []);

  return (
    <>
      {sessionCheckMutation.isPending && <Loading content="セッションを確認中..." />}
      {sessionCheckMutation.isError && <p>セッションが無効です。ログインページへリダイレクトします...。</p>}
      {sessionCheckMutation.isSuccess && <Outlet />}
    </>
  );
};

export default SessionCheck;
