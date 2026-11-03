import { index } from './index.tsx';
import type { PageDef } from './types.ts';

/**
 * Every page the site builds, keyed by file name. Only the one-page portfolio is
 * published; the older pages (resume, photography, notes, game, blog) stay in
 * src/pages but are not built, so no URL reaches them.
 */
export const pages: Record<string, PageDef> = {
  [index.file]: index,
};
