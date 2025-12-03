import { type FC } from 'react';
import { DeleteHistory, ReminderTest } from '..';
import styles from './History.module.css';
import { $api } from '../../../../api/fetchClient';

const History: FC = () => {
  const { data, isLoading, isError, error } = $api.useQuery('get', '/api/history');
  return (
    <>
      {isLoading ? (
        <p>読み込み中</p>
      ) : isError ? (
        <p>読み込みエラー: {error.message}</p>
      ) : (
        <table className={styles.historyList}>
          <thead>
            <tr className={styles.historyHeader}>
              <th className={styles.historyFromHeader}>まとめて払った人</th>
              <th className={styles.historyToHeader}>返金する人</th>
              <th className={styles.historyAmountHeader}>金額</th>
              <th className={styles.historyButtonHeader}></th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) ? (
              data
                .slice()
                .reverse()
                .map((v) => (
                  <tr className={styles.historyItem} key={v.id}>
                    <td className={styles.historyFromText}>{v.from}</td>
                    <td className={styles.historyToText}>{v.to}</td>
                    <td className={styles.historyAmountText}>{v.amount}</td>
                    <td>
                      <DeleteHistory id={v.id} />
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td>履歴がありません</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <ReminderTest historyData={data} />
    </>
  );
};

export default History;
