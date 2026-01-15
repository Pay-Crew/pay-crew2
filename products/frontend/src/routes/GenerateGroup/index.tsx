import { useEffect, useRef, useState, type FC } from 'react';
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
// toast
import toast from 'react-hot-toast';
// components
import { Button, FormButton, Title } from '../../share';
// css
import styles from './index.module.css';

const GenerateGroup: FC = () => {
  // コピー状態管理
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>('idle');
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

  // トースト表示
  const createGroupStatusRef = useRef<'idle' | 'pending' | 'error' | 'success'>('idle');
  useEffect(() => {
    const status: 'idle' | 'pending' | 'error' | 'success' = isPending
      ? 'pending'
      : isError
        ? 'error'
        : isSuccess
          ? 'success'
          : 'idle';

    if (createGroupStatusRef.current === status) return;
    createGroupStatusRef.current = status;

    if (status === 'pending') {
      toast.loading('グループの作成中...', { id: 'create-group' });
    }

    if (status === 'error') {
      toast.error('グループの作成に失敗しました', { id: 'create-group' });
    }

    if (status === 'success') {
      toast.success('グループの作成に成功しました', { id: 'create-group' });
    }
  }, [isPending, isError, isSuccess, error]);

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
      toast.success('招待URLをコピーしました');
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <>
      <Title title="グループ作成" />
      {!isSuccess && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="group_name">グループ名:</label>
            <input id="group_name" type="text" {...register('group_name')} />
            <ErrorMessage errors={errors} name="group_name" />
          </div>
          <FormButton content="作成" onClick={handleSubmit(onSubmit)} disabled={isPending} />
        </form>
      )}
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
