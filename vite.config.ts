import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import path from 'path';

import fs from 'fs';

function spiderApiPlugin(): Plugin {
  return {
    name: 'spider-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const url = new URL(req.url, 'http://localhost');
            const routeName = url.pathname.replace(/^\/api\//, '').split('/')[0];
            const tsPath = path.resolve(__dirname, `api/${routeName}.ts`);

            if (fs.existsSync(tsPath)) {
              let body: any = {};
              if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                const chunks: any[] = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const rawBody = Buffer.concat(chunks).toString('utf-8');
                if (rawBody) {
                  try {
                    body = JSON.parse(rawBody);
                  } catch {
                    body = rawBody;
                  }
                }
              }

              const mod = await server.ssrLoadModule(`./api/${routeName}.ts`);
              const mockReq = {
                method: req.method,
                url: req.url,
                query: Object.fromEntries(url.searchParams.entries()),
                body,
                headers: req.headers,
              };

              const mockRes = {
                statusCode: 200,
                setHeader: (k: string, v: string) => res.setHeader(k, v),
                status(code: number) {
                  this.statusCode = code;
                  res.statusCode = code;
                  return this;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end(content?: any) {
                  if (content) res.end(content);
                  else res.end();
                },
              };

              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
                return;
              }

              await mod.default(mockReq, mockRes);
              return;
            }
          } catch (err: any) {
            console.error('[API Middleware Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), cesium(), spiderApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});

