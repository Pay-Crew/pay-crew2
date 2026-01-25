import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { Outlet, useLocation, useNavigate } from 'react-router';
// components
import { Loading, Error } from '../../share';
import { getRedirectPath } from '../../lib/redirect';

const SessionCheck: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // リダイレクト先のパスを取得
  const redirectPath = getRedirectPath(location.search);
  // sessionのチェック
  const sessionCheckMutation = $api.useMutation('get', '/api/session', {
    onError: () => {
      // sessionが無効な場合、ログインページへリダイレクト
      // その際、現在のパスをredirectクエリパラメータとして渡す
      const currentPath = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
    },
  });

  useEffect(() => {
    sessionCheckMutation.mutate({ credentials: 'include' });
  }, []);

  useEffect(() => {
    // session checkが成功し、redirectPathがある場合にリダイレクト
    if (!sessionCheckMutation.isSuccess || !redirectPath) {
      return;
    }
    // 安全なパスへリダイレクト
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
