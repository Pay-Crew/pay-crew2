import { useState, type FC } from 'react';
import { Link, useParams } from 'react-router';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';

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
      <h1>招待</h1>
      <button onClick={() => inviteHandler(inviteId)}>参加する</button>
      {isPending && <p>参加処理中...</p>}
      {isError && <p>エラーが発生しました: {error.message}</p>}
      {isSuccess && (
        <>
          <h2>グループ参加結果</h2>
          <p>グループID: {result} に参加しました。</p>
          <Link to={`/group/${result}`}>グループページへ移動</Link>
        </>
      )}
    </>
  );
};

export default Invite;
