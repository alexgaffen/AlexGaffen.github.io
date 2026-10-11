import { type MouseEvent as ReactMouseEvent, useEffect, useState } from 'react';
import { ARTICLES, FILTERS, METRICS, type FilterTag, PROFILE, type Post, POSTS, ROUTES, SHORTCUTS, type Token } from './data.ts';

/*
 * The blog archive: filterable list, a sidebar, and a full-screen article
 * reader. One island; the document scrolls (this page has no inner panel).
 *
 * Notes on the look: the old stylesheet reset the header with `all: revert`, which
 * stripped most of its own styling -- what is written here is the result that
 * actually rendered, not the rules that were declared.
 */

const pixel = "font-['Press_Start_2P',monospace]";
const pad2 = (n: number) => String(n).padStart(2, '0');

/* ------------------------------ code blocks ------------------------------ */

const TOKEN: Record<NonNullable<Token[0]>, string> = {
  kw: 'text-[#cba6f7]',
  fn: 'text-[#89b4fa]',
  str: 'text-[#a6e3a1]',
  cm: 'text-[#6c7086] italic',
  num: 'text-[#fab387]',
};

function CodeBlock({ lang, tokens, text, reader }: { lang: string; tokens?: readonly Token[]; text?: string; reader?: boolean }) {
  const [copied, setCopied] = useState(false);
  const raw = text ?? tokens!.map((t) => t[1]).join('');

  const copy = (e: ReactMouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`code-block relative overflow-hidden rounded-[14px] bg-(--code-bg) ${reader ? 'm-0 border-none' : 'my-3'}`}>
      <div
        className={`flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] ${reader ? 'bg-[rgba(255,255,255,0.03)] px-[14px] py-2' : 'bg-[rgba(255,255,255,0.05)] px-3 py-[6px]'}`}
      >
        <span className={`${pixel} text-[0.45em] text-[#888] uppercase`}>{lang}</span>
        <button
          className={`cursor-pointer border bg-transparent px-2 py-[3px] ${pixel} text-[0.4em] [transition:all_0.2s] ${copied ? 'border-[#00ff41] text-[#00ff41]' : 'border-[#555] text-[#888] hover:border-white hover:text-white'}`}
          onClick={copy}
        >
          {copied ? 'COPIED!' : 'COPY'}
        </button>
      </div>
      <pre
        className={
          reader
            ? "m-0 overflow-x-auto p-[12px_16px_16px] font-['Space_Mono',monospace] text-[clamp(0.74rem,1.5vw,0.85rem)] leading-[1.55] [word-break:break-word] whitespace-pre-wrap text-(--code-text) [text-shadow:none]"
            : "m-0 overflow-x-auto p-[14px] font-['Space_Mono',monospace] text-[0.85em] leading-[1.5] whitespace-pre text-(--code-text)"
        }
      >
        {tokens
          ? tokens.map(([cls, t], i) => (cls ? <span key={i} className={TOKEN[cls]}>{t}</span> : t))
          : text}
      </pre>
    </div>
  );
}

/* ------------------------------- the reader ------------------------------- */

const panelBlock =
  'rounded-[14px] bg-[rgba(255,255,255,0.3)] p-[clamp(12px,1.4vw,16px)] dark:bg-[rgba(0,255,65,0.05)]';
const blockP = 'm-0 text-[clamp(0.8rem,1.6vw,0.92rem)] leading-[1.6] opacity-[0.84]';

function Reader({ id, onClose }: { id: string; onClose: () => void }) {
  const a = ARTICLES[id]!;
  return (
    <div
      className="fixed inset-0 z-[2600] box-border flex items-center justify-center overscroll-contain bg-[rgba(5,8,18,0.76)] px-[clamp(10px,2.5vw,24px)] pt-[clamp(56px,8vw,78px)] pb-[clamp(12px,2vw,24px)] backdrop-blur-[18px] le-640:items-end le-640:px-2 le-640:pt-[54px] le-640:pb-[10px]"
      id="articleReader"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="box-border flex h-[min(90vh,90svh)] max-h-[90vh] w-[min(980px,100%)] flex-col overflow-hidden rounded-[clamp(14px,2.5vw,26px)] border border-(--border-color) bg-[rgba(252,239,212,0.99)] shadow-[0_28px_100px_rgba(0,0,0,0.3)] [text-shadow:none]! dark:bg-[rgba(11,11,11,0.99)] [&_*]:[text-shadow:none]! le-640:h-[calc(100svh-60px)] le-640:max-h-[calc(100svh-60px)] le-640:w-full le-640:rounded-b-none"
        role="dialog"
        aria-modal="true"
        aria-label="Research log reader"
      >
        <div className="flex flex-none flex-wrap items-start justify-between gap-[14px] border-b border-(--border-color) px-[clamp(18px,2.8vw,28px)] pt-[clamp(18px,2.5vw,26px)] pb-[clamp(10px,1.2vw,14px)] le-640:flex-nowrap le-640:gap-[10px] le-640:px-4 le-640:pt-4 le-640:pb-[10px]">
          <div>
            <span className={`mb-2 block ${pixel} text-[clamp(0.38em,0.75vw,0.48em)] tracking-[0.16em] uppercase opacity-[0.62]`}>{a.kicker}</span>
            <h2 className="m-0 border-none p-0 text-[clamp(1rem,2.4vw,1.25rem)] leading-[1.4]">{a.title}</h2>
            <div className={`mt-2 flex flex-wrap gap-2 ${pixel} text-[clamp(0.36em,0.7vw,0.44em)] tracking-[0.1em] uppercase opacity-[0.68]`}>
              {a.meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <button
            className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-[12px] border border-(--border-color) bg-transparent text-[1.2rem] text-(--text-color)"
            type="button"
            aria-label="Close article"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="grid flex-none grid-cols-[1.2fr_0.8fr] gap-[clamp(10px,1.4vw,16px)] border-b border-(--border-color) px-[clamp(18px,2.8vw,28px)] py-[clamp(12px,1.5vw,16px)] le-640:grid-cols-1 le-640:px-4 le-640:pt-[10px] le-640:pb-3">
          <div className={panelBlock}>
            <p className={blockP}>{a.summary}</p>
          </div>
          <div className={panelBlock}>
            <p className={blockP}>{a.signal}</p>
            <div className="mt-[10px] grid grid-cols-2 gap-2 le-400:grid-cols-1">
              {a.stats.map((s) => (
                <div key={s.label} className="rounded-[12px] border border-(--border-color) bg-[rgba(255,255,255,0.14)] px-[11px] py-[9px]">
                  <span className={`mb-[5px] block ${pixel} text-[clamp(0.34em,0.65vw,0.42em)] tracking-[0.1em] uppercase opacity-[0.56]`}>{s.label}</span>
                  <span className="block text-[clamp(0.78rem,1.5vw,0.86rem)] leading-[1.4]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-auto overflow-x-hidden overflow-y-auto overscroll-contain px-[clamp(18px,2.8vw,28px)] pt-[clamp(16px,2.2vw,24px)] pb-[clamp(24px,3vw,36px)] le-640:px-4 le-640:pt-[14px] le-640:pb-6">
          <article className="flex flex-col gap-[clamp(16px,2.2vw,24px)]">
            {a.sections.map((s) => (
              <section key={s.title} className="p-0">
                <span className={`mb-[6px] block ${pixel} text-[clamp(0.36em,0.7vw,0.44em)] tracking-[0.14em] uppercase opacity-[0.56]`}>{s.kicker}</span>
                <h3 className="m-0 mb-[10px] text-[clamp(0.96rem,2vw,1.08rem)] leading-[1.45]">{s.title}</h3>
                {s.paragraphs.map((p) => (
                  <p key={p} className="m-0 mb-[10px] text-[clamp(0.82rem,1.7vw,0.96rem)] leading-[1.7] opacity-[0.88]">
                    {p}
                  </p>
                ))}
              </section>
            ))}
            <blockquote className="m-0 rounded-[14px] bg-[rgba(95,156,255,0.1)] px-[clamp(16px,2vw,20px)] py-[clamp(14px,1.8vw,18px)] text-[clamp(0.88rem,1.8vw,0.98rem)] leading-[1.65] italic">
              {a.quote}
            </blockquote>
            <CodeBlock lang={a.code.lang} text={a.code.content} reader />
          </article>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- posts --------------------------------- */

function PostItem({ post, hidden, onOpen }: { post: Post; hidden: boolean; onOpen: () => void }) {
  const open = (e: ReactMouseEvent) => {
    e.preventDefault();
    onOpen();
  };
  return (
    <li
      className={[
        'post-item relative cursor-pointer rounded-[20px] border border-(--border-color) p-[clamp(16px,2vw,22px)] [transition:transform_0.25s_ease,box-shadow_0.25s_ease] le-640:p-[14px]',
        'bg-[linear-gradient(150deg,rgba(255,255,255,0.48),rgba(255,255,255,0.14))] shadow-[0_14px_36px_rgba(15,15,15,0.06)] hover:[transform:translateY(-3px)] hover:shadow-[0_20px_48px_rgba(15,15,15,0.12)]',
        'dark:border-l-[#1a3a1a] dark:bg-[linear-gradient(150deg,rgba(0,255,65,0.05),rgba(0,0,0,0.16))] dark:shadow-[0_12px_28px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_18px_40px_rgba(0,0,0,0.32)]',
        // the LOG-0n badge
        `before:content-[attr(data-log)] before:absolute before:top-[clamp(12px,1.8vw,18px)] before:right-[clamp(12px,1.8vw,18px)] before:rounded-full before:border before:border-(--border-color) before:bg-[rgba(252,239,212,0.94)] before:px-2 before:py-[5px] before:font-['Press_Start_2P',monospace] before:text-[clamp(0.38em,0.75vw,0.5em)] before:tracking-[0.12em] before:uppercase dark:before:bg-[rgba(10,10,10,0.92)]`,
        'le-640:before:static le-640:before:mb-[10px] le-640:before:inline-flex',
        hidden ? 'hidden' : '',
      ].join(' ')}
      data-log={post.log}
      data-tags={post.tags.join(',')}
      onClick={onOpen}
    >
      <div className="mb-2 flex flex-wrap items-center gap-[10px] pr-[clamp(64px,10vw,90px)] le-640:gap-2 le-640:pr-0">
        <span className={`mb-2 block ${pixel} text-[0.6em] text-(--text-color) opacity-60`}>{post.date}</span>
        <span className={`${pixel} text-[0.5em] whitespace-nowrap opacity-50`}>{post.readTime}</span>
        <span
          className={`inline-flex items-center gap-[6px] rounded-full border border-(--border-color) px-2 py-1 ${pixel} text-[clamp(0.36em,0.7vw,0.45em)] uppercase opacity-75 before:size-[6px] before:shrink-0 before:rounded-full before:bg-current before:opacity-75 before:content-['']`}
        >
          {post.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {post.tagLabels.map((t) => (
          <span key={t} className={`rounded-full bg-(--tag-bg) px-[7px] py-[3px] ${pixel} text-[0.45em] opacity-70`}>
            {t}
          </span>
        ))}
      </div>
      <h2 className="mt-[6px] mb-[10px] max-w-full p-0 le-640:mt-1 le-640:mb-2">
        <a
          className="font-['Space_Mono',monospace] text-[clamp(0.92em,2vw,1em)] tracking-[normal] text-(--link-color) normal-case no-underline [transition:all_0.2s_ease] hover:text-(--link-hover)"
          href="#"
          onClick={open}
        >
          {post.title}
        </a>
      </h2>
      <p className="m-0 mb-3 max-w-[64ch] text-[clamp(0.82rem,1.6vw,0.95rem)] leading-[1.65] opacity-[0.82]">{post.excerpt}</p>
      <CodeBlock lang={post.code.lang} tokens={post.code.tokens} />
    </li>
  );
}

/* ---------------------------------- page ---------------------------------- */

const panel =
  'rounded-[18px] border border-(--border-color) bg-[linear-gradient(155deg,rgba(255,255,255,0.46),rgba(255,255,255,0.14))] p-[clamp(14px,1.8vw,20px)] shadow-[0_14px_36px_rgba(15,15,15,0.07)] dark:bg-[linear-gradient(155deg,rgba(0,255,65,0.05),rgba(0,0,0,0.18))] dark:shadow-[0_14px_36px_rgba(0,0,0,0.2)]';
const panelTitle = `m-0 mb-3 ${pixel} text-[clamp(0.42em,0.9vw,0.56em)] tracking-[0.14em] uppercase`;

export function Blog() {
  const [filter, setFilter] = useState<FilterTag>('all');
  const [reading, setReading] = useState<string | null>(null);
  // The first ever visit fades the content in; it is remembered afterwards.
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('visited-blog')) {
        setFirstVisit(true);
        localStorage.setItem('visited-blog', '1');
      }
    } catch {
      /* private mode: no fade, no harm */
    }
  }, []);

  // While the reader is open the page behind it must not scroll.
  useEffect(() => {
    const els = [document.documentElement, document.body];
    els.forEach((el) => el.classList.toggle('overflow-hidden!', reading !== null));
    return () => els.forEach((el) => el.classList.remove('overflow-hidden!'));
  }, [reading]);

  useEffect(() => {
    if (reading === null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setReading(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [reading]);

  // Clicking the active tag again clears the filter.
  const onTag = (tag: FilterTag) => setFilter(tag !== 'all' && filter === tag ? 'all' : tag);

  const shown = POSTS.filter((p) => filter === 'all' || p.tags.join(',').includes(filter));
  const hidden = new Set(POSTS.filter((p) => !shown.includes(p)).map((p) => p.id));

  return (
    <>
      {/* The header's styling was reduced to: a centred, padded block (plus a dark-mode wash). */}
      <header className="archive-header mx-auto box-border block w-[min(1340px,100%)] px-[clamp(12px,3vw,32px)] dark:bg-[linear-gradient(180deg,rgba(10,10,10,0.97),rgba(10,10,10,0.91))] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-3 le-640:flex-col le-640:gap-2">
          <div>
            <span className={`mb-[10px] inline-block ${pixel} text-[clamp(0.38em,0.8vw,0.58em)] tracking-[0.16em] uppercase opacity-[0.72]`}>
              Developer Notes
            </span>
            <div className="flex flex-wrap items-center gap-[10px] le-640:gap-2">
              <h1 className={`m-0 ${pixel} text-[clamp(0.85em,2.5vw,1.5em)] tracking-[-1px] uppercase`}>Blog Archive</h1>
              <span
                className={`inline-flex items-center gap-2 rounded-full border border-(--border-color) bg-[rgba(255,255,255,0.34)] px-3 py-[6px] ${pixel} text-[clamp(0.36em,0.7vw,0.48em)] whitespace-nowrap uppercase before:size-2 before:shrink-0 before:rounded-full before:bg-[#00d26a] before:shadow-[0_0_10px_rgba(0,210,106,0.55)] before:content-[''] dark:bg-[rgba(0,255,65,0.08)]`}
              >
                Current Writing
              </span>
            </div>
          </div>
        </div>
        <p className="m-0 text-[clamp(0.82rem,1.8vw,1.03rem)] leading-[1.65] opacity-[0.86]">
          Notes on AI systems, security, software engineering, and the projects shaping how I build. The archive is filterable,
          readable, and meant to stay clean rather than theatrical.
        </p>
        <div className="grid grid-cols-4 gap-[clamp(8px,1.2vw,14px)] le-1100:grid-cols-2 le-640:gap-2 le-400:grid-cols-1">
          {METRICS.map((m, i) => (
            <article
              key={m.label}
              className="relative overflow-hidden rounded-[16px] border border-(--border-color) bg-[linear-gradient(145deg,rgba(255,255,255,0.5),rgba(255,255,255,0.18))] p-[clamp(12px,1.4vw,18px)] le-640:p-3 dark:bg-[linear-gradient(145deg,rgba(0,255,65,0.06),rgba(0,0,0,0.14))]"
            >
              <span className={`mb-[10px] block ${pixel} text-[clamp(0.36em,0.7vw,0.48em)] tracking-[0.12em] uppercase opacity-[0.64]`}>{m.label}</span>
              <span className={`mb-[6px] block ${pixel} text-[clamp(0.7em,1.4vw,1.1em)] leading-[1.4] [word-break:break-word]`} id={i === 0 ? 'archiveTotalCount' : undefined}>
                {i === 0 ? pad2(POSTS.length) : m.value}
              </span>
              <span className="text-[clamp(0.72rem,1.4vw,0.9rem)] leading-[1.5] opacity-[0.7]">{m.note}</span>
            </article>
          ))}
        </div>
      </header>

      <div
        className={`content-area mx-auto box-border w-[min(1340px,100%)] px-[clamp(12px,3vw,32px)] pb-20 opacity-100 ${firstVisit ? 'animate-fade-in' : ''}`}
      >
        <div className="grid grid-cols-[minmax(0,1.72fr)_minmax(0,0.88fr)] items-start gap-[clamp(16px,2.4vw,28px)] le-1100:grid-cols-1 le-640:gap-3">
          <div className="min-w-0">
            <div className="sticky top-[106px] z-90 mb-4 flex flex-wrap gap-2 bg-(--bg-color) py-[10px] le-760:top-24 le-400:gap-[6px]">
              {FILTERS.map((f) => (
                <button
                  key={f.tag}
                  className={`cursor-pointer rounded-full border border-(--border-color) px-[10px] py-1 ${pixel} text-[0.5em] uppercase [transition:all_0.2s] ${
                    filter === f.tag
                      ? 'bg-(--tag-active) text-(--bg-color)'
                      : 'bg-(--tag-bg) text-(--text-color) hover:bg-(--tag-active) hover:text-(--bg-color)'
                  }`}
                  onClick={() => onTag(f.tag)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div
              className={`mb-[0.9rem] flex flex-wrap items-center justify-between gap-[10px] rounded-[14px] border border-(--border-color) bg-[rgba(255,255,255,0.18)] px-[14px] py-[10px] ${pixel} text-[clamp(0.38em,0.75vw,0.5em)] tracking-[0.1em] uppercase dark:bg-[rgba(0,255,65,0.05)] le-640:flex-col le-640:items-start le-640:gap-[6px]`}
            >
              <span>
                Visible Logs: <span id="visiblePostCount">{pad2(shown.length)}</span>
              </span>
              <span className="opacity-70" id="archiveFeedStatus">
                {filter === 'all' ? 'Showing all posts' : `Showing ${filter.toUpperCase()} posts`}
              </span>
            </div>

            <ul className="m-0 grid list-none gap-[clamp(12px,1.8vw,20px)] p-0">
              {POSTS.map((p) => (
                <PostItem key={p.id} post={p} hidden={hidden.has(p.id)} onOpen={() => setReading(p.id)} />
              ))}
            </ul>
          </div>

          <aside className="sticky top-[clamp(6px,1vw,14px)] grid min-w-0 gap-[14px] le-1100:static">
            <section className={panel}>
              <h2 className={panelTitle}>Quick Filters</h2>
              <p className="opacity-[0.82]">Fast ways to scan the archive without opening the full command palette.</p>
              <div className="mt-[10px] flex flex-wrap gap-2">
                {SHORTCUTS.map((s) => (
                  <button
                    key={s.tag}
                    className={`cursor-pointer rounded-full border border-(--border-color) bg-transparent px-[10px] py-[5px] ${pixel} text-[clamp(0.38em,0.8vw,0.46em)] text-(--text-color) uppercase [transition:background_0.18s,color_0.18s] hover:bg-(--text-color) hover:text-(--bg-color)`}
                    type="button"
                    onClick={() => setFilter(s.tag)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={panel}>
              <h2 className={panelTitle}>Research Map</h2>
              <div className="grid gap-[10px]">
                {ROUTES.map((r) => (
                  <div key={r.label} className="grid grid-cols-[72px_1fr] items-center gap-[10px]">
                    <span className={`${pixel} text-[clamp(0.4em,0.8vw,0.52em)] opacity-[0.65]`}>{r.label}</span>
                    <div className="relative h-2 overflow-hidden rounded-full bg-[rgba(0,0,0,0.08)]">
                      <span
                        className="absolute inset-[0_auto_0_0] rounded-[inherit] bg-[linear-gradient(90deg,#29d37c,#5f9cff)]"
                        style={{ width: `${r.width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={panel}>
              <h2 className={panelTitle}>Archive Profile</h2>
              <ul className="m-0 grid list-none gap-[10px] p-0">
                {PROFILE.map(([k, v]) => (
                  <li
                    key={k}
                    className="flex flex-wrap justify-between gap-2 [border-bottom:1px_dashed_var(--border-color)] pb-[10px] text-[clamp(0.74rem,1.5vw,0.88rem)] opacity-[0.82] last:[border-bottom:none] last:pb-0"
                  >
                    <span>{k}</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {reading && <Reader id={reading} onClose={() => setReading(null)} />}
    </>
  );
}
