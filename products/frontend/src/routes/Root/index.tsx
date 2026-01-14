import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { useNavigate, Link } from 'react-router';
// css
import styles from './index.module.css';
import { SubTitle } from '../../share';

const Root: FC = () => {
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
      <h1 className={styles.title}>Pay Crew2</h1>
      <p className={styles.description}>
        Pay Crew2は、友人や家族と簡単に割り勘やお金の貸し借りを管理できるアプリケーションです。
      </p>
      {sessionCheckMutation.isPending && <p>セッションの確認中...</p>}
      {sessionCheckMutation.isError && <p>セッションが無効です。ログインページへリダイレクトします...。</p>}
      {sessionCheckMutation.isSuccess && (
        <>
          {/* session valid place */}
          {(infoAboutGroupsTheUserBelongsToQuery.isPending || infoAboutUserTransactionsQuery.isPending) && (
            <p>Loading...</p>
          )}
          {(infoAboutGroupsTheUserBelongsToQuery.isError || infoAboutUserTransactionsQuery.isError) && (
            <p>
              Error:{' '}
              {infoAboutGroupsTheUserBelongsToQuery.error?.message || infoAboutUserTransactionsQuery.error?.message}
            </p>
          )}
          {infoAboutGroupsTheUserBelongsToQuery.data && infoAboutUserTransactionsQuery.data && (
            <>
              <div className={styles.welcomeBox}>
                <Link to="/profile">プロフィール編集へ</Link>
                <Link to="/gen-group">グループ作成へ</Link>
              </div>
              <SubTitle subTitle="参加しているグループ情報" />
              <ul className={styles.groupUl}>
                {infoAboutGroupsTheUserBelongsToQuery.data?.groups.map((group) => (
                  <li className={styles.groupLi} key={group.group_id}>
                    <div className={styles.groupHeader}>
                      <Link className={styles.groupLink} to={`/group/${group.group_id}`}>
                        {group.group_name}
                      </Link>
                      <small className={styles.label}>created by&thinsp;:&nbsp;{group.created_by_name}</small>
                    </div>
                    <div className={styles.memberBox}>
                      <small className={styles.label}>[メンバー]</small>
                      <ul className={styles.memberUl}>
                        {group.members.map((member, index) =>
                          index === group.members.length - 1 ? (
                            <li key={member.user_id}>{member.user_name}</li>
                          ) : (
                            <li key={member.user_id}>{member.user_name}、</li>
                          )
                        )}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>

              <SubTitle subTitle="返す金額の一覧 💸" />
              {paybacks.length === 0 ? (
                <p className={styles.message}>返すお金はありません</p>
              ) : (
                <ul className={styles.moneyUl}>
                  {paybacks.map((t) => (
                    <li key={t.counterparty_id}>
                      {t.counterparty_name} に <b>{t.amount}</b> 円
                    </li>
                  ))}
                </ul>
              )}

              <SubTitle subTitle="受け取る金額の一覧 💰" />
              {receivables.length === 0 ? (
                <p className={styles.message}>貸しているお金はありません</p>
              ) : (
                <ul className={styles.moneyUl}>
                  {receivables.map((t) => (
                    <li key={t.counterparty_id}>
                      <p>
                        {t.counterparty_name} から {Math.abs(t.amount)}円
                      </p>
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
      )}
    </>
  );
};

export default Root;
