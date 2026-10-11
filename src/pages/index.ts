import { game } from './game.tsx';
import { index } from './index.tsx';
import { noteDefendingLlms } from './note-defending-llms.tsx';
import { notes } from './notes.tsx';
import type { PageDef } from './types.ts';

/** Every page the site builds, keyed by file name. */
export const pages: Record<string, PageDef> = {
  [index.file]: index,
  [game.file]: game,
  [notes.file]: notes,
  [noteDefendingLlms.file]: noteDefendingLlms,
};
