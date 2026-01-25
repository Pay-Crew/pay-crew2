export const getRedirectPath = (search: string): string | null => {
  const params = new URLSearchParams(search);
  const redirectParam = params.get('redirect');

  if (!redirectParam) {
    return null;
  }

  if (!redirectParam.startsWith('/') || redirectParam.startsWith('//')) {
    return null;
  }

  return redirectParam;
};

export const buildLoginRedirectUrl = (path: string): string => {
  return `/login?redirect=${encodeURIComponent(path)}`;
};

export const buildCallbackURL = (redirectPath: string | null): string => {
  const baseRedirectURL = import.meta.env.VITE_REDIRECT_URL satisfies string;
  if (!redirectPath) {
    return baseRedirectURL;
  }
  return `${baseRedirectURL}?redirect=${encodeURIComponent(redirectPath)}`;
};
