import { type FC, type MouseEventHandler } from 'react';
// css
import styles from './index.module.css';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled: boolean;
};

const FullPaymentButton: FC<Props> = (props: Props) => {
  return (
    <button className={styles.button} type="button" onClick={props.onClick} disabled={props.disabled}>
      {!props.disabled && '完済'}
    </button>
  );
};

export default FullPaymentButton;
