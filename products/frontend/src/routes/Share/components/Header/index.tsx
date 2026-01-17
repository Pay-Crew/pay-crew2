import { useEffect, useState, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../../../api/fetchClient';
// react-router
import { Link, NavLink, useNavigate } from 'react-router';
// icons
import { generateIdenteapot } from '@teapotlabs/identeapots';
// toast
import { toast } from 'react-hot-toast';
// css
import styles from './index.module.css';

const Header: FC = () => {
  const [identicon, setIdenticon] = useState<string>('');
  // sessionのチェック
  const navigate = useNavigate();
  const sessionCheckMutation = $api.useMutation('get', '/api/session', {
    onSuccess: async (data) => {
      try {
        const salt = import.meta.env.VITE_IDENTEAPOT_SALT satisfies string;
        const icon = await generateIdenteapot(data.user_id, salt);
        setIdenticon(icon);
      } catch {
        toast.error('アイコンの生成に失敗しました。');
      }
    },
    onError: () => {
      navigate('/login', { replace: true });
    },
  });

  useEffect(() => {
    sessionCheckMutation.mutate({ credentials: 'include' });
  }, [sessionCheckMutation]);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.title}>
        Pay Crew2
      </Link>
      <nav className={styles.nav}>
        <NavLink to="/">トップ</NavLink>
        <NavLink to="/gen-group">グループ作成</NavLink>
        {identicon && <img className={styles.identicon} src={identicon} alt="User Identicon" />}
      </nav>
    </header>
  );
};

export default Header;
