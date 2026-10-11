import { type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { innerScroll } from '../../components/classes.ts';
import { countFor, type Filter, FILTERS, type FilterKey, PHOTOS, type Photo, photosFor } from './data.ts';

/*
 * The photo page's interactive part: filter pills, the masonry grid and the
 * lightbox. Server-rendered into the page's HTML and hydrated as one island.
 */

const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));

/** Rounded corners flatten to 4px on keyboard focus, matching the site's focus ring. */
const fv = 'focus-visible:rounded-[4px]';

/* ------------------------------ filter pills ------------------------------ */

const pillBase = [
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-[18px] py-[9px] font-['Space_Mono',monospace] text-[0.85em] tracking-[0.02em]",
  'backdrop-blur-[6px] [transition:transform_0.2s_ease,border-color_0.25s_ease,background_0.25s_ease,box-shadow_0.25s_ease] hover:[transform:translateY(-2px)]',
  fv,
].join(' ');
const pillIdle =
  'border-(--border-color) bg-[color-mix(in_srgb,var(--bg-color)_70%,transparent)] text-(--text-color) hover:border-[#a855f7] light:hover:border-[#f97316]';
// Light mode uses the site's orange (home card, top bar, terminal) with near-black
// text: white on #f97316 is only 2.8:1 contrast, dark ink is 6.6:1.
const pillActive = [
  'border-transparent bg-[#a855f7] text-white shadow-[0_8px_22px_-8px_rgba(168,85,247,0.6)]',
  'light:bg-[#f97316] light:text-[#1a1206] light:shadow-[0_8px_22px_-8px_rgba(249,115,22,0.6)]',
].join(' ');
const countBase = 'rounded-full border px-[7px] py-px text-[0.78em]';
const countIdle = 'border-(--border-color) opacity-55';
const countActive = 'border-[rgba(255,255,255,0.4)] opacity-85 light:border-[rgba(26,18,6,0.35)]';

function FilterPill({ filter, active, onPick }: { filter: Filter; active: boolean; onPick: (k: FilterKey) => void }) {
  return (
    <button type="button" className={`${pillBase} ${active ? pillActive : pillIdle}`} onClick={() => onPick(filter.key)}>
      {filter.label}{' '}
      <span className={`${countBase} ${active ? countActive : countIdle}`}>{countFor(filter.key)}</span>
    </button>
  );
}

/* -------------------------------- grid cards -------------------------------- */

const card = [
  'photo-card group relative mb-[22px] cursor-pointer overflow-hidden rounded-[16px] bg-[#15131c] [break-inside:avoid]',
  'shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-shadow duration-[350ms] ease-[ease]',
  'hover:shadow-[0_24px_50px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(168,85,247,0.4)] motion-reduce:transition-none',
  fv,
].join(' ');
const cardImg =
  'photo-image block h-auto w-full [transform:scale(1.001)] [transition:transform_0.8s_cubic-bezier(0.22,1,0.36,1),filter_0.5s_ease] group-hover:[transform:scale(1.045)] motion-reduce:transition-none';
// The caption fades in on hover or keyboard focus -- and is always shown on touch
// screens, where there is no hover.
const veil = [
  'absolute inset-0 flex flex-col justify-end px-[18px] pt-[18px] pb-[14px] opacity-0',
  '[background:linear-gradient(to_top,rgba(8,6,14,0.86)_0%,rgba(8,6,14,0.32)_42%,transparent_70%)]',
  'transition-opacity duration-[350ms] ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100',
  '[@media(hover:none)]:opacity-100 [@media(hover:none)]:[background:linear-gradient(to_top,rgba(8,6,14,0.78)_0%,transparent_46%)]',
].join(' ');
const cardLine =
  'flex items-end justify-between gap-[14px] [transform:translateY(8px)] transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:translateY(0)]';

function PhotoCard({
  photo,
  hidden,
  interactive,
  onOpen,
}: {
  photo: Photo;
  hidden: boolean;
  interactive: boolean;
  onOpen: () => void;
}) {
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    <article
      className={hidden ? `${card} hidden` : card}
      data-loc={photo.loc}
      {...(interactive ? { tabIndex: 0, role: 'button', 'aria-label': `Open ${photo.title}`, onClick: onOpen } : {})}
      onKeyDown={onKey}
    >
      <img
        className={cardImg}
        src={photo.thumb}
        srcSet={`${photo.thumb} 900w, ${photo.mid} 2560w`}
        sizes="(max-width: 560px) 92vw, (max-width: 980px) 46vw, 31vw"
        width={photo.w}
        height={photo.h}
        alt={photo.title}
        loading="lazy"
        decoding="async"
      />
      <div className={veil}>
        <div className={cardLine}>
          <span className="font-inter text-[1.02rem] font-extrabold tracking-[-0.01em] text-white">{photo.title}</span>
          <span className="flex-none text-right text-[0.74rem] whitespace-nowrap text-[#cdc4e8]">{photo.city}</span>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------- lightbox -------------------------------- */

const modalBase =
  'fixed inset-0 z-[9500] flex-col items-center justify-center bg-[rgba(5,4,10,0.96)] backdrop-blur-[10px]';
const tool =
  'flex size-[46px] cursor-pointer items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] text-[18px] leading-none text-[#f1f1f1] [transition:background_0.25s,transform_0.2s] hover:bg-[rgba(255,255,255,0.14)]';
const navBtn = [
  'static z-25 flex size-12 flex-none cursor-pointer items-center justify-center rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] text-[24px] text-white select-none',
  '[transition:background_0.25s,transform_0.2s] hover:bg-[rgba(168,85,247,0.35)] le-760:size-[38px] le-760:text-[16px]',
].join(' ');
const thumb =
  'flex-none h-[52px] w-[74px] cursor-pointer overflow-hidden rounded-[8px] border-2 bg-transparent p-0 [transition:opacity_0.25s_ease,border-color_0.25s_ease,transform_0.2s_ease] hover:[transform:translateY(-2px)]';
const caption =
  'pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-7 pt-[60px] pb-[22px] [background:linear-gradient(to_top,rgba(5,4,10,0.9),transparent)] [transition:opacity_0.3s_ease,transform_0.3s_ease] le-760:gap-3 le-760:px-[14px] le-760:pt-[50px] le-760:pb-4';

function Lightbox({
  list,
  open,
  index,
  onClose,
  onStep,
  onJump,
}: {
  list: readonly Photo[];
  open: boolean;
  index: number;
  onClose: () => void;
  onStep: (d: number) => void;
  onJump: (i: number) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const viaStrip = useRef(false);
  const overlayTimer = useRef<number | undefined>(undefined);
  const [overlay, setOverlay] = useState(false);
  // Originals that have finished decoding: the lightbox paints the ~0.5 MB tier
  // first and swaps the full-resolution file in silently once it is ready.
  const [fullReady, setFullReady] = useState<ReadonlySet<string>>(() => new Set());
  const [opened, setOpened] = useState(false);

  const photo = list[index] ?? list[0]!;

  const poke = () => {
    setOverlay(true);
    clearTimeout(overlayTimer.current);
    overlayTimer.current = window.setTimeout(() => setOverlay(false), 2800);
  };

  // Navigating (or opening): load the full-res original, warm the neighbours.
  useEffect(() => {
    if (!open) return;
    setOpened(true);
    poke();
    if (!fullReady.has(photo.id)) {
      const hi = new Image();
      hi.decoding = 'async';
      hi.onload = () => setFullReady((s) => new Set(s).add(photo.id));
      hi.src = photo.full; // on error, the mid tier simply stays on screen
    }
    for (const d of [1, -1]) {
      const img = new Image();
      img.decoding = 'async';
      img.src = list[(index + d + list.length) % list.length]!.mid; // ~0.5 MB, not the ~4 MB original
    }
  }, [open, index, photo.id]);

  // Keep the active thumbnail in view (unless it was the thumbnail that was clicked).
  useEffect(() => {
    if (!open) return;
    if (!viaStrip.current) {
      stripRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    viaStrip.current = false;
  }, [open, index]);

  // The page scroller must not move behind the lightbox.
  useEffect(() => {
    if (!open) return;
    const sc = document.querySelector<HTMLElement>('.inner-scroll');
    if (sc) sc.style.overflowY = 'hidden';
    return () => {
      if (sc) sc.style.overflowY = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, onStep]);

  // Swipe left/right on the stage to move between photos.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let sx = 0;
    let sy = 0;
    let on = false;
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0]!.clientX;
      sy = e.touches[0]!.clientY;
      on = true;
    };
    const end = (e: TouchEvent) => {
      if (!on) return;
      on = false;
      const dx = e.changedTouches[0]!.clientX - sx;
      const dy = e.changedTouches[0]!.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) onStep(dx < 0 ? 1 : -1);
    };
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchend', end, { passive: true });
    return () => {
      stage.removeEventListener('touchstart', start);
      stage.removeEventListener('touchend', end);
    };
  }, [onStep]);

  const onBackdrop = (e: ReactMouseEvent) => {
    if (e.target === modalRef.current || e.target === stageRef.current) onClose();
  };

  return (
    <div
      id="photo-modal"
      ref={modalRef}
      className={`${modalBase} ${open ? 'flex' : 'hidden'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onBackdrop}
    >
      <div className="absolute top-5 left-[26px] z-20 font-['Space_Mono',monospace] text-[0.82rem] tracking-[0.22em] text-[#b9aee0] select-none le-760:left-4">
        {pad(index + 1)} / {pad(list.length)}
      </div>
      <div className="absolute top-[14px] right-[18px] z-30 flex gap-[10px]">
        <button className={`${tool} text-[30px] hover:[transform:rotate(90deg)] ${fv}`} type="button" aria-label="Close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div
        ref={stageRef}
        className="relative flex min-h-0 w-full flex-auto items-center justify-center px-7 pt-16 pb-4 le-760:px-3 le-760:pt-[58px] le-760:pb-[10px]"
        onMouseMove={poke}
        onTouchStart={poke}
      >
        {/* data-no-reveal: the lightbox runs its own zoom animation and swaps src mid -> full,
            which would otherwise re-trigger the global blur-up. */}
        <img
          className="max-h-full max-w-full cursor-zoom-in rounded-[6px] object-contain shadow-[0_30px_90px_rgba(0,0,0,0.7)] animate-lb-zoom motion-reduce:animate-none"
          alt={opened ? photo.title : ''}
          src={opened ? (fullReady.has(photo.id) ? photo.full : photo.mid) : undefined}
          data-no-reveal=""
        />
        <div className={`${caption} ${overlay ? 'opacity-100 [transform:none]' : 'opacity-0 [transform:translateY(8px)]'}`}>
          <div className="font-inter text-[clamp(1rem,2.4vw,1.35rem)] font-extrabold text-white">{opened ? photo.title : ''}</div>
          <div className="flex-none text-right text-[0.85rem] text-[#c9bdf0]">{opened ? photo.city : ''}</div>
        </div>
      </div>

      {/* Bottom tray: [prev] [filmstrip] [next] on one row. */}
      <div className="flex min-w-0 flex-none items-center gap-3 px-[18px] pt-[10px] pb-[18px] le-760:gap-2 le-760:px-[10px] le-760:pt-2 le-760:pb-[14px]">
        <button className={`${navBtn} hover:[transform:translateX(-3px)] ${fv}`} type="button" aria-label="Previous photo" onClick={() => onStep(-1)}>
          &#10094;
        </button>
        <div
          ref={stripRef}
          aria-label="Photo thumbnails"
          // "safe" centring keeps the first thumbnail reachable once they overflow and the strip scrolls.
          className="flex min-w-0 flex-auto gap-2 overflow-x-auto py-[2px] [justify-content:safe_center] [scrollbar-color:rgba(168,85,247,0.5)_transparent] [scrollbar-width:thin]"
        >
          {list.map((p, i) => (
            <button
              key={p.id}
              className={`${thumb} ${i === index ? 'border-[#a855f7] opacity-100' : 'border-transparent opacity-45 hover:opacity-85'} ${fv}`}
              type="button"
              aria-label={p.title}
              onClick={() => {
                viaStrip.current = true;
                onJump(i);
              }}
            >
              <img className="block h-full w-full object-cover" src={p.thumb} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
        <button className={`${navBtn} hover:[transform:translateX(3px)] ${fv}`} type="button" aria-label="Next photo" onClick={() => onStep(1)}>
          &#10095;
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- gallery --------------------------------- */

export function Gallery() {
  const [filter, setFilterKey] = useState<FilterKey>('all');
  // The grid fades out, swaps what it shows, and fades back in: `shown` lags `filter` by that fade.
  const [shown, setShown] = useState<FilterKey>('all');
  const [switching, setSwitching] = useState(false);
  const [tagline, setTagline] = useState(FILTERS[0]!.tagline);
  const [lb, setLb] = useState({ open: false, index: 0 });
  // Coarse pointer + no hover = a touch device. The lightbox is a desktop
  // feature: on a phone the title and city are already always visible on the
  // card, so tapping a photo would add nothing.
  const [touch, setTouch] = useState(false);
  const filterRef = useRef<FilterKey>('all');

  useEffect(() => setTouch(window.matchMedia('(hover: none)').matches), []);

  const visible = photosFor(shown);
  const list = visible.length ? visible : PHOTOS;

  const pick = (key: FilterKey) => {
    if (filterRef.current === key) return;
    filterRef.current = key;
    setFilterKey(key);
    const f = FILTERS.find((x) => x.key === key)!;
    // The tagline is read by screen readers only (it is not painted).
    setTimeout(() => setTagline(f.tagline), 380);
    setSwitching(true);
    setTimeout(() => {
      setShown(key);
      setSwitching(false);
    }, 230);
  };

  const open = (photoIdx: number) => {
    const i = list.indexOf(PHOTOS[photoIdx]!);
    setLb({ open: true, index: i === -1 ? 0 : i });
  };
  const close = () => setLb((s) => ({ ...s, open: false }));
  const step = (d: number) => setLb((s) => ({ ...s, index: (((s.index + d) % list.length) + list.length) % list.length }));
  const jump = (i: number) => setLb((s) => ({ ...s, index: i }));

  return (
    <>
      <div className={`page-shell z-1 ${innerScroll}`}>
        <header className="gallery-hero mx-auto mb-[10px] max-w-[1280px] px-7 pt-[30px] pb-2 le-760:px-4">
          <h1 className="sr-only">Photography</h1>
          <p className="sr-only" id="galleryTagline">
            {tagline}
          </p>
          <div className="flex flex-wrap items-center gap-[10px]" id="filterNav" role="group" aria-label="Filter photos by location">
            {FILTERS.map((f) => (
              <FilterPill key={f.key} filter={f} active={filter === f.key} onPick={pick} />
            ))}
          </div>
        </header>

        <main className="content-area mx-auto max-w-[1280px] px-7 pb-20 le-760:px-4" id="main-content" tabIndex={-1}>
          <div
            className={`photo-grid mt-7 columns-3 gap-x-[22px] transition-opacity duration-[220ms] ease-[ease] le-980:columns-2 le-560:columns-1 ${switching ? 'opacity-0' : ''}`}
            id="gallery"
          >
            {PHOTOS.map((p, i) => (
              <PhotoCard
                key={p.id}
                photo={p}
                hidden={!(shown === 'all' || p.loc === shown)}
                interactive={!touch}
                onOpen={() => open(i)}
              />
            ))}
          </div>
        </main>
      </div>

      <Lightbox list={list} open={lb.open} index={lb.index} onClose={close} onStep={step} onJump={jump} />
    </>
  );
}
