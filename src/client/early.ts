/**
 * The only script that runs before first paint. It is inlined into every
 * page's <head> (no request, no render-blocking fetch), so the theme is right
 * and images are armed for their blur-up in the very first frame.
 *
 * `__REVEAL__` / `__ANALYTICS__` are replaced at build time per page, so a
 * page that doesn't use a feature doesn't ship it.
 */
import { paintTheme, storedDark, THEME_KEY } from './theme.ts';
import { initReveal } from './reveal.ts';

declare const __REVEAL__: boolean;
declare const __ANALYTICS__: boolean;

// Apply the saved (or default) theme synchronously. Opt-in dark: anything other
// than an explicit "true" renders light, so a first visit (or a browser that
// refuses storage) lands in light mode.
try {
  if (localStorage.getItem(THEME_KEY) === null) localStorage.setItem(THEME_KEY, 'false');
} catch {
  /* ignore */
}
paintTheme(storedDark());

if (__REVEAL__) initReveal();

if (__ANALYTICS__) {
  // Privacy-friendly analytics. Held back while the browser is pre-rendering
  // this page for an instant tab switch, so speculative loads never register a
  // pageview for a page the visitor did not actually open.
  const load = () => {
    const s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', 'alexgaffen.com');
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  };
  if (document.prerendering) document.addEventListener('prerenderingchange', load, { once: true });
  else load();
}
