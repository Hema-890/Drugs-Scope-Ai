import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import openfdaHandler from './api/openfda';
import pubmedHandler from './api/pubmed';
import healthHandler from './api/health';
import rxnormHandler from './api/rxnorm';
import openalexHandler from './api/openalex';
import speechHandler from './api/speech';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for serverless API handlers in local development
  Object.assign(process.env, env);

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'api-routes-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith('/api/')) return next();

            const urlPath = req.url.split('?')[0];
            if (urlPath === '/api/health') {
              return healthHandler(req, res);
            }
            if (urlPath === '/api/openfda') {
              return openfdaHandler(req, res);
            }
            if (urlPath === '/api/pubmed') {
              return pubmedHandler(req, res);
            }
            if (urlPath === '/api/rxnorm') {
              return rxnormHandler(req, res);
            }
            if (urlPath === '/api/openalex') {
              return openalexHandler(req, res);
            }
            if (urlPath === '/api/speech') {
              return speechHandler(req, res);
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      host: true
    }
  };
});
