import { useState, type FC } from 'react';
import { Link, useParams } from 'react-router';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// components
import { FormButton, Title, Error } from '../../share';
// toast
import { toast } from 'react-hot-toast';
// css
import styles from './index.module.css';

const Invite: FC = () => {
  // URLパラメータからinviteIdを取得
  const { inviteId } = useParams<{ inviteId: string }>();

  // inviteIdが存在しない場合の処理
  if (!inviteId) return <Error content="招待IDが指定されていません。" />;

  // グループ参加処理
  const [result, setResult] = useState<string | null>(null);
  const { mutate, isSuccess } = $api.useMutation('post', `/api/group/join`, {
    onSuccess: (data) => {
      // グループIDをセット
      setResult(data.group_id);
      toast.success('グループへの参加に成功しました', { id: 'invite-join-group' });
    },
    onError: () => {
      setResult(null);
      toast.error('グループへの参加に失敗しました', { id: 'invite-join-group' });
    },
    onMutate: () => {
      setResult(null);
      toast.loading('グループへの参加中...', { id: 'invite-join-group' });
    },
  });

  // グループ参加ハンドラ
  const inviteHandler = (inviteId: string) => {
    mutate({ body: { invite_id: inviteId }, credentials: 'include' });
  };

  return (
    <>
      <Title title="グループの招待" />
      {!isSuccess && <FormButton content="参加" onClick={() => inviteHandler(inviteId)} />}
      {isSuccess && (
        <>
          <p className={styles.successMessage}>グループに参加しました。</p>
          <Link className={styles.groupLink} to={`/group/${result}`}>
            グループページへ移動
          </Link>
        </>
      )}
    </>
  );
};

export default Invite;
