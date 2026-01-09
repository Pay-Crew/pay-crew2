import { useState, type FC } from 'react';
import { Link, useParams } from 'react-router';
// @tanstack/react-query
// import { useQueryClient } from '@tanstack/react-query';
import { $api } from '../../api/fetchClient';

const Invite: FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  if (!inviteId) return <p>Invite ID is not provided.</p>;

  const [isResultError, setIsResultError] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const { mutate, isSuccess, isPending, isError, error } = $api.useMutation('post', `/api/group/join`, {
    onSuccess: (data) => {
      if (!data?.group_id) {
        setIsResultError(true);
      } else {
        setResult(data.group_id);
      }
    },
  });

  const inviteClickHandler = (inviteId: string) => {
    mutate({ body: { invite_id: inviteId }, credentials: 'include' });
  };

  return (
    <>
      <h1>招待</h1>
      <p>招待ID: {inviteId}</p>
      <button onClick={() => inviteClickHandler(inviteId)}>参加する</button>
      {isPending && <p>参加処理中...</p>}
      {result && <p>参加したグループID: {result}</p>}
      {isError && <p>エラーが発生しました: {error.message}</p>}
      {isSuccess && !isResultError && result ? (
        <div>
          <h2>グループ参加結果</h2>
          <p>グループID: {result} に参加しました。</p>
          <Link to={`/group/${result}`}>グループページへ移動</Link>
        </div>
      ) : isResultError ? (
        <div>
          <h2>グループ参加結果</h2>
          <p>グループの参加に失敗しました。再度お試しください。</p>
        </div>
      ) : null}
    </>
  );
};

export default Invite;
