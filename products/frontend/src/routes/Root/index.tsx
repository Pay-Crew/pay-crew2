import { type FC } from 'react';
// better-auth
import { authClient } from '../../lib/auth';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { Link } from 'react-router';

const Root: FC = () => {
  // sign in handlers
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

  // get group info of logged in user
  const infoAboutGroupsTheUserBelongsToQuery = $api.useQuery('get', '/api/info/group', {
    credentials: 'include',
  });

  // get transactions info of logged in user
  const infoAboutUserTransactionsQuery = $api.useQuery('get', '/api/info/transaction', {
    credentials: 'include',
  });

  const transactions = infoAboutUserTransactionsQuery.data?.transactions ?? [];
  const paybacks = transactions.filter((t) => t.amount > 0);
  const receivables = transactions.filter((t) => t.amount < 0);

  const deleteGroupDebtMutation = $api.useMutation('delete', '/api/info/transaction', {
    onSuccess: (data) => {
      if (data?.counterparty_id) {
        infoAboutUserTransactionsQuery.refetch();
      }
    },
  });

  const handleDeleteDebtHandler = (counterpartyId: string) => {
    deleteGroupDebtMutation.mutate({ body: { counterparty_id: counterpartyId }, credentials: 'include' });
  };

  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={handleDiscordSignin}>Sign in with Discord</button>
      <button onClick={googleSignIn}>Sign in with Google</button>
      {infoAboutGroupsTheUserBelongsToQuery.isLoading || infoAboutUserTransactionsQuery.isLoading ? (
        <p>Loading...</p>
      ) : infoAboutGroupsTheUserBelongsToQuery.isError || infoAboutUserTransactionsQuery.isError ? (
        <p>
          Error: {infoAboutGroupsTheUserBelongsToQuery.error?.message || infoAboutUserTransactionsQuery.error?.message}
        </p>
      ) : (
        <>
          <Link to="/profile">プロフィール編集へ</Link>
          <br />
          <Link to="/gen-group">グループ作成へ</Link>
          <br />
          <h3>Group Info:</h3>
          <ul>
            {infoAboutGroupsTheUserBelongsToQuery.data?.groups.map((group) => (
              <li key={group.group_id}>
                <Link to={`/group/${group.group_id}`}>
                  {group.group_name} (Created by: {group.created_by})
                </Link>
                <ul>
                  {group.members.map((member) => (
                    <li key={member.user_id}>
                      {member.user_name} (ID: {member.user_id})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <h3>💸 返す金額の一覧</h3>
          {paybacks.length === 0 ? (
            <p>返すお金はありません</p>
          ) : (
            <ul>
              {paybacks.map((t, i) => (
                <li key={i}>
                  {t.counterparty_name} に <b>{t.amount}</b> 円
                </li>
              ))}
            </ul>
          )}

          <h3>💰 貸す金額の一覧</h3>
          {receivables.length === 0 ? (
            <p>貸しているお金はありません</p>
          ) : (
            <ul>
              {receivables.map((t, i) => (
                <li key={i}>
                  {t.counterparty_name} から <b>{Math.abs(t.amount)}</b> 円
                  <button
                    onClick={() => handleDeleteDebtHandler(t.counterparty_id)}
                    disabled={deleteGroupDebtMutation.isPending}
                  >
                    {deleteGroupDebtMutation.isPending ? '処理中...' : '完済'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Root;
