import { type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// toast
import toast from 'react-hot-toast';
// components
import { Loading, Error } from '../../share';
import { Borrow, Description, Group, Lent, Logo, Menu } from './components';

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
      <Error content="Pay Crew2は、まだ開発中です。そのため、予告なくデータが消失する可能性があります。また、サービスの仕様が変更されることがあります。これらを含む「Pay Crew2」の利用について、一切の責任を負いかねますのでご了承ください。" />
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

          <Group groups={infoAboutGroupsTheUserBelongsToQuery.data.groups} />
          <Borrow paybacks={paybacks} />
          <Lent
            receivables={receivables}
            handleDeleteDebtHandler={handleDeleteDebtHandler}
            fullPaymentButtonDisabled={deleteGroupDebtMutation.isPending}
          />
        </>
      )}
    </>
  );
};

export default Root;
