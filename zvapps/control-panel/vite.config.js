import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { doctrineApiPlugin } from './server/doctrineApi.js';
import { homeApiPlugin } from './server/homeApi.js';
import { zvApiPlugin } from './server/zvApi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), doctrineApiPlugin(), homeApiPlugin(), zvApiPlugin()],
    root: 'src',
    css: {
      devSourcemap: true,
    },
    resolve: {
      alias: {
        'zv-ui': resolve(__dirname, '../zv-ui/src'),
      },
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
    server: {
      port: 3067,
      open: false,
      fs: {
        allow: [
          resolve(__dirname, '../..'),
        ],
      },
      hmr: {
        host: 'localhost',
        port: 3067,
      },
    },
    test: {
      root: '.',
      include: ['core/**/*.test.{js,jsx}', 'src/**/*.test.{js,jsx}', 'server/**/*.test.{js,jsx}'],
    }
  };
});
