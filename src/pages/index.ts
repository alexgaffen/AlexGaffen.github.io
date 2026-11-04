import { index } from './index.tsx';
import { mockMarket } from './mock-market.tsx';
import type { PageDef } from './types.ts';

/**
 * Every page the site builds, keyed by file name. The one-page portfolio and its
 * project write-ups are published; the older pages (resume, photography, notes, game, blog) stay in
 * src/pages but are not built, so no URL reaches them.
 */
export const pages: Record<string, PageDef> = {
  [index.file]: index,
  [mockMarket.file]: mockMarket,
};
