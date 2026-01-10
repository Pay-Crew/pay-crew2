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

const GenerateGroup: FC = () => {
  // グループ作成処理
  const [result, setResult] = useState<CreateGroupResponseSchemaType | null>(null);
  const { mutate, isSuccess, isPending, isError, error } = $api.useMutation('post', '/api/group/create', {
    onSuccess: (data) => {
      setResult({
        group_id: data?.group_id,
        invite_id: data?.invite_id,
      });
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
                ? 'グループの作成しました'
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
          <p>グループID: {result.group_id}</p>
          <p>招待ID: {result.invite_id}</p>
        </>
      )}
    </>
  );
};

export default GenerateGroup;
