import type { FC } from 'react';
// components
import { SubTitle } from '../../../../share';
// css
import styles from './index.module.css';

type Props = {
  paybacks: {
    counterparty_id: string;
    counterparty_name: string;
    amount: number;
  }[];
};

const Borrow: FC<Props> = (props: Props) => {
  return (
    <>
      <SubTitle subTitle="返す合計金額 一覧" />
      {props.paybacks.length === 0 ? (
        <p className={styles.message}>返すお金はありません</p>
      ) : (
        <ul className={styles.ul}>
          {props.paybacks.map((t) => (
            <li className={styles.li} key={t.counterparty_id}>
              {t.counterparty_name} に {t.amount}円
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Borrow;
