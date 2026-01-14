import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../../../api/fetchClient';
// react-router
import { Link, NavLink, useNavigate } from 'react-router';
// css
import styles from './index.module.css';

const Header: FC = () => {
  // sessionのチェック
  const navigate = useNavigate();
  const sessionCheckMutation = $api.useMutation('get', '/api/session', {
    onError: () => {
      navigate('/login', { replace: true });
    },
  });
  useEffect(() => {
    sessionCheckMutation.mutate({ credentials: 'include' });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <Link to="/" className={styles.title}>
          Pay Crew2
        </Link>
      </div>
      <div className={styles.navContainer}>
        <>
          {sessionCheckMutation.isError && <Link to="/login">ログイン</Link>}
          {sessionCheckMutation.isSuccess && <p>{sessionCheckMutation.data.user_name}</p>}
        </>
        <nav className={styles.nav}>
          <NavLink to="/">トップ</NavLink>
          <NavLink to="/gen-group">グループ作成</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
