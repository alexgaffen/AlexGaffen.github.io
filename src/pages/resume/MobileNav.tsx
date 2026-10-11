import { useEffect, useRef, useState } from 'react';

/** Phone-width section navigation: a back-to-top / menu button pair and a slide-in panel. */

export const NAV_LINKS = [
  { id: 'education', label: 'EDUCATION' },
  { id: 'workexperience', label: 'EXPERIENCE' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'competitions-awards', label: 'AWARDS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'hobbies-interests', label: 'HOBBIES & INTERESTS' },
] as const;

/** Where a section's heading sits below the top of the scroll panel when jumped to. */
const NAV_OFFSET = 120;
/** Show the buttons once the page has scrolled past the hero. */
const SHOW_AFTER = 320;

// Written out in full: Tailwind only generates classes it can read verbatim.
const btn =
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2 [box-shadow:var(--shadow-md)] [transition:transform_0.2s_cubic-bezier(0.22,1,0.36,1),color_0.2s_ease,border-color_0.2s_ease] hover:border-accent-line hover:text-accent hover:[transform:translateY(-2px)] focus-visible:rounded-[4px]';

const scroller = (): HTMLElement => document.querySelector<HTMLElement>('.inner-scroll') ?? (document.scrollingElement as HTMLElement);

export function MobileNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // The buttons only appear on phones, after scrolling past the hero.
  useEffect(() => {
    const sc = scroller();
    const onScroll = () => {
      if (window.innerWidth <= 900) setVisible(sc.scrollTop > SHOW_AFTER);
    };
    sc.addEventListener('scroll', onScroll);
    return () => sc.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const toTop = () => scroller().scrollTo({ top: 0, behavior: 'smooth' });

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    const sc = scroller();
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - NAV_OFFSET;
    sc.scrollTo({ top, behavior: 'smooth' });
    // Keep the URL clean (no hash fragment).
    history.replaceState(null, '', location.pathname + location.search);
  };

  return (
    <>
      <div
        id="mobileBottomBtns"
        className={`fixed right-4 bottom-4 z-[1200] hidden gap-2 transition-opacity duration-300 print:hidden le-900:flex ${visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <button className={btn} id="mobileBottomUp" title="Back to top" aria-label="Back to top" onClick={toTop}>
          <i className="fas fa-arrow-up" />
        </button>
        <button className={btn} id="mobileBottomNav" title="Section navigation" aria-label="Section navigation" onClick={() => setOpen(true)}>
          <i className="fas fa-bars" />
        </button>
      </div>

      <div
        ref={panelRef}
        id="mobileNavPanel"
        className={`fixed top-0 right-0 z-[1600] h-full w-[min(280px,82vw)] border-l border-line bg-surface px-6 pt-[72px] pb-6 [box-shadow:var(--shadow-lg)] [transition:transform_0.32s_cubic-bezier(0.22,1,0.36,1)] print:hidden ${open ? '[transform:none]' : '[transform:translateX(105%)]'}`}
      >
        <button
          aria-label="Close navigation"
          className="absolute top-4 right-4 size-[38px] cursor-pointer rounded-full border border-line bg-surface-2 text-ink-2 focus-visible:rounded-[4px]"
          id="mobileNavClose"
          title="Close navigation"
          onClick={() => setOpen(false)}
        >
          <i className="fas fa-times" />
        </button>
        <ul className="m-0 list-none p-0">
          {NAV_LINKS.map((l, i) => (
            <li key={l.id} className="border-b border-line">
              <a
                className={`block px-[0.2em] py-[0.9em] font-resume-mono text-[0.78rem] tracking-[0.08em] no-underline hover:text-accent ${i === 0 ? 'text-accent' : 'text-ink-2'}`}
                href={`#${l.id}`}
                onClick={(e) => go(e, l.id)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div
        id="mobileNavOverlay"
        className={`fixed inset-0 z-[1550] bg-[rgba(0,0,0,0.5)] transition-opacity duration-300 print:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
