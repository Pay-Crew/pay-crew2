import { type FC } from 'react';
// react-router
import { Outlet } from 'react-router';
// components
import Header from './components/Header';
import Footer from './components/Footer';
// css
import styles from './index.module.css';
import { Toaster } from 'react-hot-toast';

const Share: FC = () => {
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontSize: 'calc(1rem * 8 / 8)',
            fontWeight: 'bold',
            color: '#001c32',
            background: '#b09757',
            border: 'none',
          },
        }}
      />
      <Header />
      <div className={styles.container}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Share;
