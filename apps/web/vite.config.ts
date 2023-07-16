/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/web',

  server: {
    port: 443,
    strictPort: true,
    host: 'dev.bship.works',
    https: {
      key: fs.readFileSync('./.cert/devcert.key'),
      cert: fs.readFileSync('./.cert/devcert.crt'),
    },
    open: true,
    proxy: {
      '/game': {
        target: 'ws://localhost:3001',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
    svgrPlugin(),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
