import { useEffect, useState, type FC } from 'react';
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

const GroupDetail: FC = () => {
  // URLパラメータからgroupIdを取得
  const { groupId } = useParams<{ groupId: string }>();

  // groupIdが存在しない場合の処理
  if (!groupId) return <p>Group ID is not provided.</p>;

  // グループ情報の取得
  const [groupInfoResult, setGroupInfoResult] = useState<GetGroupInfoResponseSchemaType | null>(null);
  const groupInfoMutation = $api.useMutation('post', `/api/group/info`, {
    onSuccess: (data) => {
      // グループ情報をセット
      setGroupInfoResult(data);
    },
  });

  // グループの貸し借り履歴の取得
  const [debtHistoryResult, setDebtHistoryResult] = useState<GetGroupDebtHistoryResponseSchemaType | null>(null);
  const debtHistoryMutation = $api.useMutation('post', `/api/group/debt/history`, {
    onSuccess: (data) => {
      // グループの貸し借り履歴をセット
      setDebtHistoryResult(data);
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
    },
  });

  //NOTE: こいつは、どうにかする予定
  const toDatetimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`; // "YYYY-MM-DDTHH:mm"
  };

  // react-hook-formの設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterGroupDebtFormSchemaType>({
    resolver: zodResolver(RegisterGroupDebtFormSchema),
    defaultValues: {
      creditor_id: '',
      debtor_id: '',
      amount: 0,
      description: '',
      occurred_at: toDatetimeLocal(new Date()),
    },
  });

  // 貸し借り登録ハンドラ
  const onSubmit: SubmitHandler<RegisterGroupDebtFormSchemaType> = (formData) => {
    // occurred_atをISO文字列に変換（未入力の場合はundefined）
    const occurred_at =
      typeof formData.occurred_at === 'string' && formData.occurred_at !== ''
        ? new Date(formData.occurred_at).toISOString()
        : undefined;

    debtRegisterMutation.mutate({
      body: {
        group_id: groupId,
        debtor_id: formData.debtor_id,
        creditor_id: formData.creditor_id,
        amount: formData.amount,
        description: formData.description,
        occurred_at: occurred_at,
      },
      credentials: 'include',
    });
  };

  // 貸し借り削除処理
  const deleteGroupDebtMutation = $api.useMutation('delete', '/api/group/debt/delete', {
    onSuccess: () => {
      debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
    },
  });

  // 貸し借り削除ハンドラ
  const deleteGroupDebtHandler = (debtId: string) => {
    deleteGroupDebtMutation.mutate({ body: { group_id: groupId, debt_id: debtId }, credentials: 'include' });
  };

  return (
    <>
      <h1>グループ情報</h1>
      {groupInfoMutation.isPending && <p>グループ情報を取得中...</p>}
      {groupInfoMutation.isError && <p>グループ情報の取得に失敗しました。再度お試しください。</p>}
      {groupInfoMutation.isSuccess && groupInfoResult && (
        <>
          <p>グループ名: {groupInfoResult.group_name}</p>
          <p>作成者: {groupInfoResult.created_by}</p>
          <h3>メンバー一覧</h3>
          <ul>
            {groupInfoResult.members.map((member) =>
              member ? (
                <li key={member.user_id}>
                  {member.user_name} (ID: {member.user_id})
                </li>
              ) : null
            )}
          </ul>
          <h2>貸し借りの登録</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="debtor_id">借りる人のID:</label>
              <input id="debtor_id" type="text" {...register('debtor_id')} />
              <ErrorMessage errors={errors} name="debtor_id" />
            </div>

            <div>
              <label htmlFor="creditor_id">貸す人のID:</label>
              <input id="creditor_id" type="text" {...register('creditor_id')} />
              <ErrorMessage errors={errors} name="creditor_id" />
            </div>

            <div>
              <label htmlFor="amount">金額:</label>
              <input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
              <ErrorMessage errors={errors} name="amount" />
            </div>

            <div>
              <label htmlFor="description">詳細:</label>
              <input id="description" type="text" {...register('description')} />
              <ErrorMessage errors={errors} name="description" />
            </div>

            <div>
              <label htmlFor="occurred_at">発生日時:</label>
              <input id="occurred_at" type="datetime-local" {...register('occurred_at')} />
              <ErrorMessage errors={errors} name="occurred_at" />
            </div>

            <button type="submit" disabled={debtRegisterMutation.isPending}>
              貸し借りを登録
            </button>
            <p>
              {debtRegisterMutation.isPending
                ? 'グループの作成中...'
                : debtRegisterMutation.isError
                  ? `グループの作成に失敗しました: ${debtRegisterMutation.error.message}`
                  : debtRegisterMutation.isSuccess
                    ? 'グループの作成しました'
                    : null}
            </p>
          </form>
        </>
      )}
      <h2>グループの貸し借りの履歴</h2>
      {debtHistoryMutation.isPending && <p>貸し借りの履歴を取得中...</p>}
      {debtHistoryMutation.isError && <p>貸し借りの履歴の取得に失敗しました。再度お試しください。</p>}
      {debtHistoryMutation.isSuccess && debtHistoryResult && (
        <ul>
          {debtHistoryResult.debts.map((debt, index) => (
            <li key={index}>
              {debt.debtor_name} さんが {debt.creditor_name} さんに {debt.amount} 円を借りています。
              <button onClick={() => deleteGroupDebtHandler(debt.debt_id)} disabled={deleteGroupDebtMutation.isPending}>
                {deleteGroupDebtMutation.isPending ? '処理中...' : '完済した'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default GroupDetail;
