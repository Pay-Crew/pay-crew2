import { type FC } from 'react';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const GroupName: FC<Props> = (props: Props) => {
  return <h1 className={styles.groupName}>{props.content}</h1>;
};

export default GroupName;
