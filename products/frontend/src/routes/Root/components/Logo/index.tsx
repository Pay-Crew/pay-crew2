import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const Logo: FC<Props> = (props: Props) => {
  return <h1 className={styles.logo}>{props.content}</h1>;
};

export default Logo;
