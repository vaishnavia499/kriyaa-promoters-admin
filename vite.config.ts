import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import express from 'express';
import { apiRouter } from './src/server/api';

function expressApiPlugin(): Plugin {
  const app = express();
  app.use(apiRouter);

  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        (app as any)(req, res, next);
      });
    },
  };
}

export default defineConfig(() => {
  const dir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.resolve();

  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(dir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
