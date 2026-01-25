import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { Outlet, useLocation, useNavigate } from 'react-router';
// components
import { Loading, Error } from '../../share';
import { buildLoginRedirectUrl, getRedirectPath } from '../../lib/redirect';

const SessionCheck: FC = () => {
  // sessionのチェック
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const redirectPath = getRedirectPath(location.search);
  const sessionCheckMutation = $api.useMutation('get', '/api/session', {
    onError: () => {
      navigate(buildLoginRedirectUrl(currentPath), { replace: true });
    },
  });
  useEffect(() => {
    sessionCheckMutation.mutate({ credentials: 'include' });
  }, []);
  useEffect(() => {
    if (!sessionCheckMutation.isSuccess || !redirectPath) {
      return;
    }

    navigate(redirectPath, { replace: true });
  }, [navigate, redirectPath, sessionCheckMutation.isSuccess]);

  return (
    <>
      {sessionCheckMutation.isPending && <Loading content="セッションを確認中..." />}
      {sessionCheckMutation.isError && (
        <Error content="セッションの確認に失敗しました。ログインページへリダイレクトします。" />
      )}
      {sessionCheckMutation.isSuccess && <Outlet />}
    </>
  );
};

export default SessionCheck;
