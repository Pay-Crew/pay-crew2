import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  title: string;
};

const Title: FC<Props> = (props: Props) => {
  return <h1 className={styles.title}>{props.title}</h1>;
};

export default Title;
