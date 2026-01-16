import { type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-router
import { Link } from 'react-router';
// toast
import toast from 'react-hot-toast';
// icons
import { SquareArrowOutUpRight } from 'lucide-react';
// components
import { SubTitle, Loading, Error, FullPaymentButton } from '../../share';
import { Description, Logo, Menu } from './components';
// css
import styles from './index.module.css';

const Root: FC = () => {
  // loginUserの所属グループ情報を取得
  const infoAboutGroupsTheUserBelongsToQuery = $api.useQuery('get', '/api/info/group', {
    credentials: 'include',
    onError: () => {
      toast.error('グループ情報の取得に失敗しました', { id: 'root-group-info' });
    },
  });

  // loginUserの貸し借り情報を取得
  const infoAboutUserTransactionsQuery = $api.useQuery('get', '/api/info/transaction', {
    credentials: 'include',
    onError: () => {
      toast.error('貸し借り情報の取得に失敗しました', { id: 'root-transaction-info' });
    },
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
      <Logo content="Pay Crew2" />
      <Error content="Pay Crew2は、まだ開発中です。" />
      <Description content="Pay Crew2は、友人や家族と簡単に割り勘やお金の貸し借りを管理できるアプリケーションです。" />
      {(infoAboutGroupsTheUserBelongsToQuery.isPending || infoAboutUserTransactionsQuery.isPending) && (
        <Loading content="データを取得中..." />
      )}
      {(infoAboutGroupsTheUserBelongsToQuery.isError || infoAboutUserTransactionsQuery.isError) && (
        <Error content="データの取得に失敗しました。" />
      )}
      {infoAboutGroupsTheUserBelongsToQuery.data && infoAboutUserTransactionsQuery.data && (
        <>
          <Menu />
          <SubTitle subTitle="所属グループ" />
          <ul className={styles.groupUl}>
            {infoAboutGroupsTheUserBelongsToQuery.data?.groups.map((group) => (
              <li className={styles.groupLi} key={group.group_id}>
                <Link className={styles.groupLink} to={`/group/${group.group_id}`}>
                  <h3 className={styles.groupName}>{group.group_name}</h3>
                  <SquareArrowOutUpRight />
                  <div className={styles.groupHeader}>
                    <div className={styles.createdByWrapper}>
                      <small className={styles.createdByLabel}>created by&thinsp;:&nbsp;</small>
                      <small className={styles.createdBy}>{group.created_by_name}</small>
                    </div>
                  </div>
                  <div className={styles.memberBox}>
                    <small className={styles.memberLabel}>[メンバー]</small>
                    <p className={styles.memberNames}>
                      {group.members.map((member, index) =>
                        index === group.members.length - 1 ? `${member.user_name}` : `${member.user_name}、`
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <SubTitle subTitle="返す金額の一覧" />
          {paybacks.length === 0 ? (
            <p className={styles.message}>返すお金はありません</p>
          ) : (
            <ul className={styles.moneyUl}>
              {paybacks.map((t) => (
                <li key={t.counterparty_id}>
                  {t.counterparty_name} に {t.amount}円
                </li>
              ))}
            </ul>
          )}

          <SubTitle subTitle="受け取る金額の一覧" />
          {receivables.length === 0 ? (
            <p className={styles.message}>貸しているお金はありません</p>
          ) : (
            <ul className={styles.moneyUl}>
              {receivables.map((t) => (
                <li key={t.counterparty_id}>
                  <p>
                    {t.counterparty_name} から {Math.abs(t.amount)}円
                  </p>
                  <FullPaymentButton
                    onClick={() => handleDeleteDebtHandler(t.counterparty_id)}
                    disabled={deleteGroupDebtMutation.isPending}
                  />
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
