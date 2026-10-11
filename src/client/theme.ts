/** The site's one theme switch: a class on <html>, persisted in localStorage. */
export const THEME_KEY = 'site-dark-mode';

export function storedDark(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Put the theme on <html>. Dark is html.dark-mode with no data-theme (the
 * resume's dark palette is data-theme="aurora"); light is data-theme="light".
 */
export function paintTheme(dark: boolean, html: HTMLElement = document.documentElement): void {
  if (dark) {
    html.classList.add('dark-mode');
    if (location.pathname.includes('resume')) html.setAttribute('data-theme', 'aurora');
    else html.removeAttribute('data-theme');
  } else {
    html.classList.remove('dark-mode');
    html.setAttribute('data-theme', 'light');
  }
}

function syncButton(dark: boolean): void {
  const btn = document.getElementById('site-theme-btn');
  if (!btn) return;
  btn.setAttribute('aria-checked', String(dark));
  btn.dataset.mode = dark ? 'dark' : 'light';
}

/**
 * One crossfade for the whole page (see "DARK/LIGHT THEME SWITCH" in
 * site.css). theme-switching turns every CSS transition off, so the new theme
 * is fully resolved the instant it applies and nothing can lag behind the
 * crossfade. Without View Transition support, or with reduced motion, the
 * switch is simply instant.
 */
export function toggleTheme(): void {
  const html = document.documentElement;
  // Both inside the callback: a click during a running switch skips it, and
  // the skipped switch's cleanup must not strip the class from this one.
  const flip = () => {
    html.classList.add('theme-switching');
    const next = !html.classList.contains('dark-mode');
    try {
      localStorage.setItem(THEME_KEY, String(next));
    } catch {
      /* private mode: the switch still works for this page */
    }
    paintTheme(next);
    syncButton(next);
    void html.offsetWidth; // resolve styles now, while transitions are off
  };
  const done = () => html.classList.remove('theme-switching');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) {
    flip();
    requestAnimationFrame(done);
    return;
  }
  document.startViewTransition(flip).finished.finally(done);
}

export function initTheme(): void {
  const dark = storedDark();
  paintTheme(dark);
  syncButton(dark);
  window.toggleSiteTheme = toggleTheme;
  document.getElementById('site-theme-btn')?.addEventListener('click', toggleTheme);

  // A prerendered tab can sit fully built in the background for a while. If
  // the theme is toggled during that window, this document's classes were
  // already set from the value at prerender time, and activating it doesn't
  // re-run any script. Re-sync right as it goes live, so a toggle-then-switch
  // never lands you back on the old theme.
  document.addEventListener(
    'prerenderingchange',
    () => {
      const now = storedDark();
      paintTheme(now);
      syncButton(now);
    },
    { once: true },
  );
}
