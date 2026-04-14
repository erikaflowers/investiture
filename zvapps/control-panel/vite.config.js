import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeVectorPlugin } from './server/writeVector.js';
import { doctrineApiPlugin } from './server/doctrineApi.js';
import { homeApiPlugin } from './server/homeApi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), writeVectorPlugin(), doctrineApiPlugin(), homeApiPlugin()],
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
      port: 3003,
      open: false,
      fs: {
        allow: [
          resolve(__dirname, '../..'),
        ],
      },
      hmr: {
        host: 'localhost',
        port: 3003,
      },
      proxy: {
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
          },
        },
      },
    },
    test: {
      root: '.',
      include: ['core/**/*.test.{js,jsx}', 'src/**/*.test.{js,jsx}'],
    }
  };
});
