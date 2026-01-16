import { useState, type FC } from 'react';
// components
import { Loading, Error, SubTitle, FullPaymentButton } from '../../../../share';
// css
import styles from './index.module.css';

type Props = {
  debtHistoryMutationIsPending: boolean;
  debtHistoryMutationIsError: boolean;
  debtHistoryMutationIsSuccess: boolean;
  debtHistoryResult: {
    debts: {
      debt_id: string;
      debtor_id: string;
      debtor_name: string;
      creditor_id: string;
      creditor_name: string;
      amount: number;
      description: string;
      occurred_at: string;
    }[];
  } | null;
  deleteGroupDebtHandler: (debtId: string) => void;
  fullPaymentButtonDisabled: boolean;
};

const History: FC<Props> = (props: Props) => {
  // 詳細展開ハンドラ
  const [detail, setDetail] = useState<Set<string>>(new Set());
  const detailExpandHandler = (debtId: string) => {
    setDetail((prev) => new Set(prev).add(debtId));
  };
  const detailShrinkHandler = (debtId: string) => {
    setDetail((prev) => {
      const newSet = new Set(prev);
      newSet.delete(debtId);
      return newSet;
    });
  };

  return (
    <>
      <SubTitle subTitle="貸し借りの履歴" />
      {props.debtHistoryMutationIsPending && <Loading content="貸し借りの履歴を取得中..." />}
      {props.debtHistoryMutationIsError && <Error content="貸し借りの履歴の取得に失敗しました。" />}
      {props.debtHistoryMutationIsSuccess && props.debtHistoryResult && (
        <ul className={styles.moneyUl}>
          {props.debtHistoryResult.debts.map((debt, index) => (
            <li className={styles.moneyLi} key={index}>
              <div className={styles.moneyInfo}>
                <p className={styles.moneySummary}>
                  {debt.debtor_name} さんが {debt.creditor_name} さんに {debt.amount} 円を借りています。
                </p>
                <p className={styles.moneyMetaInfo}>[発生日]&nbsp;{debt.occurred_at}</p>
                {!detail.has(debt.debt_id) && (
                  <button
                    className={styles.detailButton}
                    type="button"
                    onClick={() => detailExpandHandler(debt.debt_id)}
                  >
                    さらに表示
                  </button>
                )}
                {detail.has(debt.debt_id) && (
                  <>
                    <p className={styles.moneyDetail}>{debt.description || '詳細情報は、未記入のようです。'}</p>
                    <button
                      className={styles.detailButton}
                      type="button"
                      onClick={() => detailShrinkHandler(debt.debt_id)}
                    >
                      閉じる
                    </button>
                  </>
                )}
              </div>
              <FullPaymentButton
                onClick={() => props.deleteGroupDebtHandler(debt.debt_id)}
                disabled={props.fullPaymentButtonDisabled}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default History;
