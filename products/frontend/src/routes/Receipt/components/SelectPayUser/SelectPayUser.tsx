import { type FC } from "react";
import styles from './SelectPayUser.module.css';
import type { InputStep } from "../../logic";

interface Props {
  users: string[],
  inputStep: InputStep,
  payUser: number | null,
  setInputStep: (value: InputStep) => void,
  setPayUser: (value: number | null) => void
}

const SelectPayUser: FC<Props> = (props) => {
  const handleSelectUser = (i: number) => {
    props.setPayUser(i);
    props.setInputStep("ReceiptItems");
  }

  return(      
    <div className={`${styles.personButtonsBlock} ${props.inputStep === "Image" ? styles.unvisible: ""}`}>
      <div className={styles.personButtonsTitle}>
        払った人を選択してください
      </div>
      <div className={styles.personButtons}>
        {
          props.users.map((v, i) => (
            <button 
              className={`${styles.personButton} ${props.payUser === i ? styles.personButtonSelected : ""}`}
              key={i}
              disabled={props.inputStep === "ReceiptItems"}
              onClick={() => (handleSelectUser(i))}
            >
              {v}
            </button>
          ))
        }
      </div>
    </div>
  )
}

export default SelectPayUser;