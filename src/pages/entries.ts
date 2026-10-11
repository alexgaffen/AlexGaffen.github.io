/**
 * Client entry for each page, keyed by output file name. Plain strings only so
 * vite.config.ts can read it without pulling React in.
 */
export const pageEntries = {
  index: 'src/entries/index.ts',
  game: 'src/entries/game.ts',
  photography: 'src/entries/photography.ts',
  resume: 'src/entries/resume.ts',
  blog: 'src/entries/blog.ts',
  notes: 'src/entries/notes.ts',
} as const;

export type PageFile = keyof typeof pageEntries;
