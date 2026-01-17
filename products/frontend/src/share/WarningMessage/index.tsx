import { type FC } from 'react';
// components
import { Error } from '../';
// css
import styles from './index.module.css';

const WarningMessage: FC = () => {
  return (
    <div className={styles.warningMessageWrapper}>
      <Error content="Pay Crew2は、まだ開発中です。そのため、予告なくデータが消失する可能性があります。また、サービスの仕様が変更されることがあります。これらを含む「Pay Crew2」の利用について、一切の責任を負いかねますのでご了承ください。" />
    </div>
  );
};

export default WarningMessage;
