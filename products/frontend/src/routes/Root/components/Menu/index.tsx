import { type FC } from 'react';
// react-router
import { Link } from 'react-router';
// css
import styles from './index.module.css';

const Menu: FC = () => {
  return (
    <div className={styles.welcomeBox}>
      <Link className={styles.button} to="/profile">
        アカウント設定
      </Link>
      <Link className={styles.button} to="/gen-group">
        グループ作成
      </Link>
    </div>
  );
};

export default Menu;
