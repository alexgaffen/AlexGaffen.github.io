import type { PageAssets, PageDef } from '../pages/types.ts';
import { AssetsContext } from './AssetsContext.tsx';

const FONT_TYPE = 'font/woff2';

/**
 * Non-blocking third-party stylesheet: preload, then flip to a stylesheet on
 * load. React can't emit a string `onload` handler, so the build swaps this
 * marker attribute for the real one (scripts/build.ts).
 */
export const DEFER_MARK = 'data-async-style';
export const DEFER_ONLOAD = `onload="this.onload=null;this.rel='stylesheet'"`;

function DeferredStyle({ href }: { href: string }) {
  const mark = { [DEFER_MARK]: '' };
  return (
    <>
      <link rel="preload" as="style" href={href} {...mark} />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
}

interface Props {
  page: PageDef;
  assets: PageAssets;
  dev?: boolean;
}

/** The whole HTML document for one page. Rendered to a string at build time. */
export function Document({ page, assets, dev }: Props) {
  const { head } = page;
  const og = head.og;
  const tw = head.twitter;
  return (
    <html lang="en" className={page.htmlClassName}>
      <head>
        <meta charSet="UTF-8" />
        {/* Fonts are self-hosted (@font-face in site.css); these start the ones
            this page shows first before any stylesheet has been parsed. */}
        {page.fonts.map((f) => (
          <link key={f} rel="preload" href={`/assets/fonts/${f}`} as="font" type={FONT_TYPE} crossOrigin="" />
        ))}
        {page.externalStyles?.map((s) =>
          s.preconnect ? <link key={s.preconnect} rel="preconnect" href={s.preconnect} crossOrigin="" /> : null,
        )}
        <meta name="viewport" content={page.viewport} />
        {head.description && <meta name="description" content={head.description} />}
        {head.keywords && <meta name="keywords" content={head.keywords} />}
        {head.author && <meta name="author" content={head.author} />}
        {og && (
          <>
            <meta property="og:title" content={og.title} />
            <meta property="og:description" content={og.description} />
            <meta property="og:type" content={og.type} />
            {og.publishedTime && <meta property="article:published_time" content={og.publishedTime} />}
            <meta property="og:url" content={og.url} />
            <meta property="og:site_name" content="Alex Gaffen" />
            <meta property="og:image" content={og.image} />
          </>
        )}
        {tw && (
          <>
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={tw.title} />
            <meta name="twitter:description" content={tw.description} />
            <meta name="twitter:image" content={tw.image} />
          </>
        )}
        <title>{page.title}</title>
        {head.robots && <meta name="robots" content={head.robots} />}
        {head.canonical && <link rel="canonical" href={head.canonical} />}
        {head.themeColor && <meta name="theme-color" content={head.themeColor} />}
        <link href="/assets/favicon-180.png" rel="icon" type="image/png" sizes={head.fullIcons ? 'any' : undefined} />
        {head.fullIcons && (
          <>
            <link href="/assets/favicon.svg" rel="icon" type="image/svg+xml" />
            <link href="/assets/favicon-180.png" rel="apple-touch-icon" />
            <link href="/site.webmanifest" rel="manifest" />
          </>
        )}
        <script dangerouslySetInnerHTML={{ __html: assets.early }} />
        {head.jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(head.jsonLd, null, 2) }} />
        )}
        {assets.css.map((href) => <link key={href} rel="stylesheet" href={href} />)}
        {page.externalStyles?.map((s) => <DeferredStyle key={s.href} href={s.href} />)}
        {page.noscriptCss && (
          <noscript>
            <style dangerouslySetInnerHTML={{ __html: page.noscriptCss }} />
          </noscript>
        )}
        {dev ? (
          <>
            <script type="module" src="/@vite/client" />
            <script type="module" src={`/src/entries/${page.file}.ts`} />
          </>
        ) : (
          <>
            {assets.preload.map((href) => <link key={href} rel="modulepreload" href={href} />)}
            <script type="module" src={assets.js} />
          </>
        )}
      </head>
      <body className={page.bodyClassName}>
        <AssetsContext.Provider value={assets}>
          <page.Body />
        </AssetsContext.Provider>
      </body>
    </html>
  );
}
