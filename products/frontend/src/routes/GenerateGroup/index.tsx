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
// components
import { Button, Title } from '../../share';
// css
import styles from './index.module.css';

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
      <Title title="グループ作成" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="group_name">グループ名:</label>
          <input id="group_name" type="text" {...register('group_name')} />
          <ErrorMessage errors={errors} name="group_name" />
        </div>
        <Button type="submit" content="グループを作成" onClick={handleSubmit(onSubmit)} disabled={isPending} />
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
      {isError && <p>グループの作成に失敗しました。再度お試しください。</p>}
      {isSuccess && result && (
        <>
          {inviteUrl && (
            <div>
              <input value={inviteUrl} readOnly />
              <Button
                type="button"
                content={copyStatus === 'copying' ? 'コピー中...' : copyStatus === 'success' ? 'コピー済み' : 'コピー'}
                onClick={() => inviteUrlHandler(inviteUrl)}
                disabled={copyStatus === 'copying'}
              />
              {copyStatus === 'success' && <p>コピーしました</p>}
              {copyStatus === 'error' && <p>コピーに失敗しました</p>}
            </div>
          )}
          <Link className={styles.groupLink} to={`/group/${result.group_id}`}>
            グループページへ移動
          </Link>
        </>
      )}
    </>
  );
};

export default GenerateGroup;
