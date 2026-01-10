import { useState, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
// react-hook-form
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
// validator
import {
  type CreateGroupRequestSchemaType,
  type CreateGroupResponseSchemaType,
  createGroupRequestSchema,
} from 'validator';
// react-router
import { Link } from 'react-router';

const GenerateGroup: FC = () => {
  // コピー状態管理
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  // グループ作成処理
  const [result, setResult] = useState<CreateGroupResponseSchemaType | null>(null);
  const { mutate, isSuccess, isPending, isError, error } = $api.useMutation('post', '/api/group/create', {
    onSuccess: (data) => {
      setResult({
        group_id: data?.group_id,
        invite_id: data?.invite_id,
      });
      setInviteUrl(`${import.meta.env.VITE_CLIENT_URL}/invite/${data?.invite_id}`);
      setCopyStatus('idle');
    },
  });

  // react-hook-formの設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupRequestSchemaType>({
    resolver: zodResolver(createGroupRequestSchema),
    defaultValues: {
      group_name: '',
    },
  });

  // グループ作成ハンドラ
  const onSubmit: SubmitHandler<CreateGroupRequestSchemaType> = async (formData) => {
    mutate({ body: formData, credentials: 'include' });
  };

  // 招待URLハンドラ
  const inviteUrlHandler = async (url: string) => {
    try {
      setCopyStatus('copying');
      await navigator.clipboard.writeText(url);
      setCopyStatus('success');
    } catch (e) {
      console.error(e);
      setCopyStatus('error');
    }
  };

  return (
    <>
      <h1>グループの作成</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="group_name">グループ名:</label>
          <input id="group_name" type="text" {...register('group_name')} />
          <ErrorMessage errors={errors} name="group_name" />
        </div>

        <button type="submit" disabled={isPending}>
          グループを作成
        </button>
        <p>
          {isPending
            ? 'グループの作成中...'
            : isError
              ? `グループの作成に失敗しました: ${error.message}`
              : isSuccess
                ? 'グループの作成に成功しました'
                : null}
        </p>
      </form>
      {isPending && <p>グループの作成中...</p>}
      {isError && (
        <>
          <h2>グループ作成結果</h2>
          <p>グループの作成に失敗しました。再度お試しください。</p>
        </>
      )}
      {isSuccess && result && (
        <>
          <h2>グループ作成結果</h2>

          {inviteUrl && (
            <div>
              <input value={inviteUrl} readOnly />
              <button type="button" disabled={copyStatus === 'copying'} onClick={() => inviteUrlHandler(inviteUrl)}>
                {copyStatus === 'copying' ? 'コピー中...' : copyStatus === 'success' ? 'コピー済み' : 'コピー'}
              </button>
              {copyStatus === 'success' && <p>コピーしました</p>}
              {copyStatus === 'error' && <p>コピーに失敗しました</p>}
            </div>
          )}
          <Link to={`/group/${result.group_id}`}>グループページへ移動</Link>
        </>
      )}
    </>
  );
};

export default GenerateGroup;
