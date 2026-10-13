import { blog } from './blog.tsx';
import { game } from './game.tsx';
import { index } from './index.tsx';
import { photography } from './photography.tsx';
import { resume } from './resume.tsx';
import { notes } from './notes.tsx';
import type { PageDef } from './types.ts';

/** Every page the site builds, keyed by file name. */
export const pages: Record<string, PageDef> = {
  [index.file]: index,
  [game.file]: game,
  [photography.file]: photography,
  [resume.file]: resume,
  [blog.file]: blog,
  [notes.file]: notes,
};
