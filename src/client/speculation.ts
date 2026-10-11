/**
 * INSTANT TAB SWITCHING
 * The tabs are still ordinary links, but the browser is told to fetch and
 * pre-render the other pages ahead of the click, so switching swaps to an
 * already-built page instead of tearing down and re-rendering from scratch.
 *
 * Chromium runs the speculation rules (prefetch + immediate prerender, which
 * is affordable now that the gallery grid is light and the backdrop canvas
 * stays paused until a prerender is activated); everything else falls back to
 * plain <link rel="prefetch">, which still removes the HTML round-trip.
 */
export function initInstantNav(): void {
  const urls = Array.from(document.querySelectorAll<HTMLAnchorElement>('.site-tab'))
    .filter((a) => !a.classList.contains('is-active'))
    .map((a) => a.getAttribute('href'))
    .filter((h): h is string => !!h && !h.startsWith('#'));
  if (!urls.length) return;

  // Respect data-saver / metered connections: skip speculative loading.
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType ?? ''))) return;

  const supportsRules =
    typeof HTMLScriptElement !== 'undefined' &&
    typeof HTMLScriptElement.supports === 'function' &&
    HTMLScriptElement.supports('speculationrules');

  if (supportsRules) {
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify({
      prefetch: [{ source: 'list', urls, eagerness: 'immediate' }],
      // "immediate" prerenders the other tabs as soon as this page loads, so
      // the very first click is a swap rather than a build.
      prerender: [{ source: 'list', urls, eagerness: 'immediate' }],
    });
    document.head.appendChild(script);
  } else {
    for (const href of urls) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = href;
      document.head.appendChild(link);
    }
  }
}
