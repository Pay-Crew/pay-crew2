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
      deleted_at: string | null;
      deleted_by_id: string | null;
      deleted_by_name: string | null;
    }[];
  } | null;
  deleteGroupDebtHandler: (debtId: string) => void;
  fullPaymentButtonDisabled: boolean;
  cancelGroupDebtHandler: (debtId: string) => void;
  cancelButtonDisabled: boolean;
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

  // 完済済み履歴の 表示 / 非表示 切り換えハンドラ
  const [showCompleted, setShowCompleted] = useState(false);
  const toggleShowCompleted = () => {
    setShowCompleted((prev) => !prev);
  };

  return (
    <>
      <SubTitle subTitle="貸し借りの履歴" />
      {props.debtHistoryMutationIsPending && <Loading content="貸し借りの履歴を取得中..." />}
      {props.debtHistoryMutationIsError && <Error content="貸し借りの履歴の取得に失敗しました。" />}
      {props.debtHistoryMutationIsSuccess && props.debtHistoryResult && (
        <>
          <button className={styles.toggleButton} type="button" onClick={toggleShowCompleted}>
            {showCompleted ? '完済済み履歴を非表示にする' : '完済済み履歴を表示する'}
          </button>
          <p className={styles.note}>
            {showCompleted
              ? '※ このグループの全ての貸し借りの履歴を表示しています。'
              : '※ 完済済み履歴は非表示になっています。表示するには、上のボタンをクリックしてください。'}
          </p>
          <ul className={styles.ul}>
            {props.debtHistoryResult.debts.map((debt) =>
              debt.deleted_at === null ? (
                <li className={styles.li} key={debt.debt_id}>
                  <div className={styles.info}>
                    {/* section 1 */}
                    <p className={styles.summary}>
                      {debt.debtor_name} さんが {debt.creditor_name} さんに {debt.amount} 円を借りています。
                    </p>
                    {/* section 2 */}
                    <p>
                      <span className={styles.label}>[発生日]&nbsp;</span>
                      <span> {debt.occurred_at}</span>
                    </p>
                    {/* section 3 */}
                    {!detail.has(debt.debt_id) && (
                      <button className={styles.button} type="button" onClick={() => detailExpandHandler(debt.debt_id)}>
                        さらに表示
                      </button>
                    )}
                    {detail.has(debt.debt_id) && (
                      <>
                        <p className={styles.detail}>{debt.description || '詳細情報は、未記入のようです。'}</p>
                        <button
                          className={styles.button}
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
              ) : (
                showCompleted && (
                  <li className={styles.completedLi} key={debt.debt_id}>
                    <div className={styles.info}>
                      {/* section 1 */}
                      <p className={styles.completedSummary}>
                        {debt.debtor_name} さんが {debt.creditor_name} さんに {debt.amount} 円を借りていました。
                      </p>
                      {/* section 2 */}
                      <p>
                        <span className={styles.completedLabel}>[削除日]&nbsp;</span>
                        <span className={styles.completedValue}> {debt.deleted_at}</span>
                      </p>
                      {/* section 3 */}
                      <div className={styles.completedButtonWrapper}>
                        {!detail.has(debt.debt_id) ? (
                          <button
                            className={styles.button}
                            type="button"
                            onClick={() => detailExpandHandler(debt.debt_id)}
                          >
                            さらに表示
                          </button>
                        ) : (
                          <div role="none">{/* 完済取り消しボタンの一を固定するための、ダミーのDOM */}</div>
                        )}
                        <button
                          className={styles.button}
                          type="button"
                          onClick={() => props.cancelGroupDebtHandler(debt.debt_id)}
                          disabled={props.cancelButtonDisabled}
                        >
                          完済取り消し
                        </button>
                      </div>
                      {detail.has(debt.debt_id) && (
                        <div className={styles.completedDetailWrapper}>
                          <p>
                            <span className={styles.completedLabel}>deleted by&thinsp;:&nbsp;</span>
                            <span className={styles.completedValue}> {debt.deleted_by_name}</span>
                          </p>
                          <p>
                            <span className={styles.completedLabel}>[発生日]&nbsp;</span>
                            <span className={styles.completedValue}> {debt.occurred_at}</span>
                          </p>
                          <p className={styles.completedDetail}>
                            {debt.description || '詳細情報は、未記入のようです。'}
                          </p>
                          <button
                            className={styles.button}
                            type="button"
                            onClick={() => detailShrinkHandler(debt.debt_id)}
                          >
                            閉じる
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              )
            )}
          </ul>
        </>
      )}
    </>
  );
};

export default History;
