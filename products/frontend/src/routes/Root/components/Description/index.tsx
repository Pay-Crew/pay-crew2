import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const Description: FC<Props> = (props: Props) => {
  return <p className={styles.description}>{props.content}</p>;
};

export default Description;
