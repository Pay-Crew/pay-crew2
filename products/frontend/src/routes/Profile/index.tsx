import { useEffect, useState, type FC } from 'react';
// @tanstack/react-query
// import { useQueryClient } from '@tanstack/react-query';
import { $api } from '../../api/fetchClient';
import {
  updateUserProfileRequestSchema,
  type UpdateUserProfileRequestSchemaType,
  type UpdateUserProfileResponseSchemaType,
} from 'validator';
// react-hook-form
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';

const Profile: FC = () => {
  const userProfileQuery = $api.useQuery('get', '/api/profile', {
    credentials: 'include',
  });

  const [isUserProfileResultError, setIsUserProfileResultError] = useState<boolean>(false);
  const [userProfileResult, setUserProfileResult] = useState<UpdateUserProfileResponseSchemaType | null>(null);
  const userProfileMutation = $api.useMutation('put', `/api/profile`, {
    onSuccess: (data) => {
      if (!data) {
        setIsUserProfileResultError(true);
      } else {
        // convert dat to UpdateUserProfileResponseSchemaType
        const userProfile: UpdateUserProfileResponseSchemaType = {
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
        };
        // set group info result
        setUserProfileResult(userProfile);
      }
    },
  });

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

  useEffect(() => {
    if (userProfileQuery.data) {
      reset({
        display_name: userProfileQuery.data.display_name ?? undefined,
        avatar_url: userProfileQuery.data.avatar_url ?? undefined,
        bio: userProfileQuery.data.bio ?? undefined,
      });
    }
  }, [userProfileQuery.data, reset]);

  const onSubmit: SubmitHandler<UpdateUserProfileRequestSchemaType> = (formData) => {
    userProfileMutation.mutate({ body: { ...formData }, credentials: 'include' });
  };

  return (
    <>
      <h1>プロフィールの編集</h1>
      {userProfileQuery.isLoading ? (
        <p>Loading...</p>
      ) : userProfileQuery.isError ? (
        <p>Error: {userProfileQuery.error.message}</p>
      ) : (
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
                  : userProfileMutation.isSuccess && !isUserProfileResultError && userProfileResult
                    ? 'プロフィールの更新に成功しました！'
                    : null}
            </p>
          </form>
          {userProfileMutation.isSuccess && !isUserProfileResultError && userProfileResult ? (
            <div>
              <h2>更新後のプロフィール情報</h2>
              <p>表示名: {userProfileResult.display_name}</p>
              <p>アバターURL: {userProfileResult.avatar_url}</p>
              <p>自己紹介: {userProfileResult.bio}</p>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default Profile;
