import { type FC } from 'react';
// icons
import { ArrowBigDown } from 'lucide-react';
// css
import styles from './index.module.css';

const Description: FC = () => {
  return (
    <>
      <p className={styles.description}>
        Pay Crew2は、友人や家族と簡単にお金の貸し借りを管理できる「共有の台帳」です。
      </p>
      <div className={styles.container}>
        <h3 className={styles.label}>使い方の3ステップ</h3>
        <ol className={styles.ol}>
          <li>代表者が「グループ作成」を選択してグループを作成</li>
          <li>招待URLをグループに参加してほしい人に送信</li>
          <li>招待URLをクリックして参加してもらう</li>
        </ol>
        <ArrowBigDown className={styles.icon} />
        <p className={styles.description}>あとは、グループ内でのお金の貸し借りを記録するだけ！</p>
      </div>
    </>
  );
};

export default Description;
