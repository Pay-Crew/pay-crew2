import type { FC } from 'react';
import { useParams } from 'react-router';

const Invite: FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();

  return (
    <>
      <h1>招待</h1>
      <p>招待ID: {inviteId}</p>
    </>
  );
};

export default Invite;
