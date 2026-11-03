/**
 * Client entry for each page, keyed by output file name. Plain strings only so
 * vite.config.ts can read it without pulling React in. Only the portfolio is
 * built; see pages/index.ts.
 */
export const pageEntries = {
  index: 'src/entries/index.ts',
} as const;

export type PageFile = keyof typeof pageEntries;
