/**
 * The tab bar. Rendered into every page's static HTML; the only script it
 * needs (theme toggle, prerender hints, terminal launcher) lives in
 * client/shell.ts and runs after first paint.
 */
export type TabHref = 'index.html' | 'resume.html' | 'photography.html' | 'notes.html' | 'blog.html';

interface Tab {
  href: TabHref;
  label: string;
  mobileLabel: string;
}

const TABS: readonly Tab[] = [
  { href: 'index.html', label: 'HOME', mobileLabel: '🏠' },
  { href: 'resume.html', label: 'RESUME', mobileLabel: '📄' },
  { href: 'photography.html', label: 'PHOTOS', mobileLabel: '📷' },
  { href: 'notes.html', label: 'NOTES', mobileLabel: '✏️' },
];
const BLOG_TAB: Tab = { href: 'blog.html', label: 'BLOG', mobileLabel: '✏️' };

/* ------------------------------ tab styles ------------------------------ */

const tabBase = [
  'site-tab relative box-border inline-flex min-h-[34px] flex-none items-center justify-center',
  'rounded-[9px] border px-[0.95rem]',
  'text-center font-inter text-[clamp(0.72rem,0.95vw,0.82rem)] leading-none font-semibold',
  'tracking-[0.02em] whitespace-nowrap uppercase no-underline',
  'transition-[color,background-color] duration-[180ms] ease-[ease]',
  // phone: tighter, smaller, no transitions
  'le-760:min-h-[32px] le-760:px-[0.55rem] le-760:text-[clamp(0.4rem,2.4vw,0.56rem)] le-760:transition-none',
  'le-350:px-[0.4rem] le-350:text-[clamp(0.36rem,2.6vw,0.5rem)]',
  'motion-reduce:transition-none',
  // the indicator: a short accent rule that grows out from the centre
  "after:pointer-events-none after:absolute after:bottom-[5px] after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-[2px] after:bg-(--site-tab-accent) after:opacity-0 after:content-['']",
  'after:[transition:width_0.24s_cubic-bezier(0.22,1,0.36,1),opacity_0.24s_ease] motion-reduce:after:transition-none',
  // keyboard focus
  'focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-tab-accent)',
].join(' ');

const tabIdle = [
  'border-(--site-tab-border) bg-(--site-tab-bg) text-(--site-tab-fg)',
  'hover:bg-(--site-tab-hover-bg) hover:text-(--site-tab-fg-hover) hover:after:w-[calc(100%-1.9rem)] hover:after:opacity-90',
  'focus-visible:bg-(--site-tab-hover-bg) focus-visible:text-(--site-tab-fg-hover) focus-visible:after:w-[calc(100%-1.9rem)] focus-visible:after:opacity-90',
  'light:hover:after:bg-white light:hover:after:shadow-[0_0_10px_rgba(255,255,255,0.55)]',
  'light:focus-visible:after:bg-white light:focus-visible:after:shadow-[0_0_10px_rgba(255,255,255,0.55)]',
].join(' ');

// Same weight as the others: it used to go bold, which made the active tab
// ~0.2px wider and shifted every tab after it on each switch.
const tabActive = [
  'is-active pointer-events-none border-(--site-tab-active-border) bg-(--site-tab-active-bg) text-(--site-tab-active-fg)',
  'after:w-[calc(100%-1.9rem)] after:opacity-100 after:shadow-[0_0_10px_rgba(125,211,252,0.65)]',
  'light:after:bg-white light:after:shadow-[0_0_10px_rgba(255,255,255,0.55)]',
].join(' ');

/* --------------------------- theme switch styles --------------------------- */

const switchBtn =
  'theme-switch group m-0 mx-[2px] inline-flex flex-none cursor-pointer appearance-none items-center justify-center border-none bg-transparent p-0 text-[16px] leading-[0] focus-visible:outline-none';

const switchTrack = [
  'relative box-border inline-flex h-(--nav-control-size) w-(--nav-control-size) items-center justify-center overflow-hidden rounded-full',
  'border-[1.5px] border-[rgba(192,132,252,0.7)] bg-[radial-gradient(circle_at_50%_38%,#2b2566_0%,#1b1840_100%)]',
  'shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_4px_14px_-8px_rgba(76,29,149,0.9)]',
  'transition-[background,border-color,box-shadow,transform] duration-[350ms,350ms,350ms,200ms] ease-[ease]',
  'group-hover:-translate-y-px group-hover:border-[rgba(216,180,254,0.95)]',
  'group-focus-visible:border-[#a78bfa] group-focus-visible:shadow-[0_0_0_3px_rgba(167,139,250,0.35)]',
  'light:border-[rgba(217,119,6,0.85)] light:bg-[radial-gradient(circle_at_50%_38%,#fff5d6_0%,#fde0a3_100%)]',
  'light:shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_14px_-8px_rgba(217,119,6,0.8)]',
].join(' ');

// One icon crossfades between moon (dark) and sun (light); inline SVG so it is
// there in the first frame. Keyed on the html class, which the early script
// sets before the button is parsed, so a light page never paints the dark
// button first and animates it over.
const iconBase =
  'absolute top-1/2 left-1/2 box-border inline-flex h-[0.95rem] w-[0.95rem] items-center justify-center fill-current stroke-current [filter:drop-shadow(0_0_3px_currentColor)] [transition:opacity_0.3s_ease,transform_0.45s_cubic-bezier(0.34,1.56,0.64,1)]';
const moon = `${iconBase} text-[#c4b5fd] opacity-100 [transform:translate(-50%,-50%)_rotate(0deg)_scale(1)] light:opacity-0 light:[transform:translate(-50%,-50%)_rotate(-90deg)_scale(0.4)]`;
const sun = `${iconBase} text-[#fbbf24] opacity-0 [transform:translate(-50%,-50%)_rotate(90deg)_scale(0.4)] light:text-[#d97706] light:opacity-100 light:[transform:translate(-50%,-50%)_rotate(0deg)_scale(1)]`;

/* ------------------------------ launcher (>_) ------------------------------ */

const fab = [
  'in-nav box-border flex-none h-(--nav-control-size) w-(--nav-control-size) cursor-pointer rounded-full text-[0.92rem] leading-none font-bold font-term tracking-normal normal-case',
  'border border-[rgba(168,85,247,0.65)] bg-[rgba(12,12,20,0.92)] text-[#34d399]',
  'shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_4px_14px_-8px_rgba(76,29,149,0.9)]',
  'transition-[transform,box-shadow,opacity] duration-200 ease-[ease]',
  'hover:-translate-y-px hover:scale-[1.06] hover:shadow-[0_6px_18px_-6px_rgba(168,85,247,0.8)]',
  // light: warm orange framing and a beige face
  'light:border-[rgba(249,115,22,0.65)] light:bg-[rgba(252,239,212,0.95)] light:text-[#047857]',
  'light:shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_4px_14px_-8px_rgba(154,52,18,0.5)]',
  'light:hover:shadow-[0_6px_18px_-6px_rgba(249,115,22,0.6)]',
  // hidden while the terminal is open (set by the console)
  'data-[open]:pointer-events-none data-[open]:opacity-0',
].join(' ');

/* --------------------------------- the bar --------------------------------- */

const bar = [
  'site-tabs fixed top-(--site-tabs-top) left-0 z-[1400] box-border flex min-h-(--site-tabs-shell-height) w-full items-center justify-between',
  'border-b border-(--site-tabs-shell-border) bg-(--site-tabs-shell-bg) px-(--site-tabs-pad-x) font-mono-site',
  // Enough drop to sell the bar as a layer above the page, not part of it.
  'shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)] backdrop-blur-[16px] backdrop-saturate-150',
  // Hairline of colour along the very top edge.
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:content-['']",
  'before:bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.5),rgba(167,139,250,0.4),transparent)]',
  'light:before:bg-[linear-gradient(90deg,transparent,rgba(255,214,107,0.55),rgba(251,146,60,0.45),transparent)]',
  'le-760:gap-1 le-760:px-[10px] le-350:px-1',
].join(' ');

const controls =
  'site-tabs-controls box-border flex flex-none items-center gap-[10px] [--nav-control-size:38px] [&_*]:box-border le-760:gap-[6px] le-760:[--nav-control-size:34px] le-350:gap-1 le-350:[--nav-control-size:32px]';

interface Props {
  active?: TabHref;
  /** The unlisted Blog tab (only the blog page shows it). */
  blog?: boolean;
  /** Include the terminal launcher (>_). */
  terminal?: boolean;
}

export function TabBar({ active, blog = false, terminal = true }: Props) {
  const tabs = blog ? [...TABS, BLOG_TAB] : TABS;
  return (
    <nav className={bar} aria-label="Primary">
      <div className="site-tabs-group flex min-w-0 items-center gap-(--site-tabs-gap)">
        {tabs.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={`${tabBase} ${t.href === active ? tabActive : tabIdle}`}
            data-mobile-label={t.mobileLabel}
          >
            {t.label}
          </a>
        ))}
      </div>
      <div className={controls}>
        {terminal && (
          <button id="ag-console-fab" className={fab} type="button" title="Open terminal  ( ` )" aria-label="Open interactive terminal">
            <span aria-hidden="true">&gt;_</span>
          </button>
        )}
        <button
          id="site-theme-btn"
          className={switchBtn}
          type="button"
          role="switch"
          aria-checked="true"
          aria-label="Toggle light and dark theme"
          title="Toggle theme"
        >
          <span className={switchTrack}>
            <svg className={moon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path stroke="none" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <svg className={sun} viewBox="0 0 24 24" aria-hidden="true" focusable="false" strokeWidth="2.2" strokeLinecap="round">
              <circle stroke="none" cx="12" cy="12" r="4.6" />
              <path
                fill="none"
                d="M12 1.8v2.4M12 19.8v2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7"
              />
            </svg>
          </span>
        </button>
      </div>
    </nav>
  );
}

/** "Skip to main content", visible only while focused. */
export function SkipLink() {
  return (
    <a
      className="skip-link absolute top-2 left-1/2 z-[4000] rounded-[10px] border border-[#a855f7] bg-[#0d0d0d] px-[18px] py-[10px] text-[0.9rem] text-white no-underline [font-family:inherit] [transform:translate(-50%,-160%)] transition-transform duration-[180ms] ease-[ease] focus:[transform:translate(-50%,0)] focus:outline-none"
      href="#main-content"
    >
      Skip to main content
    </a>
  );
}
