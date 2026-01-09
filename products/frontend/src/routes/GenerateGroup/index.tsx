import { useState, type FC } from 'react';
// @tanstack/react-query
// import { useQueryClient } from '@tanstack/react-query';
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

const GenerateGroup: FC = () => {
  // const queryClient = useQueryClient();
  const [isResultError, setIsResultError] = useState<boolean>(false);
  const [result, setResult] = useState<CreateGroupResponseSchemaType | null>(null);
  const { mutate, isSuccess, isPending, isError, error } = $api.useMutation('post', '/api/group/create', {
    onSuccess: (data) => {
      if (!data?.group_id || !data?.invite_id) {
        setIsResultError(true);
      } else {
        setResult({
          group_id: data?.group_id,
          invite_id: data?.invite_id,
        });
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupRequestSchemaType>({
    resolver: zodResolver(createGroupRequestSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit: SubmitHandler<CreateGroupRequestSchemaType> = async (formData) => {
    mutate({ body: formData, credentials: 'include' });
  };

  return (
    <>
      <h1>グループの作成</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">グループ名:</label>
          <input id="name" type="text" {...register('name')} />
          <ErrorMessage errors={errors} name="name" />
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
                ? 'グループの作成しました'
                : ''}
        </p>
      </form>
      {isSuccess && !isResultError && result ? (
        <div>
          <h2>グループ作成結果</h2>
          <p>グループID: {result.group_id}</p>
          <p>招待ID: {result.invite_id}</p>
        </div>
      ) : isResultError ? (
        <div>
          <h2>グループ作成結果</h2>
          <p>グループの作成に失敗しました。再度お試しください。</p>
        </div>
      ) : null}
    </>
  );
};

export default GenerateGroup;
