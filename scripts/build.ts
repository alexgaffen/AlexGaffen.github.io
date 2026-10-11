/**
 * Production build:
 *   1. client bundle  -> dist/        (hashed JS/CSS + manifest)
 *   2. server bundle  -> .ssr/        (the React pages, for prerendering)
 *   3. early scripts  -> inlined      (theme / blur-up / analytics, per page)
 *   4. prerender      -> dist/*.html  (static HTML for every page)
 */
import { build } from 'vite';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildInline } from './inline.ts';
import { pageEntries } from '../src/pages/entries.ts';
import type { PageAssets } from '../src/pages/types.ts';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const ssrDir = join(root, '.ssr');

interface ManifestChunk {
  file: string;
  src?: string;
  isEntry?: boolean;
  imports?: string[];
  css?: string[];
}
type Manifest = Record<string, ManifestChunk>;

/** Everything a page's entry pulls in, resolved to URLs. */
function assetsFor(manifest: Manifest, entryKey: string, early: string): PageAssets {
  const css = new Set<string>();
  const preload = new Set<string>();
  const seen = new Set<string>();
  const walk = (key: string, isEntry: boolean) => {
    if (seen.has(key)) return;
    seen.add(key);
    const c = manifest[key];
    if (!c) throw new Error(`manifest has no ${key}`);
    c.css?.forEach((f) => css.add(`/${f}`));
    if (!isEntry) preload.add(`/${c.file}`);
    c.imports?.forEach((i) => walk(i, false));
  };
  walk(entryKey, true);
  return { css: [...css], js: `/${manifest[entryKey]!.file}`, preload: [...preload], early };
}

async function main() {
  const t0 = performance.now();
  rmSync(ssrDir, { recursive: true, force: true });

  console.log('client bundle');
  await build({ root, logLevel: 'warn' });

  console.log('server bundle');
  await build({
    root,
    logLevel: 'warn',
    build: {
      ssr: join(root, 'src/entry-server.tsx'),
      outDir: ssrDir,
      emptyOutDir: true,
      manifest: false,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
    // `public/` files are served as-is; nothing in the server bundle needs them.
    publicDir: false,
  });

  const manifest = JSON.parse(readFileSync(join(dist, '.vite/manifest.json'), 'utf8')) as Manifest;
  const { renderPage, pageFlags } = (await import(
    pathToFileURL(join(ssrDir, 'entry-server.mjs')).href
  )) as typeof import('../src/entry-server.tsx');
  const { setInlineScripts } = (await import(
    pathToFileURL(join(ssrDir, 'entry-server.mjs')).href
  )) as typeof import('../src/entry-server.tsx');
  setInlineScripts({ fit: await buildInline('src/client/fit.ts') });

  const earlyCache = new Map<string, string>();
  const earlyFor = async (reveal: boolean, analytics: boolean) => {
    const k = `${reveal}:${analytics}`;
    if (!earlyCache.has(k)) earlyCache.set(k, await buildInline('src/client/early.ts', { __REVEAL__: String(reveal), __ANALYTICS__: String(analytics) }));
    return earlyCache.get(k)!;
  };

  for (const [file, entry] of Object.entries(pageEntries)) {
    const f = pageFlags[file]!;
    const assets = assetsFor(manifest, entry, await earlyFor(f.reveal, f.analytics));
    const html = renderPage(file, assets);
    const out = join(dist, `${file}.html`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log(`  ${file}.html  ${(html.length / 1024).toFixed(1)} kB`);
  }

  rmSync(ssrDir, { recursive: true, force: true });
  console.log(`done in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
