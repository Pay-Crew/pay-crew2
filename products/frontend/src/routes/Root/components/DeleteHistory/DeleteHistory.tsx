import { type FC } from 'react';
import styles from './DeleteHistory.module.css';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '../../../../api/fetchClient';

type Props = {
  id: number;
};

const DeleteHistory: FC<Props> = (props: Props) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isSuccess, isError, error } = $api.useMutation('delete', '/api/history', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/api/history').queryKey });
    },
  });

  const deleteHistoryById = async (id: number) => {
    mutate({ body: { id } });
  };

  return (
    <>
      <button
        className={styles.buttonDelete}
        onClick={async () => {
          await deleteHistoryById(props.id);
        }}
        disabled={isPending}
      >
        {isPending ? (
          '削除中'
        ) : isSuccess ? (
          '削除完了'
        ) : (
          <img src="/dust-box.png" alt="削除" className={styles.dustBox} />
        )}
      </button>
      {isError ? <p>削除に失敗しました: {error.message}</p> : null}
    </>
  );
};

export default DeleteHistory;
