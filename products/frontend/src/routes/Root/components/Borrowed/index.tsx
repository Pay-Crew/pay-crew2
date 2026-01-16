import { type FC, type MouseEventHandler } from 'react';
// components
import { FullPaymentButton, SubTitle } from '../../../../share';
// css
import styles from './index.module.css';

type Props = {
  receivables: {
    counterparty_id: string;
    counterparty_name: string;
    amount: number;
  }[];
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled: boolean;
};

const Borrowed: FC<Props> = (props: Props) => {
  return (
    <>
      <SubTitle subTitle="受け取る金額 一覧" />
      {props.receivables.length === 0 ? (
        <p className={styles.message}>受け取るお金はありません</p>
      ) : (
        <ul className={styles.ul}>
          {props.receivables.map((t) => (
            <li key={t.counterparty_id}>
              <p>
                {t.counterparty_name} から {Math.abs(t.amount)}円
              </p>
              <FullPaymentButton onClick={props.onClick} disabled={props.disabled} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Borrowed;
