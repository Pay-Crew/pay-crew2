import { useEffect, type FC } from 'react';
// @tanstack/react-query
import { $api } from '../../api/fetchClient';
import { updateUserProfileRequestSchema, type UpdateUserProfileRequestSchemaType } from 'validator';
// react-hook-form
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

const Profile: FC = () => {
  // ユーサープロフィール情報の取得
  const userProfileQuery = $api.useQuery('get', '/api/profile', {
    credentials: 'include',
  });

  // ユーザープロフィール情報の更新
  const userProfileMutation = $api.useMutation('patch', `/api/profile`);

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
      <h1>プロフィールの編集</h1>
      {userProfileQuery.isLoading && <p>Loading...</p>}
      {userProfileQuery.isError && <p>Error: {userProfileQuery.error.message}</p>}
      {userProfileQuery.isSuccess && (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="display_name">表示名:</label>
              <input
                id="display_name"
                type="text"
                {...register('display_name', {
                  setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
                })}
              />
              <ErrorMessage errors={errors} name="display_name" />
            </div>

            <div>
              <label htmlFor="avatar_url">アバターURL:</label>
              <input
                id="avatar_url"
                type="text"
                {...register('avatar_url', {
                  setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
                })}
              />
              <ErrorMessage errors={errors} name="avatar_url" />
            </div>

            <div>
              <label htmlFor="bio">自己紹介:</label>
              <textarea
                id="bio"
                {...register('bio', {
                  setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
                })}
              />
              <ErrorMessage errors={errors} name="bio" />
            </div>

            <button type="submit" disabled={userProfileMutation.isPending}>
              プロフィールを更新
            </button>

            <p>
              {userProfileMutation.isPending
                ? 'プロフィールを更新中...'
                : userProfileMutation.isError
                  ? `プロフィールの更新に失敗しました: ${userProfileMutation.error.message}`
                  : userProfileMutation.isSuccess
                    ? 'プロフィールの更新に成功しました！'
                    : null}
            </p>
          </form>
        </>
      )}
    </>
  );
};

export default Profile;
