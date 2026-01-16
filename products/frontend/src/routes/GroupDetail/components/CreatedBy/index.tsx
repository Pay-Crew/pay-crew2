import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const CreatedBy: FC<Props> = (props: Props) => {
  return (
    <div className={styles.createdByOuter}>
      <div className={styles.createdByWrapper}>
        <small className={styles.label}>created by&thinsp;:&nbsp;</small>
        <small className={styles.text}>{props.content}</small>
      </div>
    </div>
  );
};

export default CreatedBy;
