import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const CreatedBy: FC<Props> = (props: Props) => {
  return (
    <div className={styles.createdByWrapper}>
      <small className={styles.createdByLabel}>created by&thinsp;:&nbsp;</small>
      <small className={styles.createdBy}>{props.content}</small>
    </div>
  );
};

export default CreatedBy;
