import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  server: {
    port: 443,
    strictPort: true,
    host: 'dev.bship.works',
    https: {
      key: fs.readFileSync('../../.cert/devcert.key'),
      cert: fs.readFileSync('../../.cert/devcert.crt'),
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
  build: {
    outDir: './dist',
  },
});
