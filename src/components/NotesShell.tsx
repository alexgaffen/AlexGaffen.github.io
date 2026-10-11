import type { ReactNode } from 'react';
import { innerScroll } from './classes.ts';
import { SkipLink, TabBar } from './TabBar.tsx';

/** Body classes for a notes page: a plain reading surface in Inter. */
export const notesBody = [
  'has-site-tabs notes-page has-inner-scroll',
  'm-0 h-dvh overflow-hidden bg-(--n-bg) p-0 font-inter text-[17px] leading-[1.7] text-(--n-text) antialiased',
  'selection:bg-(--n-accent) selection:text-(--n-bg)',
  // notes.css reset every box (and pseudo-box) to border-box
  '[&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border',
  'print:bg-white print:text-black',
].join(' ');

/** Chrome shared by the notes index and each note. */
export function NotesShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <TabBar active="notes.html" />
      <div className={`notes-wrap w-full ${innerScroll}`}>
        <main
          className="notes-inner mx-auto max-w-[760px] px-[clamp(20px,5vw,32px)] pt-[clamp(38px,6vw,76px)] pb-[clamp(64px,9vw,120px)] print:max-w-none print:p-0"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </>
  );
}
