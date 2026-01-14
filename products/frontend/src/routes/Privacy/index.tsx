import type { FC } from 'react';
import { MarkdownContent, Title } from '../../share';

const privacy = `
# h1
## h2
サンプル
`;

const Privacy: FC = () => {
  return (
    <>
      <Title title="プライバシーポリシー" />
      <MarkdownContent content={privacy} />
    </>
  );
};

export default Privacy;
