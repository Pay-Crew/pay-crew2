import { useEffect, useRef, type FC } from "react";
import styles from './ReceiptItem.module.css';
import type React from "react";

interface Props {
  item: {name: string, amount: number},
  setChecked: (value: boolean) => void,
  resetFlag: boolean
}

const ReceiptItem: FC<Props> = (props) => {
  const handleOnCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setChecked(e.target.checked)
  }
  const checkbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    props.setChecked(false);
    checkbox.current!.checked! = false;
  }, [props.resetFlag])

  return (
    <div className={styles.itemCard}>
      <input type="checkbox" className={styles.itemCheckbox} onChange={handleOnCheck} ref={checkbox}/>
      <div className={styles.itemInfo}>
        <span className={styles.itemName}>{props.item.name}</span>
        <span className={styles.itemPrice}>{props.item.amount}</span>
      </div>
    </div>
  )
}

export default ReceiptItem;