/**
 * Résumé behaviours that need no component state, wired straight onto the
 * server-rendered markup: clickable cards, keyboard shortcuts, the hash jump,
 * the version stamp and the demo videos.
 */

const scroller = (): HTMLElement => document.querySelector<HTMLElement>('.inner-scroll') ?? (document.scrollingElement as HTMLElement);

/** Where a section's heading sits below the top of the scroll panel when jumped to. */
const NAV_OFFSET = 120;

const offsetIn = (sc: HTMLElement, el: HTMLElement) => el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;

function initCards(): void {
  const hint = document.getElementById('cardHoverHint');
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  const open = (url?: string) => url && window.open(url, '_blank', 'noopener,noreferrer');

  document.querySelectorAll<HTMLElement>('.clickable-card[data-href]').forEach((card) => {
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a, button')) return;
      open(card.dataset.href);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(card.dataset.href);
      }
    });
    if (supportsHover && hint) {
      card.addEventListener('mouseenter', () => {
        hint.textContent = card.dataset.hoverText || 'Open link';
        hint.setAttribute('data-visible', '');
      });
      card.addEventListener('mousemove', (e) => {
        hint.style.left = `${e.clientX + 18}px`;
        hint.style.top = `${e.clientY + 18}px`;
      });
      card.addEventListener('mouseleave', () => hint.removeAttribute('data-visible'));
    }
  });
}

function initKeys(): void {
  // ArrowUp scrolls to the top (desktop); Escape returns home.
  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowUp' && window.innerWidth > 900) {
      e.preventDefault();
      scroller().scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.key === 'Escape') location.href = 'index.html';
  });
}

function initScrollStart(): void {
  // Always start at the top on load/refresh -- unless the link names a section.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const sc = scroller();
  sc.scrollTo({ top: 0, behavior: 'auto' });
  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) sc.scrollTo({ top: offsetIn(sc, el) - NAV_OFFSET });
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/** "CURRICULUM VITAE · v2026.08": the stamp tracks the current month. */
function initVersion(): void {
  const el = document.getElementById('cvVersion');
  if (!el) return;
  const d = new Date();
  el.textContent = `v${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * The demo videos (several MB between them) load and play only while near the
 * screen on a page someone is actually looking at -- not in a background
 * prerender -- and pause when they scroll away.
 */
function initVideos(): void {
  const vids = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));
  if (!vids.length) return;
  if (!('IntersectionObserver' in window)) {
    vids.forEach((v) => {
      v.autoplay = true;
      v.preload = 'auto';
      v.load();
    });
    return;
  }
  const start = () => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) void v.play().catch(() => {});
          else if (!v.paused) v.pause();
        }
      },
      { rootMargin: '300px 0px' },
    );
    vids.forEach((v) => io.observe(v));
  };
  if (document.prerendering) document.addEventListener('prerenderingchange', start, { once: true });
  else start();
}

export function initResume(): void {
  initVersion();
  initScrollStart();
  initCards();
  initKeys();
  initVideos();
}
