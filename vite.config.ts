import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { pageEntries } from './src/pages/entries.ts';

/**
 * `vite` (dev) serves every page by running the same prerender the production
 * build uses, so what you see while editing is what ships.
 */
function devPages(): Plugin {
  return {
    name: 'dev-pages',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '/').split('?')[0]!;
        const file = url === '/' ? 'index' : url.replace(/^\//, '').replace(/\.html$/, '');
        if (!(file in pageEntries)) return next();
        try {
          const mod = (await server.ssrLoadModule('/src/entry-server.tsx')) as typeof import('./src/entry-server.tsx');
          const html = await server.transformIndexHtml(url, mod.renderPage(file, { dev: true }));
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (e) {
          server.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devPages()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Hashed bundles live here so they can never collide with the real
    // /assets/ URLs (images, fonts) that links and share previews point at.
    assetsDir: '_app',
    manifest: true,
    target: 'es2022',
    cssTarget: 'safari15',
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pageEntries).map(([name, entry]) => [name, entry]),
      ),
    },
  },
});
