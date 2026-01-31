import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/react-demo/',
  build: {
    outDir: '../docs/react-demo',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
});
