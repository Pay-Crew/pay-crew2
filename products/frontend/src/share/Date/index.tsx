import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const Error: FC<Props> = (props: Props) => {
  return <small className={styles.date}>{props.content}</small>;
};

export default Error;
