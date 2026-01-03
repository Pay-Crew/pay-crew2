import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
    allowedHosts: ['localhost', 'pay-crew2.yukiosada.work'],
  },
  plugins: [react()],
  build: {
    sourcemap: true,
  },
});
