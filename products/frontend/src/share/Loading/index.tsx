import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const Loading: FC<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.loader} aria-hidden="true">
        <span className={styles.box}></span>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
      </div>
      <p className={styles.content} role="note">
        {props.content}
      </p>
    </div>
  );
};

export default Loading;
