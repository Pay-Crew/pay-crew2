import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  user_name: string;
};

const WelcomeMessage: FC<Props> = (props: Props) => {
  return <p className={styles.message}>{props.user_name}さん、こんにちは</p>;
};

export default WelcomeMessage;
