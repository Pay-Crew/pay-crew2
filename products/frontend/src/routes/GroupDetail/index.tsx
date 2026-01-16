import { useEffect, useMemo, useState, type FC } from 'react';
import { useParams } from 'react-router';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
import {
  type GetGroupDebtHistoryResponseSchemaType,
  type GetGroupInfoResponseSchemaType,
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

  // コピー状態管理
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>('idle');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  // グループ情報の取得
  const [groupInfoResult, setGroupInfoResult] = useState<GetGroupInfoResponseSchemaType | null>(null);
  const groupInfoMutation = $api.useMutation('post', `/api/group/info`, {
    onSuccess: (data) => {
      setGroupInfoResult(data);
      setInviteUrl(`${import.meta.env.VITE_CLIENT_URL}/invite/${data.invite_id}`);
      setCopyStatus('idle');
    },
    onError: () => {
      setGroupInfoResult(null);
      setInviteUrl(null);
      setCopyStatus('idle');
      toast.error('グループ情報の取得に失敗しました', { id: 'group-detail-group-info' });
    },
    onMutate: () => {
      setGroupInfoResult(null);
      setInviteUrl(null);
      setCopyStatus('idle');
    },
  });

  // グループの貸し借り履歴の取得
  const [debtHistoryResult, setDebtHistoryResult] = useState<GetGroupDebtHistoryResponseSchemaType | null>(null);
  const debtHistoryMutation = $api.useMutation('post', `/api/group/debt/history`, {
    onSuccess: (data) => {
      setDebtHistoryResult(data);
    },
    onError: () => {
      setDebtHistoryResult(null);
      toast.error('貸し借り情報の取得に失敗しました', { id: 'group-detail-debt-history' });
    },
    onMutate: () => {
      setDebtHistoryResult(null);
    },
  });

  // コンポーネントマウント時にグループ情報と貸し借り履歴を取得
  useEffect(() => {
    groupInfoMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
    debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
  }, []);

  // 貸し借り登録処理
  const debtRegisterMutation = $api.useMutation('post', `/api/group/debt/register`, {
    onSuccess: () => {
      debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
      toast.success('貸し借りの登録に成功しました', { id: 'group-detail-debt-register' });
    },
    onError: () => {
      toast.error('貸し借りの登録に失敗しました', { id: 'group-detail-debt-register' });
    },
    onMutate: () => {
      toast.loading('貸し借りの登録中...', { id: 'group-detail-debt-register' });
    },
  });

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

  // 同じ人を借り手/貸し手に選べないようにするためにwatch
  const debtorId = watch('debtor_id');
  const creditorId = watch('creditor_id');

  // メンバー 一覧の取得
  // membersのnullを除外して<select>の候補を作る
  const members = useMemo(() => {
    const raw = groupInfoResult?.members ?? [];
    return raw.filter((m): m is NonNullable<(typeof raw)[number]> => Boolean(m));
  }, [groupInfoResult]);

  // debtorIdとcreditorIdが同じ場合、片方を空にする
  useEffect(() => {
    if (debtorId && creditorId && debtorId === creditorId) {
      // debtorId === creditorId なので、 creditor を空にする
      setValue('creditor_id', '');
    }
  }, [debtorId, creditorId, setValue]);

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
    onSuccess: (_data, result) => {
      const debtId = result.body.debt_id;
      debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
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

  return (
    <>
      {groupInfoMutation.isPending && <Loading content="グループ情報を取得中..." />}
      {groupInfoMutation.isError && <Error content="グループ情報の取得に失敗しました。" />}
      {groupInfoMutation.isSuccess && groupInfoResult && (
        <>
          <GroupName content={groupInfoResult.group_name} />
          <CreatedBy content={groupInfoResult.created_by_name} />
          <Member groupInfoResult={groupInfoResult} />
          <InviteButton
            inviteUrl={inviteUrl}
            setInviteUrl={setInviteUrl}
            copyStatus={copyStatus}
            setCopyStatus={setCopyStatus}
          />

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
                  // 貸す人に選んだメンバーは除外
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
                {members
                  // 借りる人に選んだメンバーは除外
                  .filter((m) => (debtorId ? m.user_id !== debtorId : true))
                  .map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.user_name}
                    </option>
                  ))}
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
        debtHistoryMutationIsPending={debtHistoryMutation.isPending}
        debtHistoryMutationIsError={debtHistoryMutation.isError}
        debtHistoryMutationIsSuccess={debtHistoryMutation.isSuccess}
        debtHistoryResult={debtHistoryResult}
        deleteGroupDebtHandler={deleteGroupDebtHandler}
        fullPaymentButtonDisabled={deleteGroupDebtMutation.isPending}
      />
    </>
  );
};

export default GroupDetail;
