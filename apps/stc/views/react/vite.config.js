import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Root of the Investiture project
const rootDir = path.resolve(__dirname, '../../../..');

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  envDir: rootDir, // Load .env from project root, not from Vite root
  base: '/stc-react/', // React version at /stc-react/, vanilla stays at /stc/
  build: {
    outDir: path.resolve(rootDir, 'docs/stc-react'),
    emptyDirOnly: true,
  },
  server: {
    port: 3000,
    // Proxy API calls to Netlify dev server
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // Investiture-level (shared across apps)
      '@investiture/components': path.resolve(rootDir, 'views/react/components'),
      '@investiture/hooks': path.resolve(rootDir, 'views/react/hooks'),
      '@investiture/utils': path.resolve(rootDir, 'views/react/utils'),
      '@core': path.resolve(rootDir, 'core'),
      '@design': path.resolve(rootDir, 'design-system'),
      '@content': path.resolve(rootDir, 'content'),
      // App-level (STC-specific)
      '@stc': path.resolve(__dirname),
      '@stc/components': path.resolve(__dirname, 'components'),
      '@stc/pages': path.resolve(__dirname, 'pages'),
    },
  },
});
