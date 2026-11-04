/** Home page behaviour: the console clock, scramble-in text, scroll reveals,
 *  count-ups, grade parallax, the photo viewer and email copy. */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·-';
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Seconds the intro holds the hero back (0 when the intro is skipped). */
const t0 = () => parseFloat(getComputedStyle(root).getPropertyValue('--t0')) || 0;

/** The console bar's clock: local time in Hamilton, ticking every second. */
function initClock(): void {
  const el = document.getElementById('clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 1000);
}

/** Plotter-style text: random glyphs settle into the real text left to right. */
function scramble(el: HTMLElement, delay: number): void {
  const final = el.textContent ?? '';
  const frames = 16;
  let f = 0;
  setTimeout(function tick() {
    el.textContent = [...final]
      .map((c, i) => (c === ' ' || i < (f / frames) * final.length ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
      .join('');
    if (++f <= frames) setTimeout(tick, 34);
    else el.textContent = final;
  }, delay);
}

function countUp(el: HTMLElement): void {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const step = (t: number) => {
    // rAF's timestamp can predate `start` on the first frame; never count below zero.
    const p = Math.min(1, Math.max(0, (t - start) / 1400));
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString('en-CA');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveals(): void {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (!('IntersectionObserver' in window) || reduced) return;
  root.classList.add('reveal-on');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        e.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/** Grade chips drift with the cursor, deeper ones further. */
function initGrades(): void {
  const box = document.getElementById('grades');
  if (!box || reduced || !matchMedia('(pointer: fine)').matches) return;
  box.addEventListener('pointermove', (e) => {
    const r = box.getBoundingClientRect();
    box.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    box.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  });
  box.addEventListener('pointerleave', () => {
    box.style.setProperty('--mx', '0');
    box.style.setProperty('--my', '0');
  });
}

/** In-page photo viewer: filters, arrows, keyboard, swipe and a thumbnail strip. */
function initPhotos(): void {
  const stage = document.getElementById('phStage');
  const strip = document.getElementById('phStrip');
  if (!stage || !strip) return;
  const thumbs = [...strip.querySelectorAll<HTMLButtonElement>('.ph-thumb')];
  const imgs = [...stage.querySelectorAll<HTMLImageElement>('.ph-img')];
  const bg = stage.querySelector<HTMLElement>('.ph-bg')!;
  const title = stage.querySelector<HTMLElement>('.ph-title')!;
  const city = stage.querySelector<HTMLElement>('.ph-city')!;
  const index = document.getElementById('phIndex')!;
  const total = document.getElementById('phTotal')!;
  const filters = [...document.querySelectorAll<HTMLButtonElement>('.ph-filter')];
  const pad = (n: number) => String(n).padStart(2, '0');

  let list = thumbs;
  let cur = 0;
  let front = 0;
  let token = 0;

  const show = (i: number) => {
    cur = (i + list.length) % list.length;
    const t = list[cur];
    const d = t.dataset;
    thumbs.forEach((x) => x.classList.toggle('on', x === t));
    index.textContent = pad(cur + 1);
    title.textContent = d.title ?? '';
    city.textContent = d.city ?? '';
    // Centre the active thumb inside the strip without scrolling the page.
    strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });

    const mine = ++token;
    const back = imgs[1 - front];
    back.src = d.mid ?? '';
    back.alt = d.title ?? '';
    back.decode().catch(() => undefined).then(() => {
      if (mine !== token) return;
      back.classList.add('on');
      imgs[front].classList.remove('on');
      imgs[front].alt = '';
      front = 1 - front;
      bg.style.backgroundImage = `url(${d.thumb})`;
    });
    // Warm the next one.
    const next = list[(cur + 1) % list.length]?.dataset.mid;
    if (next) new Image().src = next;
  };

  thumbs.forEach((t) => t.addEventListener('click', () => show(list.indexOf(t))));
  stage.querySelector('.prev')!.addEventListener('click', () => show(cur - 1));
  stage.querySelector('.next')!.addEventListener('click', () => show(cur + 1));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
    else return;
    e.preventDefault();
  });
  let x0: number | null = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') x0 = e.clientX;
  });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
  });

  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      list = thumbs.filter((t) => key === 'all' || t.dataset.loc === key);
      thumbs.forEach((t) => (t.hidden = !list.includes(t)));
      total.textContent = pad(list.length);
      show(0);
    }),
  );
}

/** Phones draw no scrollbar, so a fixed track + thumb mirrors the page and can be dragged. */
function initMobileScrollbar(): void {
  const sb = document.getElementById('sb');
  const thumb = sb?.querySelector<HTMLElement>('.sb-thumb');
  if (!sb || !thumb || getComputedStyle(sb).display === 'none') return;
  const doc = document.documentElement;
  const sync = () => {
    const vh = innerHeight;
    const max = doc.scrollHeight - vh;
    const h = Math.max(32, (vh / doc.scrollHeight) * vh);
    thumb.style.setProperty('--h', `${h}px`);
    thumb.style.setProperty('--y', `${max > 0 ? (scrollY / max) * (vh - h) : 0}px`);
  };
  let frame = 0;
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(() => ((frame = 0), sync()));
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  sync();
  // Dragging anywhere on the track jumps there and follows the finger.
  const to = (y: number) => {
    const h = thumb.offsetHeight;
    const p = Math.min(1, Math.max(0, (y - h / 2) / (innerHeight - h)));
    scrollTo({ top: p * (doc.scrollHeight - innerHeight), behavior: 'instant' as ScrollBehavior });
  };
  sb.addEventListener('pointerdown', (e) => {
    sb.setPointerCapture(e.pointerId);
    sb.classList.add('drag');
    to(e.clientY);
  });
  sb.addEventListener('pointermove', (e) => {
    if (sb.hasPointerCapture(e.pointerId)) to(e.clientY);
  });
  const end = () => sb.classList.remove('drag');
  sb.addEventListener('pointerup', end);
  sb.addEventListener('pointercancel', end);
}

export function initPortfolio(): void {
  initMobileScrollbar();
  initClock();

  if (!reduced) {
    const base = t0() * 1000;
    // In step with the CSS: deploy rows print from 3.45s (two cells a row), node fields from 5.25s.
    document.querySelectorAll<HTMLElement>('.rev [data-scramble]').forEach((el, i) => scramble(el, base + 3450 + (i >> 1) * 120));
    document.querySelectorAll<HTMLElement>('.tb [data-scramble]').forEach((el, i) => scramble(el, base + 5250 + i * 70));
  }

  const nav = document.getElementById('nav');
  const onScroll = () => nav?.classList.toggle('scrolled', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  initReveals();
  initGrades();
  initPhotos();

  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        btn.textContent = 'Copied';
      } catch {
        btn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => (btn.textContent = 'Copy'), 1600);
    }),
  );
}
