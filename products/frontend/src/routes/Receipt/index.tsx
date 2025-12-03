import { useState, type FC } from "react";
// import styles from './index.module.css';
import InputImage from "./components/InputImage/InputImage";
import SelectPayUser from "./components/SelectPayUser/SelectPayUser";
import type { InputStep } from "./logic";
import ReceiptItems from "./components/ReceiptItems/ReceiptItems";

const Receipt: FC = () => {
  const users: string[] = ["Aさん", "Bさん", "Cさん", "Dさん"];
  const [receiptItems, setReceiptItems] = useState<{name: string, amount: number}[]>([]);
  const [inputStep, setInputStep] = useState<InputStep>("Image");
  const [payUser, setPayUser] = useState<number | null>(null);

  return(
    <main>
      <h1>レシート返金</h1>

      <InputImage setReceiptItems={(value) => setReceiptItems(value)} setInputStep={(value) => setInputStep(value)}/>

      <SelectPayUser users={users} inputStep={inputStep} payUser={payUser} setInputStep={(value) => setInputStep(value)} setPayUser={(value) => setPayUser(value)}/>

      <ReceiptItems users={users} payUser={payUser} receiptItems={receiptItems} inputStep={inputStep}/>
    </main>
  )
}

export default Receipt