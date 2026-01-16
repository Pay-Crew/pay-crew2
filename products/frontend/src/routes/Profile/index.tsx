import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
import { updateUserProfileRequestSchema, type UpdateUserProfileRequestSchemaType } from 'validator';
// react-hook-form
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { FormButton, Loading, Error, Title } from '../../share';
// toast
import { toast } from 'react-hot-toast';
// css
import styles from './index.module.css';

const Profile: FC = () => {
  // ユーサープロフィール情報の取得
  const userProfileQuery = $api.useQuery('get', '/api/profile', {
    credentials: 'include',
    onError: () => {
      toast.error('情報の取得に失敗しました', { id: 'profile-user-info' });
    },
  });

  // ユーザープロフィール情報の更新
  const userProfileMutation = $api.useMutation('patch', `/api/profile`, {
    onSuccess: () => {
      userProfileQuery.refetch();
      toast.success('更新に成功しました', { id: 'profile-update-user-info' });
    },
    onError: () => {
      toast.error('更新に失敗しました', { id: 'profile-update-user-info' });
    },
    onMutate: () => {
      toast.loading('更新中...', { id: 'profile-update-user-info' });
    },
  });

  // react-hook-formの設定
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserProfileRequestSchemaType>({
    resolver: zodResolver(updateUserProfileRequestSchema),
    defaultValues: {
      display_name: undefined,
      avatar_url: undefined,
      bio: undefined,
    } satisfies UpdateUserProfileRequestSchemaType,
  });

  // ユーザープロフィール情報が取得できたらフォームに現在のユーザープロフィール情報をセット
  useEffect(() => {
    if (userProfileQuery.data) {
      reset({
        display_name: userProfileQuery.data.display_name ?? undefined,
        avatar_url: userProfileQuery.data.avatar_url ?? undefined,
        bio: userProfileQuery.data.bio ?? undefined,
      });
    }
  }, [userProfileQuery.data, reset]);

  // プロフィール更新ハンドラ
  const onSubmit: SubmitHandler<UpdateUserProfileRequestSchemaType> = (formData) => {
    userProfileMutation.mutate({ body: { ...formData }, credentials: 'include' });
  };

  return (
    <>
      <Title title="プロフィールの編集" />
      {userProfileQuery.isLoading && <Loading content="データの取得中..." />}
      {userProfileQuery.isError && <Error content="データの取得に失敗しました。" />}
      {userProfileQuery.isSuccess && (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputWrapper}>
              <label className={styles.label} htmlFor="display_name">
                表示名
              </label>
              <input
                className={styles.input}
                id="display_name"
                type="text"
                {...register('display_name', {
                  setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
                })}
              />
              <ErrorMessage
                errors={errors}
                name="display_name"
                render={({ message }) => <div className={styles.error}>{message}</div>}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label} htmlFor="avatar_url">
                アバターURL
              </label>
              <input
                className={styles.input}
                id="avatar_url"
                type="text"
                {...register('avatar_url', {
                  setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
                })}
              />
              <ErrorMessage
                errors={errors}
                name="avatar_url"
                render={({ message }) => <div className={styles.error}>{message}</div>}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label} htmlFor="bio">
                自己紹介
              </label>
              <textarea
                className={styles.textarea}
                id="bio"
                {...register('bio', {
                  setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
                })}
              />
              <ErrorMessage
                errors={errors}
                name="bio"
                render={({ message }) => <div className={styles.error}>{message}</div>}
              />
            </div>

            <FormButton content="更新" onClick={handleSubmit(onSubmit)} disabled={userProfileMutation.isPending} />
          </form>
        </>
      )}
    </>
  );
};

export default Profile;
