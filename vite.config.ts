import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import path from 'path';

function geointApiPlugin(): Plugin {
  return {
    name: 'geoint-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/geoint')) {
          try {
            const url = new URL(req.url, 'http://localhost');
            const mod = await server.ssrLoadModule('./api/geoint.ts');
            const mockReq = {
              method: req.method,
              url: req.url,
              query: Object.fromEntries(url.searchParams.entries()),
              body: {}
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
              end() {
                res.end();
              }
            };
            await mod.default(mockReq, mockRes);
            return;
          } catch (err: any) {
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
  plugins: [react(), cesium(), geointApiPlugin()],
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

