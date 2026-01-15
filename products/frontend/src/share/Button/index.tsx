import { type FC, type MouseEventHandler } from 'react';
// css
import styles from './index.module.css';

type Props = {
  type: 'button' | 'submit' | 'reset';
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  content: string;
};

const Button: FC<Props> = (props: Props) => {
  return (
    <button type={props.type} className={styles.button} onClick={props.onClick} disabled={props.disabled}>
      {props.content}
    </button>
  );
};

export default Button;
