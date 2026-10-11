/**
 * Class bundles shared by several pages. Kept as whole strings so Tailwind's
 * scanner sees every class.
 */

/**
 * A panel pinned beneath the tab bar that scrolls instead of the document.
 * The bar is then genuinely outside the scroll area, and -- the part that
 * matters on a phone -- the DOCUMENT never scrolls on any tab, so the
 * browser's toolbars stay the same size when you switch tabs.
 */
export const innerScroll = [
  'inner-scroll fixed inset-x-0 bottom-0 top-(--site-tabs-shell-height) overflow-x-hidden overflow-y-auto overscroll-contain',
  '[--inner-sb:rgba(255,255,255,0.22)] [--inner-sb-hover:rgba(255,255,255,0.36)]',
  'light:[--inner-sb:rgba(20,18,12,0.28)] light:[--inner-sb-hover:rgba(20,18,12,0.45)]',
  '[scrollbar-width:thin] [scrollbar-color:var(--inner-sb)_transparent]',
  '[&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-transparent',
  '[&::-webkit-scrollbar-thumb]:bg-(--inner-sb) [&::-webkit-scrollbar-thumb]:bg-clip-content',
  '[&::-webkit-scrollbar-thumb:hover]:bg-(--inner-sb-hover)',
].join(' ');

/** Body of a page whose document never scrolls (see innerScroll). */
export const lockedBody = 'has-site-tabs has-inner-scroll h-dvh overflow-hidden';
