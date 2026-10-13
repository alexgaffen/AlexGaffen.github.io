import { NotesShell, notesBody } from '../components/NotesShell.tsx';
import type { PageDef } from './types.ts';

/** Published notes, newest first. */
interface NoteEntry {
  href: string;
  title: string;
  /** Display date, e.g. "08/26/2026". */
  date: string;
}
const NOTES: readonly NoteEntry[] = [];

const listItem = 'border-b border-(--n-line-soft)';

function Body() {
  return (
    <NotesShell>
      <header className="notes-head mb-[10px]">
        <h1 className="sr-only">Notes</h1>
      </header>

      <ul className="m-0 list-none border-t border-(--n-line) p-0">
        {NOTES.length === 0 ? (
          <li className={`${listItem} px-[2px] py-[17px] text-(--n-text-3) italic`}>Nothing published yet -- check back soon.</li>
        ) : (
          NOTES.map((n) => (
            <li key={n.href} className={listItem}>
              <a
                className="group flex items-baseline justify-between gap-5 px-[2px] py-[17px] text-inherit no-underline hover:text-(--n-accent)"
                href={n.href}
              >
                <span className="relative min-w-0 font-medium tracking-[-0.01em] after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-0 after:bg-current after:content-[''] after:transition-[width] after:duration-[280ms] after:ease-out-expo group-hover:after:w-full group-focus-visible:after:w-full motion-reduce:after:transition-none">
                  {n.title}
                </span>
                <span className="flex-none font-n-mono text-[0.78rem] text-(--n-text-3) tabular-nums">{n.date}</span>
              </a>
            </li>
          ))
        )}
      </ul>
    </NotesShell>
  );
}

export const notes: PageDef = {
  file: 'notes',
  title: 'Notes — Alex Gaffen',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: ['inter-latin-wght-normal.woff2', 'space-mono-latin-400-normal.woff2', 'space-mono-latin-700-normal.woff2'],
  bodyClassName: notesBody,
  analytics: true,
  reveal: true,
  head: {
    fullIcons: true,
    description: 'Notes by Alex Gaffen — short written pieces on AI, systems, and security.',
    keywords: 'Alex Gaffen Notes, AI writing, LLM essays, systems, security',
    author: 'Alex Gaffen',
    og: {
      title: 'Notes — Alex Gaffen',
      description: 'Short written pieces on AI, systems, and security.',
      type: 'website',
      url: 'https://alexgaffen.com/notes.html',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    twitter: {
      title: 'Notes — Alex Gaffen',
      description: 'Short written pieces on AI, systems, and security.',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    canonical: 'https://alexgaffen.com/notes.html',
    themeColor: '#0d0d0d',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Notes — Alex Gaffen',
      url: 'https://alexgaffen.com/notes.html',
      author: { '@type': 'Person', name: 'Alex Gaffen', url: 'https://alexgaffen.com/' },
    },
  },
  Body,
};
