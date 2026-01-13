import type { FC } from 'react';
import { MarkdownContent, Title } from '../../share';

const terms = `
# h1
## h2
### h3
#### h4
##### h5
###### h6
- リスト
1. 番号付きリスト
- [ ] チェックリスト
- [x] 完了したチェックリスト
**太字**
*斜体*
~~取り消し線~~
[リンク](https://example.com)

サンプル
`;

const Terms: FC = () => {
  return (
    <>
      <Title title="利用規約" />
      <MarkdownContent content={terms} />
    </>
  );
};

export default Terms;
