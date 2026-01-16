import { type FC, type MouseEventHandler } from 'react';
// css
import styles from './index.module.css';
// icons
import type { IconType } from 'react-icons';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  Icon: IconType;
  label: string;
};

const LoginButton: FC<Props> = (props: Props) => {
  return (
    <div className={styles.buttonWrapper}>
      <button type="button" className={styles.button} onClick={props.onClick}>
        <props.Icon className={styles.icon} />
      </button>
      <p className={styles.label}>{props.label}</p>
    </div>
  );
};

export default LoginButton;
