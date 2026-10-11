/**
 * Compile a TypeScript module to a minified, self-contained script that can be
 * inlined into a page. Used for the few scripts that must run before first
 * paint (theme, blur-up, the home card fitter): inlined, they cost no request.
 */
import { build, type Rollup } from 'vite';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

export async function buildInline(entry: string, define: Record<string, string> = {}): Promise<string> {
  const out = (await build({
    root,
    configFile: false,
    logLevel: 'silent',
    define,
    build: {
      write: false,
      minify: true,
      target: 'es2020',
      lib: { entry: resolve(root, entry), formats: ['iife'], name: 'inline', fileName: 'inline' },
    },
  })) as Rollup.RollupOutput[];
  const chunk = out[0]!.output.find((o) => o.type === 'chunk');
  if (!chunk || chunk.type !== 'chunk') throw new Error(`${entry} produced no chunk`);
  // A plain IIFE with no exports: drop the wrapper variable so it is just a statement.
  return chunk.code.trim().replace(/^var inline\s*=\s*/, '');
}
