import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  subTitle: string;
};

const SubTitle: FC<Props> = (props: Props) => {
  return <h1 className={styles.subTitle}>{props.subTitle}</h1>;
};

export default SubTitle;
