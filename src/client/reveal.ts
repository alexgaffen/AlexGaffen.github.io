/**
 * BLUR-UP IMAGE REVEAL -- photos land soft and sharpen in place.
 * Applies to every <img> on every page, including ones injected later
 * (gallery cards, filmstrip thumbs) and lightbox src swaps. Opt a single
 * image out with data-no-reveal.
 */
const SEEN_KEY = 'img-revealed';

export function initReveal(): void {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  // Which images have already blurred up in this tab. Kept in sessionStorage
  // so it survives tab-to-tab navigation (the pages are separate documents),
  // but not a new session -- an image softens in once and is then simply
  // sharp every other time you meet it, instead of re-blurring on every visit
  // to the page and on every lightbox revisit. sessionStorage can throw or
  // come back empty (private windows, blocked site data), in which case the
  // effect just behaves as it did before.
  let seen = new Set<string>();
  const loadSeen = () => {
    try {
      seen = new Set<string>(JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]') as string[]);
    } catch {
      seen = new Set();
    }
  };
  loadSeen();

  const remember = (img: HTMLImageElement) => {
    // Record both: at arm time an unloaded image has no currentSrc, while a
    // srcset-driven one may settle on a different candidate than .src.
    if (img.src) seen.add(img.src);
    if (img.currentSrc) seen.add(img.currentSrc);
    try {
      sessionStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)));
    } catch {
      /* quota or blocked storage: just don't persist */
    }
  };

  const alreadySeen = (img: HTMLImageElement) =>
    (!!img.src && seen.has(img.src)) || (!!img.currentSrc && seen.has(img.currentSrc));

  const arm = (img: HTMLImageElement) => {
    if (img.hasAttribute('data-no-reveal')) return;
    if (alreadySeen(img)) {
      // Strip both classes rather than jumping to the revealed state, so there
      // is no transition left to run -- the image is just sharp.
      img.classList.remove('img-reveal', 'is-revealed');
      return;
    }
    img.classList.remove('is-revealed');
    img.classList.add('img-reveal');

    let settled = false;
    const reveal = () => {
      if (settled) return;
      settled = true;
      // Two frames so the blurred state paints before the transition starts.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.classList.add('is-revealed');
          // Recorded here, once the reveal is actually on screen, not when the
          // image loads. The tabs are prerendered in the background, where
          // images finish loading unseen and where sessionStorage writes are
          // thrown away when the page is shown -- so a record made at load
          // time never stuck. Animation frames only run once a page is
          // visible, so this runs after the page is really shown.
          remember(img);
        });
      });
    };

    if (img.complete && img.naturalWidth > 0) {
      reveal();
      return;
    }
    img.addEventListener('load', reveal, { once: true });
    img.addEventListener('error', reveal, { once: true });
    // Safety net: never leave an image stuck in the soft state.
    setTimeout(reveal, 8000);
  };

  const armAll = (root: Node) => {
    if (root.nodeType !== 1) return;
    const el = root as Element;
    if (el.tagName === 'IMG') arm(el as HTMLImageElement);
    el.querySelectorAll('img').forEach(arm);
  };

  armAll(document.documentElement);

  // A prerendered page armed its images against the record as it stood when
  // the prerender started. When it is actually shown, re-read the record:
  // anything seen since then goes straight to sharp.
  if (document.prerendering) {
    document.addEventListener(
      'prerenderingchange',
      () => {
        loadSeen();
        document.querySelectorAll<HTMLImageElement>('img.img-reveal:not(.is-revealed)').forEach((img) => {
          if (alreadySeen(img)) img.classList.remove('img-reveal');
        });
      },
      { once: true },
    );
  }

  new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.type === 'attributes') {
        if ((rec.target as Element).tagName === 'IMG') arm(rec.target as HTMLImageElement);
        continue;
      }
      rec.addedNodes.forEach(armAll);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset'],
  });
}
