import type { FC } from 'react';
import { useParams } from 'react-router';

const GroupDetail: FC = () => {
  const { groupId } = useParams<{ groupId: string }>();

  return (
    <>
      <h1>グループ詳細</h1>
      <p>グループ名: {groupId}</p>
    </>
  );
};

export default GroupDetail;
