import { useEffect, useState, type FC } from "react";
import styles from './ReceiptItems.module.css';
import type { InputStep } from "../../logic";
import ReceiptItem from "../ReceiptItem/ReceiptItem";

interface Props {
  users: string[],
  payUser: number | null,
  receiptItems: {name: string, amount: number}[],
  inputStep: InputStep
}

const ReceiptItems: FC<Props> = (props) => {
  const [repay, setRepay] = useState<boolean[][]>(Array.from(new Array(props.users.length), () => Array(props.receiptItems.length).fill(false)));
  const [repayAmount, setRepayAmount] = useState<number[]>(Array(props.users.length).fill(0));
  const [checked, setChecked] = useState<boolean[]>(Array(props.receiptItems.length).fill(false));
  const [resetFlag, setResetFlag] = useState<boolean>(false);

  useEffect(() => {
    setRepay(Array.from(new Array(props.users.length), () => Array(props.receiptItems.length).fill(false)));
    setChecked(Array(props.receiptItems.length).fill(false));
  }, [props.receiptItems]);

  useEffect(() => {
    const repayAmountSum: number[] = Array(props.users.length).fill(0);
    for (let item = 0; item < props.receiptItems.length; item++) {
      const repayUsers: number[] = [];
      for (let user = 0; user < props.users.length; user++) {
        if (repay[user][item]) {
          repayUsers.push(user);
        }
      }
      repayUsers.forEach((user) => {
        repayAmountSum[user] += Math.floor(props.receiptItems[item].amount / repayUsers.length);
      })
    }
    setRepayAmount(repayAmountSum);
  }, [repay]);

  const addRepay = (value: {user: number | "割り勘", items: boolean[]}) => {
    if (value.user === "割り勘") {
      const repayTmp = Array.from(new Array(props.users.length), () => Array(props.receiptItems.length).fill(false));
      for (let user = 0; user < props.users.length; user++) {
        for (let item = 0; item < props.receiptItems.length; item++) {
          repayTmp[user][item] = value.items[item] || repay[user][item];
        }
      }
      setRepay(repayTmp);
    } else {
      const repayTmp = Array.from(new Array(props.users.length), () => Array(props.receiptItems.length).fill(false));
      for (let user = 0; user < props.users.length; user++) {
        for (let item = 0; item < props.receiptItems.length; item++) {
          repayTmp[user][item] = (user === value.user && value.items[item]) || repay[user][item];
        }
      }
      setRepay(repayTmp);
    }
  }

  const joinRepayName = (user: number): string => {
    const result: string[] = [];
    repay[user].forEach((isRepayTarget, item) => {
      if (isRepayTarget) {
        result.push(props.receiptItems[item].name);
      }
    })
    return result.join(", ");
  }

  const handleReturn = (user: number | "割り勘") => {
    addRepay({ user: user, items: checked });
    setResetFlag((prev) => !prev);
  }

  return(
    <div className={`${props.inputStep === "ReceiptItems" ? "" : styles.unvisible}`}>
      <div className={styles.itemList}>
        {
          props.receiptItems.map((v, i) => <ReceiptItem item={v} setChecked={(value) => setChecked((prev) => {
            prev[i] = value;
            return prev;
          })} resetFlag={resetFlag} key={i} />)
        }
      </div>

      <div className={styles.personButtonsBlock}>
        <div className={styles.personButtonsTitle}>
          返金する人を選択してください
        </div>
        <div className={styles.personButtons}>
          {
            props.users.map((v, i) => (
              props.payUser == i
              ? null
              : <button 
                className={styles.personButton}
                key={i}
                onClick={() => handleReturn(i)}
              >
                {v}
              </button>
            ))
          }
          <button 
            className={styles.personButton}
            onClick={() => handleReturn("割り勘")}
          >
            割り勘
          </button>
        </div>
      </div>

      {
        props.payUser === null
        ? null
        : <table className={styles.paymentTable}>
          <thead>
            <tr>
              <th>返金する人</th>
              <th>受け取る人</th>
              <th>金額</th>
              <th>内訳</th>
            </tr>
          </thead>
          <tbody>
            {
              repayAmount.map((amount, user) => (
                amount === 0 || user === props.payUser
                ? null
                : <tr key={user}>
                  <td>{props.users[user]}</td>
                  <td>{props.users[props.payUser!]}</td>
                  <td>{amount}</td>
                  <td>{joinRepayName(user)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      }
      
      <div className={styles.inputButton}>
        <button className={styles.buttonAdd}>追加</button>
      </div>
    </div>
  )
}

export default ReceiptItems;