import type { FC } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { NotFound, Root, Receipt } from './routes';
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
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
