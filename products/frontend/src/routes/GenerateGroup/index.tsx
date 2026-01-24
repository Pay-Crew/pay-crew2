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
// toast
import toast from 'react-hot-toast';
// components
import { FormButton, InviteButton, Title } from '../../share';
// css
import styles from './index.module.css';
import { Link } from 'react-router';

const GenerateGroup: FC = () => {
  // コピー状態管理
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>('idle');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  // グループ作成処理 + トースト通知
  const [result, setResult] = useState<CreateGroupResponseSchemaType | null>(null);
  const { mutate, isSuccess, isPending } = $api.useMutation('post', '/api/group/create', {
    onSuccess: (data) => {
      setResult({
        group_id: data?.group_id,
        invite_id: data?.invite_id,
      });
      setInviteUrl(`${import.meta.env.VITE_CLIENT_URL}/invite/${data?.invite_id}`);
      setCopyStatus('idle');
      toast.success('グループの作成に成功しました', { id: 'generate-group-create-group' });
    },
    onError: () => {
      setResult(null);
      setInviteUrl(null);
      setCopyStatus('idle');
      toast.error('グループの作成に失敗しました', { id: 'generate-group-create-group' });
    },
    onMutate: () => {
      setResult(null);
      setInviteUrl(null);
      setCopyStatus('idle');
      toast.loading('グループの作成中...', { id: 'generate-group-create-group' });
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

  return (
    <>
      <Title title="グループ作成" />
      {!isSuccess && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputWrapper}>
            <label className={styles.label} htmlFor="group_name">
              グループ名
            </label>
            <input className={styles.input} id="group_name" type="text" {...register('group_name')} />
            <ErrorMessage
              errors={errors}
              name="group_name"
              render={({ message }) => <div className={styles.error}>{message}</div>}
            />
          </div>
          <FormButton content="作成" onClick={handleSubmit(onSubmit)} disabled={isPending} />
        </form>
      )}
      {isSuccess && result && (
        <>
          <InviteButton copyStatus={copyStatus} setCopyStatus={setCopyStatus} inviteUrl={inviteUrl} />
          <Link className={styles.groupLink} to={`/group/${result.group_id}`}>
            グループページへ移動
          </Link>
        </>
      )}
    </>
  );
};

export default GenerateGroup;
