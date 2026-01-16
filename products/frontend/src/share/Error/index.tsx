import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const Error: FC<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
        <span className={styles.box}></span>
      </div>
      <p className={styles.content}>{props.content}</p>
    </div>
  );
};

export default Error;
