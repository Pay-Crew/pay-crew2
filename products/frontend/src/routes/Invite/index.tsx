import { useState, type FC } from 'react';
import { Link, useParams } from 'react-router';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// components
import { FormButton, Title } from '../../share';

const Invite: FC = () => {
  // URLパラメータからinviteIdを取得
  const { inviteId } = useParams<{ inviteId: string }>();

  // inviteIdが存在しない場合の処理
  if (!inviteId) return <p>Invite ID is not provided.</p>;

  // グループ参加処理
  const [result, setResult] = useState<string | null>(null);
  const { mutate, isSuccess, isPending, isError, error } = $api.useMutation('post', `/api/group/join`, {
    onSuccess: (data) => {
      // グループIDをセット
      setResult(data.group_id);
    },
  });

  // グループ参加ハンドラ
  const inviteHandler = (inviteId: string) => {
    mutate({ body: { invite_id: inviteId }, credentials: 'include' });
  };

  return (
    <>
      <Title title="グループの招待" />
      <FormButton content="参加" onClick={() => inviteHandler(inviteId)} />
      {isPending && <p>参加処理中...</p>}
      {isError && <p>エラーが発生しました: {error.message}</p>}
      {isSuccess && (
        <>
          <p>グループへの参加が完了しました。</p>
          <Link to={`/group/${result}`}>グループページへ移動</Link>
        </>
      )}
    </>
  );
};

export default Invite;
