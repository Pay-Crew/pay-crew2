import { useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router';
// @tanstack/react-query
// import { useQueryClient } from '@tanstack/react-query';
import { $api } from '../../api/fetchClient';
import {
  registerGroupDebtRequestSchema,
  type GetGroupDebtHistoryResponseSchemaType,
  type GetGroupInfoResponseSchemaType,
  type RegisterGroupDebtRequestSchemaType,
} from 'validator';
// react-hook-form
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

const GroupDetail: FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  if (!groupId) return <p>Group ID is not provided.</p>;

  const [isGroupInfoResultError, setIsGroupInfoResultError] = useState<boolean>(false);
  const [groupInfoResult, setGroupInfoResult] = useState<GetGroupInfoResponseSchemaType | null>(null);
  const groupInfoMutation = $api.useMutation('post', `/api/group/info`, {
    onSuccess: (data) => {
      if (!data?.group_name || !data?.created_by || !data?.members) {
        setIsGroupInfoResultError(true);
      } else {
        // convert dat to GetGroupInfoResponseSchemaType
        const groupInfo: GetGroupInfoResponseSchemaType = {
          group_name: data.group_name,
          created_by: data.created_by,
          members: data.members,
        };
        // set group info result
        setGroupInfoResult(groupInfo);
      }
    },
  });

  const [isDebtHistoryResultError, setIsDebtHistoryResultError] = useState<boolean>(false);
  const [debtHistoryResult, setDebtHistoryResult] = useState<GetGroupDebtHistoryResponseSchemaType | null>(null);
  const debtHistoryMutation = $api.useMutation('post', `/api/group/debt/history`, {
    onSuccess: (data) => {
      if (!data?.debts) {
        setIsDebtHistoryResultError(true);
      } else {
        // convert dat to GetGroupDebtHistoryResponseSchemaType
        const debtHistory: GetGroupDebtHistoryResponseSchemaType = {
          debts: data.debts,
        };
        // set group info result
        setDebtHistoryResult(debtHistory);
      }
    },
  });

  useEffect(() => {
    groupInfoMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
    debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
  }, []);

  // register debt form
  const RegisterGroupDebtFormSchema = registerGroupDebtRequestSchema.omit({ group_id: true });
  type RegisterGroupDebtFormSchemaType = Omit<RegisterGroupDebtRequestSchemaType, 'group_id'>;

  const toDatetimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`; // "YYYY-MM-DDTHH:mm"
  };

  const debtRegisterMutation = $api.useMutation('post', `/api/group/debt/register`, {
    onSuccess: () => {
      debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
    },
  });

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

  const onSubmit: SubmitHandler<RegisterGroupDebtFormSchemaType> = (formData) => {
    // convert occurred_at to ISO string
    const occurred_at =
      formData.occurred_at && formData.occurred_at.trim() !== ''
        ? new Date(formData.occurred_at).toISOString()
        : undefined;

    console.log('Submitting debt registration with occurred_at:', occurred_at);

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

  const deleteGroupDebtMutation = $api.useMutation('delete', '/api/group/debt/delete', {
    onSuccess: (data) => {
      if (data?.debt_id) {
        debtHistoryMutation.mutate({ body: { group_id: groupId }, credentials: 'include' });
      }
    },
  });

  const deleteGroupDebtHandler = (debtId: string) => {
    deleteGroupDebtMutation.mutate({ body: { group_id: groupId, debt_id: debtId }, credentials: 'include' });
  };

  return (
    <>
      <h1>グループ</h1>
      <h2>グループ情報</h2>
      {groupInfoMutation.isSuccess && !isGroupInfoResultError && groupInfoResult ? (
        <div>
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
                    : ''}
            </p>
          </form>
        </div>
      ) : isGroupInfoResultError ? (
        <div>
          <p>グループ情報の取得に失敗しました。再度お試しください。</p>
        </div>
      ) : null}
      <h2>グループの貸し借りの履歴</h2>
      {debtHistoryMutation.isSuccess && !isDebtHistoryResultError && debtHistoryResult ? (
        <div>
          <ul>
            {debtHistoryResult.debts.map((debt, index) => (
              <li key={index}>
                {debt.debtor_name} さんが {debt.creditor_name} さんに {debt.amount} 円を負っています。
                <button
                  onClick={() => deleteGroupDebtHandler(debt.debt_id)}
                  disabled={deleteGroupDebtMutation.isPending}
                >
                  {deleteGroupDebtMutation.isPending ? '処理中...' : '完済'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : isDebtHistoryResultError ? (
        <div>
          <p>グループの履歴の取得に失敗しました。再度お試しください。</p>
        </div>
      ) : null}
    </>
  );
};

export default GroupDetail;
