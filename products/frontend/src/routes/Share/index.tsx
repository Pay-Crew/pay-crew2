import { type FC } from 'react';
// react-router
import { Outlet } from 'react-router';
// components
import Header from './components/Header';
import Footer from './components/Footer';
// css
import styles from './index.module.css';

const Share: FC = () => {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Share;
