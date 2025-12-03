import type { FC } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { historyPostRequestSchema, type HistoryPostRequestSchemaType } from 'validator';
import { useForm, type SubmitHandler } from 'react-hook-form';
import styles from './HistoryForm.module.css';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '../../../../api/fetchClient';

const HistoryForm: FC = () => {
  const queryClient = useQueryClient();
  const { mutate, isSuccess, isPending, isError, error } = $api.useMutation('post', '/api/history', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/api/history').queryKey });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HistoryPostRequestSchemaType>({
    resolver: zodResolver(historyPostRequestSchema),
    defaultValues: {
      from: '',
      to: '',
      amount: 1,
    },
  });

  const onSubmit: SubmitHandler<HistoryPostRequestSchemaType> = async (formData) => {
    mutate({ body: formData });
  };

  return (
    <form id="loan-form" onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formGroup}>
        <label htmlFor="from">まとめて払った人の名前:</label>
        <input id="from" type="text" {...register('from')} />
        <ErrorMessage errors={errors} name="from" />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="to">返金する人の名前:</label>
        <input id="to" type="text" {...register('to')} />
        <ErrorMessage errors={errors} name="to" />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="amount">借りた金額 (円):</label>
        <input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
        <ErrorMessage errors={errors} name="amount" />
      </div>

      <button type="submit" disabled={isPending} className={styles.buttonAdd}>
        追加
      </button>
      <p>
        {isPending ? '追加中...' : isError ? `追加に失敗しました: ${error.message}` : isSuccess ? '追加しました' : ''}
      </p>
    </form>
  );
};

export default HistoryForm;
