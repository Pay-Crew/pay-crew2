import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  groupInfoResult: {
    group_name: string;
    invite_id: string;
    created_by_id: string;
    created_by_name: string;
    members: {
      user_id: string;
      user_name: string;
    }[];
  };
};

const Member: FC<Props> = (props: Props) => {
  return (
    <>
      <h3 className={styles.memberTitle}>参加メンバー</h3>
      <p className={styles.memberNames}>
        {(props.groupInfoResult?.members ?? []).map((member) => member.user_name).join('、')}
      </p>
    </>
  );
};

export default Member;
