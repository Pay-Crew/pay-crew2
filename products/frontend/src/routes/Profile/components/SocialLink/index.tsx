import { useEffect, useState, type FC } from 'react';
// better-auth
import { authClient } from '../../../../lib/auth';
// icons
import { FaDiscord, FaGoogle } from 'react-icons/fa6';
// css
import styles from './index.module.css';
import { SubTitle } from '..';

type Provider = 'discord' | 'google';
type LinkedSocialAccount = {
  provider: Provider;
  isLinked: boolean;
};

const SocialLink: FC = () => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedSocialAccount[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await authClient.listAccounts();
      if (session.data) {
        for (const account of session.data) {
          setLinkedAccounts((prev) => [
            ...prev,
            { provider: account.providerId as 'discord' | 'google', isLinked: true },
          ]);
        }
      } else {
        console.log('No linked accounts found.');
      }
    };
    fetchSession();
  }, []);

  const handleDiscordLinkSocial = async () => {
    await authClient.linkSocial({
      provider: 'discord',
      callbackURL: `${import.meta.env.VITE_REDIRECT_URL satisfies string}profile`,
    });
  };
  const handleGoogleLinkSocial = async () => {
    await authClient.linkSocial({
      provider: 'google',
      callbackURL: `${import.meta.env.VITE_REDIRECT_URL satisfies string}profile`,
    });
  };

  return (
    <>
      <SubTitle subTitle="ソーシャルアカウント連携" />
      <div className={styles.accountContainer}>
        <div className={styles.iconWrapper}>
          <FaDiscord className={styles.icon} />
          <p className={styles.iconLabel}>Discord</p>
        </div>
        {linkedAccounts.find((account) => account.provider === 'discord' && account.isLinked) ? (
          <button className={styles.button} disabled={true}>
            連携済み
          </button>
        ) : (
          <button className={styles.button} onClick={handleDiscordLinkSocial} disabled={false}>
            連携する
          </button>
        )}
      </div>
      <div className={styles.accountContainer}>
        <div className={styles.iconWrapper}>
          <FaGoogle className={styles.icon} />
          <p className={styles.iconLabel}>Google</p>
        </div>
        {linkedAccounts.find((account) => account.provider === 'google' && account.isLinked) ? (
          <button className={styles.button} disabled={true}>
            連携済み
          </button>
        ) : (
          <button className={styles.button} onClick={handleGoogleLinkSocial} disabled={false}>
            連携する
          </button>
        )}
      </div>
    </>
  );
};

export default SocialLink;
