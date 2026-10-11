import { renderToStaticMarkup } from 'react-dom/server';
import { DEFER_MARK, DEFER_ONLOAD } from './components/Document.tsx';
import { Document } from './components/Document.tsx';
import { pages } from './pages/index.ts';
import type { PageAssets } from './pages/types.ts';

/** Render one page to a complete HTML string. */
export function renderPage(file: string, assets: PageAssets, dev = false): string {
  const page = pages[file];
  if (!page) throw new Error(`Unknown page: ${file}`);
  const html = renderToStaticMarkup(<Document page={page} assets={assets} dev={dev} />);
  return '<!DOCTYPE html>' + html.replaceAll(` ${DEFER_MARK}=""`, ` ${DEFER_ONLOAD}`);
}

export { setInlineScripts } from './server/inline.ts';

export const pageFiles = Object.keys(pages);

/** Per-page switches the build needs to compose the inline pre-paint script. */
export const pageFlags: Record<string, { reveal: boolean; analytics: boolean }> = Object.fromEntries(
  Object.entries(pages).map(([file, p]) => [file, { reveal: p.reveal, analytics: p.analytics }]),
);
