/** Site-wide polish, shared by every page: the nav's current-section mark, pointer
 *  spotlights, card tilt, the hero's depth, the experience rail, and pausing whatever
 *  is off screen. All of it is progressive: no pointer, reduced motion or an older
 *  browser just means a plainer page. */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** One scroll listener for the whole page; each feature adds a reader. */
const readers: ((y: number) => void)[] = [];
function initScroll(): void {
  let frame = 0;
  const run = () => {
    frame = 0;
    for (const r of readers) r(scrollY);
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(run);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  // Late images and fonts move sections around; measure again when the page's height changes.
  new ResizeObserver(queue).observe(document.body);
  run();
}

/** Nav: solid once scrolled, and the link of the section in view marked current. */
function initNav(): void {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('.nav-link')];
  let current = '';
  readers.push((y) => {
    nav.classList.toggle('scrolled', y > 24);
    if (!sections.length) return;
    // The section under a line 40% down the screen.
    const line = innerHeight * 0.4;
    let id = sections[0]!.id;
    for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.id;
    if (id === current) return;
    current = id;
    for (const l of links) l.classList.toggle('active', l.hash === `#${id}`);
  });
}

/** A soft light follows the pointer across cards, and their edge catches it. */
function initSpotlight(): void {
  if (!fine) return;
  const sel = '.skill-cell, .honour, .contact-card, .cert, .project-card';
  for (const el of document.querySelectorAll(sel)) el.insertAdjacentHTML('beforeend', '<span class="spot" aria-hidden="true"></span>');
  let frame = 0;
  let ev: PointerEvent | null = null;
  let tilted: HTMLElement | null = null;
  const untilt = () => {
    tilted?.style.removeProperty('--ax');
    tilted?.style.removeProperty('--ay');
    tilted?.style.removeProperty('--ang');
    tilted = null;
  };
  const run = () => {
    frame = 0;
    const card = (ev?.target as Element | null)?.closest<HTMLElement>(sel);
    if (card !== tilted) untilt();
    if (!card || !ev) return;
    const r = card.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    card.style.setProperty('--sx', `${x.toFixed(1)}px`);
    card.style.setProperty('--sy', `${y.toFixed(1)}px`);
    // Project cards also lean a few degrees toward the pointer.
    if (!reduced && card.classList.contains('project-card')) {
      const nx = x / r.width - 0.5;
      const ny = y / r.height - 0.5;
      card.style.setProperty('--ax', (-ny).toFixed(3));
      card.style.setProperty('--ay', nx.toFixed(3));
      card.style.setProperty('--ang', `${(Math.hypot(nx, ny) * 7).toFixed(2)}deg`);
      tilted = card;
    }
  };
  document.addEventListener(
    'pointermove',
    (e) => {
      ev = e;
      if (!frame) frame = requestAnimationFrame(run);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', untilt);
}

/** Hero depth: the photo and the figure shift a little against each other with the pointer. */
function initHeroDepth(): void {
  const hero = document.getElementById('hero');
  if (!hero || !fine || reduced) return;
  let frame = 0;
  let px = 0;
  let py = 0;
  hero.addEventListener(
    'pointermove',
    (e) => {
      const r = hero.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        hero.style.setProperty('--px', px.toFixed(3));
        hero.style.setProperty('--py', py.toFixed(3));
      });
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', () => {
    px = py = 0;
    hero.style.setProperty('--px', '0');
    hero.style.setProperty('--py', '0');
  });
}

/** The experience rail fills as you read down it, and each entry's mark lights as it's reached. */
function initExperienceRail(): void {
  const list = document.getElementById('expList');
  const bar = list?.querySelector<HTMLElement>('.exp-progress');
  if (!list || !bar) return;
  const items = [...list.querySelectorAll<HTMLElement>('.exp-item')];
  readers.push(() => {
    if (getComputedStyle(bar).display === 'none') return;
    const r = list.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    // The rail runs from the first mark's centre to the last one's.
    const reach = innerHeight * 0.55 - r.top;
    const end = items[items.length - 1]!.offsetTop + 64;
    list.style.setProperty('--reach', `${(clamp(reach, 64, end) - 64).toFixed(0)}px`);
    for (const it of items) it.classList.toggle('lit', it.offsetTop + 64 <= reach);
  });
}

/** Whatever animates forever is paused while it's off screen. */
function initOffscreenPause(): void {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      e.target.toggleAttribute('data-off', !e.isIntersecting);
      for (const svg of e.target.querySelectorAll<SVGSVGElement>('svg')) {
        if (!svg.pauseAnimations) continue;
        if (e.isIntersecting) svg.unpauseAnimations();
        else svg.pauseAnimations();
      }
    }
  });
  for (const el of document.querySelectorAll('#hero, .status-band, .marquee-track, .projects-grid, #grades')) io.observe(el);
}

export function initFx(): void {
  initNav();
  initExperienceRail();
  initScroll();
  initSpotlight();
  initHeroDepth();
  initOffscreenPause();
}
