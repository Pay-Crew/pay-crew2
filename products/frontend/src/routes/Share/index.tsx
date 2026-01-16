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
            fontSize: 'var(--text-base)',
            fontWeight: 'bold',
            color: 'var(--background-color-base)',
            background: 'var(--color-base)',
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
