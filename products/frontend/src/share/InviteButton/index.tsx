import { type Dispatch, type FC, type SetStateAction } from 'react';
// toast
import { toast } from 'react-hot-toast';
// css
import styles from './index.module.css';

type Props = {
  copyStatus: 'idle' | 'copying' | 'success';
  setCopyStatus: Dispatch<SetStateAction<'idle' | 'copying' | 'success'>>;
  inviteUrl: string | null;
  setInviteUrl: Dispatch<SetStateAction<string | null>>;
};

const InviteButton: FC<Props> = (props: Props) => {
  // 招待URLハンドラ
  const inviteUrlHandler = async (url: string) => {
    try {
      props.setCopyStatus('copying');
      await navigator.clipboard.writeText(url);
      props.setCopyStatus('success');
      toast.success('招待URLをコピーしました', { id: 'group-detail-invite-url-copy' });
    } catch {
      toast.error('コピーに失敗しました', { id: 'group-detail-invite-url-copy' });
      props.setCopyStatus('idle');
    }
  };

  return (
    <>
      {props.inviteUrl ? (
        <button
          className={styles.button}
          type="button"
          onClick={() => props.inviteUrl && inviteUrlHandler(props.inviteUrl)}
          disabled={props.copyStatus === 'copying'}
        >
          招待URLをコピーする
        </button>
      ) : null}
    </>
  );
};

export default InviteButton;
