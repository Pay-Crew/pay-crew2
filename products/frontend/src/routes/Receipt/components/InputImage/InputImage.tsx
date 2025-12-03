import { useState, type FC } from "react";
import styles from './InputImage.module.css';
import type { InputStep } from "../../logic";

interface Props {
  setReceiptItems: (value: {name: string, amount: number}[]) => void,
  setInputStep: (value: InputStep) => void
}

const InputImage: FC<Props> = (props) => {
  const [image, setImage] = useState<string | null>(null);

  const handleInputImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList: FileList | null = e.target.files;
    if (fileList === null) {
      return;
    }
    
    const file: File | null = fileList.item(0);
    if (file === null) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const fileBase64 = fileReader.result;

      if (typeof fileBase64 !== "string") {
        return;
      }

      setImage(fileBase64);
      props.setReceiptItems([
        {name: "ハンバーグ定食", amount: 980},
        {name: "ドリンクバー", amount: 200},
        {name: "デザートプレート", amount: 450},
        {name: "チーズトッピング", amount: 120}
      ]);
      props.setInputStep("PayUser");
    }

    fileReader.readAsDataURL(file);
  }

  return(
    <div className={styles.imgInput}>
      <div>
        <input type="file" accept="image/*" onChange={handleInputImage}></input>
      </div>
      {
        image === null
        ? null
        : <div><img src={image} /></div>
      }
    </div>
  )
}

export default InputImage;