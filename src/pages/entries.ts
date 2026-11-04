/**
 * Client entry for each page, keyed by output file name. Plain strings only so
 * vite.config.ts can read it without pulling React in. See pages/index.ts.
 */
export const pageEntries = {
  index: 'src/entries/index.ts',
  'mock-market': 'src/entries/mock-market.ts',
} as const;

export type PageFile = keyof typeof pageEntries;
