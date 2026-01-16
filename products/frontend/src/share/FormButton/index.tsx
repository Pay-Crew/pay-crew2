import { type FC, type MouseEventHandler } from 'react';
// css
import styles from './index.module.css';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  content: string;
};

const FormButton: FC<Props> = (props: Props) => {
  return (
    <button type="submit" className={styles.button} onClick={props.onClick} disabled={props.disabled}>
      {props.content}
    </button>
  );
};

export default FormButton;
