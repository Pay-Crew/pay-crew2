import { type FC } from 'react';
// better-auth
import { authClient } from '../../lib/auth';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { Link } from 'react-router';

const Root: FC = () => {
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

  // loginUserの所属グループ情報を取得
  const infoAboutGroupsTheUserBelongsToQuery = $api.useQuery('get', '/api/info/group', {
    credentials: 'include',
  });

  // loginUserの貸し借り情報を取得
  const infoAboutUserTransactionsQuery = $api.useQuery('get', '/api/info/transaction', {
    credentials: 'include',
  });

  // 貸し借り情報の振り分け
  const transactions = infoAboutUserTransactionsQuery.data?.transactions ?? [];
  const paybacks = transactions.filter((t) => t.amount > 0);
  const receivables = transactions.filter((t) => t.amount < 0);

  // 貸し借り情報の削除処理
  const deleteGroupDebtMutation = $api.useMutation('delete', '/api/info/transaction', {
    onSuccess: () => {
      infoAboutUserTransactionsQuery.refetch();
    },
  });
  // 貸し借り情報の削除ハンドラ
  const handleDeleteDebtHandler = (counterpartyId: string) => {
    deleteGroupDebtMutation.mutate({ body: { counterparty_id: counterpartyId }, credentials: 'include' });
  };

  return (
    <>
      <h1>Pay Crew2</h1>
      <button onClick={handleDiscordSignin}>Discordで サインイン / ログイン</button>
      <button onClick={googleSignIn}>Googleで サインイン / ログイン</button>
      {(infoAboutGroupsTheUserBelongsToQuery.isPending || infoAboutUserTransactionsQuery.isPending) && (
        <p>Loading...</p>
      )}
      {(infoAboutGroupsTheUserBelongsToQuery.isError || infoAboutUserTransactionsQuery.isError) && (
        <p>
          Error: {infoAboutGroupsTheUserBelongsToQuery.error?.message || infoAboutUserTransactionsQuery.error?.message}
        </p>
      )}
      {infoAboutGroupsTheUserBelongsToQuery.data && infoAboutUserTransactionsQuery.data && (
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
                  {group.group_name} ({group.created_by_name})
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
    </>
  );
};

export default Root;
