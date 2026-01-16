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
      <Link to="/" className={styles.title}>
        Pay Crew2
      </Link>
      <nav className={styles.nav}>
        <NavLink to="/">トップ</NavLink>
        <NavLink to="/gen-group">グループ作成</NavLink>
      </nav>
    </header>
  );
};

export default Header;
