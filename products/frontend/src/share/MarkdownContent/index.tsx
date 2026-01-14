import { type FC } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// css
import styles from './index.module.css';

type Props = {
  content: string;
};

const MarkdownContent: FC<Props> = (props: Props) => {
  return (
    <div className={styles.markdown}>
      <Markdown remarkPlugins={[remarkGfm]}>{props.content}</Markdown>
    </div>
  );
};

export default MarkdownContent;
