import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  path: string;
  content: string;
};

const LinkButton: FC<Props> = (props: Props) => {
  return <h1 className={styles.title}>{props.content}</h1>;
};

export default LinkButton;
