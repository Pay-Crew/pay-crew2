import { type FC } from 'react';
// react-router
import { Link } from 'react-router';
// css
import styles from './index.module.css';

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>&copy; {new Date().getFullYear()} Pay Crew2. All rights reserved.</p>
      <nav className={styles.nav}>
        <Link className={styles.link} to="/privacy">
          プライバシーポリシー
        </Link>
        <Link className={styles.link} to="/terms">
          利用規約
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
