import type { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import {
  GenerateGroup,
  GroupDetail,
  Invite,
  Login,
  NotFound,
  Privacy,
  Profile,
  Root,
  SessionCheck,
  Share,
  Terms,
} from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 以下を追加することで、ページを追加できる
// <Route path="ページのパス" element={<ページのコンポーネント名 />} />

// キャッシュの有効範囲は、アプリ全体とする
// <QueryClientProvider client={queryClient}><QueryClientProvider>
// で囲むことで、アプリ全体でキャッシュを共有できる

const App: FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Share />}>
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route element={<SessionCheck />}>
              <Route path="/" element={<Root />} />
              <Route path="/gen-group" element={<GenerateGroup />} />
              <Route path="/group/:groupId" element={<GroupDetail />} />
              <Route path="/invite/:inviteId" element={<Invite />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
