import type { FC } from 'react';
// css
import styles from './index.module.css';

const NotFound: FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.statusCode}>-404-</h1>
      <h2 className={styles.statusMessage}>Page Not Found</h2>
    </div>
  );
};

export default NotFound;
