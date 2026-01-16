import { type FC } from 'react';
// react-router
import { Link } from 'react-router';
// css
import styles from './index.module.css';

const Menu: FC = () => {
  return (
    <div className={styles.welcomeBox}>
      <Link to="/profile">プロフィール編集へ</Link>
      <Link to="/gen-group">グループ作成へ</Link>
    </div>
  );
};

export default Menu;
