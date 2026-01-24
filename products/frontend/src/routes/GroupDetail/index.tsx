import { useEffect, useMemo, useState, type FC } from 'react';
import { useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
import {
  type GetGroupDebtHistoryResponseSchemaType,
  RegisterGroupDebtFormSchema,
  type RegisterGroupDebtFormSchemaType,
} from 'validator';
// react-hook-form
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
// toast
import toast from 'react-hot-toast';
// utils
import { toDateInputValue } from '../../lib/date';
// components
import { SubTitle, FormButton, InviteButton, Loading, Error } from '../../share';
import { CreatedBy, GroupName, Member, History } from './components';
// css
import styles from './index.module.css';

const GroupDetail: FC = () => {
  // URLパラメータからgroupIdを取得
  const { groupId } = useParams<{ groupId: string }>();
  // groupIdが存在しない場合の処理
  if (!groupId) return <Error content="グループIDが指定されていません。" />;

  const queryClient = useQueryClient();

  // コピー状態管理
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>('idle');

  // グループ情報の取得
  const groupInfoQuery = $api.useQuery('post', '/api/group/info', {
    body: { group_id: groupId },
    credentials: 'include',
  });

  // グループの貸し借り履歴の取得
  const debtHistoryQuery = $api.useQuery('post', '/api/group/debt/history', {
    body: { group_id: groupId },
    credentials: 'include',
  });

  // invalidate 用に “同じキー” を作成
  const debtHistoryQueryOptions = $api.queryOptions('post', '/api/group/debt/history', {
    body: { group_id: groupId },
    credentials: 'include',
  });

  // inviteURLは groupInfoQuery のデータから生成
  const inviteUrl = useMemo(() => {
    const inviteId = groupInfoQuery.data?.invite_id;
    return inviteId ? `${import.meta.env.VITE_CLIENT_URL}/invite/${inviteId}` : null;
  }, [groupInfoQuery.data?.invite_id]);

  // react-hook-formの設定
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterGroupDebtFormSchemaType>({
    resolver: zodResolver(RegisterGroupDebtFormSchema),
    defaultValues: {
      creditor_id: '',
      debtor_id: '',
      amount: 0,
      description: '',
      occurred_at: toDateInputValue(new Date()),
    },
  });

  // 同じ人を借り手 / 貸し手に選べないようにするためにwatch;
  const debtorId = watch('debtor_id');
  const creditorId = watch('creditor_id');

  // メンバー 一覧の取得
  // membersのnullを除外して<select>の候補を作る
  const members = useMemo(() => {
    const raw = groupInfoQuery.data?.members ?? [];
    return raw.filter((m): m is NonNullable<(typeof raw)[number]> => Boolean(m));
  }, [groupInfoQuery.data]);

  // debtorIdとcreditorIdが同じ場合、片方を空にする
  useEffect(() => {
    if (debtorId && creditorId && debtorId === creditorId) {
      // debtorId === creditorId なので、 creditor を空にする
      setValue('creditor_id', '');
    }
  }, [debtorId, creditorId, setValue]);

  // 貸し借り登録処理
  const debtRegisterMutation = $api.useMutation('post', '/api/group/debt/register', {
    onSuccess: async () => {
      // ここが「キャッシュ更新で再取得」
      await queryClient.invalidateQueries(debtHistoryQueryOptions);
      toast.success('貸し借りの登録に成功しました', { id: 'group-detail-debt-register' });
    },
    onError: () => {
      toast.error('貸し借りの登録に失敗しました', { id: 'group-detail-debt-register' });
    },
    onMutate: () => {
      toast.loading('貸し借りの登録中...', { id: 'group-detail-debt-register' });
    },
  });

  // 貸し借り登録ハンドラ
  const onSubmit: SubmitHandler<RegisterGroupDebtFormSchemaType> = (formData) => {
    debtRegisterMutation.mutate({
      body: {
        group_id: groupId,
        debtor_id: formData.debtor_id,
        creditor_id: formData.creditor_id,
        amount: formData.amount,
        description: formData.description,
        occurred_at: formData.occurred_at,
      },
      credentials: 'include',
    });
  };

  // 貸し借り削除処理
  const deleteGroupDebtMutation = $api.useMutation('delete', '/api/group/debt/delete', {
    onSuccess: async (_data, result) => {
      const debtId = result.body.debt_id;
      await queryClient.invalidateQueries(debtHistoryQueryOptions);
      toast.success('貸し借りの削除に成功しました', { id: `group-detail-delete-debt-${debtId}` });
    },
    onError: (_error, result) => {
      const debtId = result.body.debt_id;
      toast.error('貸し借りの削除に失敗しました', { id: `group-detail-delete-debt-${debtId}` });
    },
    onMutate: (result) => {
      const debtId = result.body.debt_id;
      toast.loading('貸し借りの削除中...', { id: `group-detail-delete-debt-${debtId}` });
    },
  });

  // 貸し借り削除ハンドラ
  const deleteGroupDebtHandler = (debtId: string) => {
    deleteGroupDebtMutation.mutate({ body: { group_id: groupId, debt_id: debtId }, credentials: 'include' });
  };

  // 貸し借り削除取り消し処理
  const cancelGroupDebtMutation = $api.useMutation('post', '/api/group/debt/cancel', {
    onSuccess: async (_data, result) => {
      const debtId = result.body.debt_id;
      await queryClient.invalidateQueries(debtHistoryQueryOptions);
      toast.success('貸し借りの削除取り消しに成功しました', { id: `group-detail-cancel-debt-${debtId}` });
    },
    onError: (_error, result) => {
      const debtId = result.body.debt_id;
      toast.error('貸し借りの削除取り消しに失敗しました', { id: `group-detail-cancel-debt-${debtId}` });
    },
    onMutate: (result) => {
      const debtId = result.body.debt_id;
      toast.loading('貸し借りの削除取り消し中...', { id: `group-detail-cancel-debt-${debtId}` });
    },
  });

  // 貸し借り削除取り消しハンドラ
  const cancelGroupDebtHandler = (debtId: string) => {
    cancelGroupDebtMutation.mutate({ body: { group_id: groupId, debt_id: debtId }, credentials: 'include' });
  };

  return (
    <>
      {groupInfoQuery.isPending && <Loading content="グループ情報を取得中..." />}
      {groupInfoQuery.isError && <Error content="グループ情報の取得に失敗しました。" />}

      {groupInfoQuery.isSuccess && groupInfoQuery.data && (
        <>
          <GroupName content={groupInfoQuery.data.group_name} />
          <CreatedBy content={groupInfoQuery.data.created_by_name} />
          <Member groupInfoResult={groupInfoQuery.data} />
          <InviteButton inviteUrl={inviteUrl} copyStatus={copyStatus} setCopyStatus={setCopyStatus} />

          <SubTitle subTitle="貸し借りの登録" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputWrapper}>
              <label htmlFor="debtor_id" className={styles.label}>
                借りる人
              </label>
              <select
                className={styles.input}
                id="debtor_id"
                {...register('debtor_id')}
                disabled={members.length === 0}
              >
                <option value="">{members.length === 0 ? 'メンバー取得中…' : '選択してください'}</option>
                {members
                  .filter((m) => (creditorId ? m.user_id !== creditorId : true))
                  .map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.user_name}
                    </option>
                  ))}
              </select>
              <ErrorMessage
                errors={errors}
                name="debtor_id"
                render={({ message }) => <p className={styles.error}>{message}</p>}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label htmlFor="creditor_id" className={styles.label}>
                貸す人
              </label>
              <select
                className={styles.input}
                id="creditor_id"
                {...register('creditor_id')}
                disabled={members.length === 0}
              >
                <option value="">{members.length === 0 ? 'メンバー取得中…' : '選択してください'}</option>
                {
                  // 借りる人に選んだメンバーは除外
                  members
                    .filter((m) => (debtorId ? m.user_id !== debtorId : true))
                    .map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.user_name}
                      </option>
                    ))
                }
              </select>
              <ErrorMessage
                errors={errors}
                name="creditor_id"
                render={({ message }) => <p className={styles.error}>{message}</p>}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label htmlFor="amount" className={styles.label}>
                金額
              </label>
              <input
                id="amount"
                type="number"
                {...register('amount', { valueAsNumber: true })}
                className={styles.input}
              />
              <ErrorMessage
                errors={errors}
                name="amount"
                render={({ message }) => <p className={styles.error}>{message}</p>}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label htmlFor="description" className={styles.label}>
                詳細
              </label>
              <textarea className={styles.textarea} id="description" {...register('description')} />
              <ErrorMessage
                errors={errors}
                name="description"
                render={({ message }) => <p className={styles.error}>{message}</p>}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label htmlFor="occurred_at" className={styles.label}>
                発生日時
              </label>
              <input className={styles.input} id="occurred_at" type="date" {...register('occurred_at')} />
              <ErrorMessage
                errors={errors}
                name="occurred_at"
                render={({ message }) => <p className={styles.error}>{message}</p>}
              />
            </div>

            <FormButton content="登録" onClick={handleSubmit(onSubmit)} disabled={debtRegisterMutation.isPending} />
          </form>
        </>
      )}

      <History
        debtHistoryMutationIsPending={debtHistoryQuery.isPending}
        debtHistoryMutationIsError={debtHistoryQuery.isError}
        debtHistoryMutationIsSuccess={debtHistoryQuery.isSuccess}
        debtHistoryResult={(debtHistoryQuery.data ?? null) as GetGroupDebtHistoryResponseSchemaType | null}
        deleteGroupDebtHandler={deleteGroupDebtHandler}
        fullPaymentButtonDisabled={deleteGroupDebtMutation.isPending}
        cancelGroupDebtHandler={cancelGroupDebtHandler}
        cancelButtonDisabled={cancelGroupDebtMutation.isPending}
      />
    </>
  );
};

export default GroupDetail;
