import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

export default defineConfig(async ({ command }) => {
  const dir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.resolve();

  const plugins: Plugin[] = [react(), tailwindcss()];

  // Only attach Express API dev middleware when running local dev server
  if (command === 'serve') {
    try {
      const expressModule = await import('express');
      const express = expressModule.default || expressModule;
      const { apiRouter } = await import('./src/server/api');
      const app = express();
      app.use(apiRouter);

      plugins.push({
        name: 'express-api-plugin',
        configureServer(server) {
          server.middlewares.use('/api', (req, res, next) => {
            (app as any)(req, res, next);
          });
        },
      });
    } catch (e) {
      console.warn('[vite] Express API dev plugin could not be loaded:', e);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(dir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
