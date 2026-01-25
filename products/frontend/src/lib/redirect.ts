export const getRedirectPath = (search: string): string | null => {
  // redirectクエリパラメータを取得
  const params = new URLSearchParams(search);
  const redirectParam = params.get('redirect');

  // 有効なパスかどうかを検証
  if (!redirectParam?.startsWith('/') || redirectParam.startsWith('//')) {
    return null;
  }
  return redirectParam;
};

export const buildCallbackURL = (redirectPath: string | null): string => {
  // 環境変数からリダイレクトURLを取得し、必要に応じてredirectクエリパラメータを追加
  const baseRedirectURL = import.meta.env.VITE_CLIENT_URL satisfies string;
  if (!redirectPath) {
    // redirectパスがない場合、ルートのページのURLを返す
    return `${baseRedirectURL}/`;
  }
  // redirectパスがある場合、クエリパラメータとして追加して返す
  return `${baseRedirectURL}?redirect=${encodeURIComponent(redirectPath)}`;
};
