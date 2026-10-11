import type { ComponentType } from 'react';

export interface OpenGraph {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  /** Present only on article-type pages. */
  publishedTime?: string;
}

export interface TwitterCard {
  title: string;
  description: string;
  image: string;
}

/** Everything that differs between pages in <head>. Absent fields are simply not emitted. */
export interface PageHead {
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  og?: OpenGraph;
  twitter?: TwitterCard;
  themeColor?: string;
  /** schema.org JSON-LD, serialised as-is. */
  jsonLd?: Record<string, unknown>;
  /** Manifest + icons (every page but the two minimal ones). */
  fullIcons: boolean;
}

export interface ExternalStyle {
  href: string;
  /** Hosts to open connections to early. */
  preconnect?: string;
}

export interface PageDef {
  /** File name without extension: `index` -> index.html. */
  file: string;
  title: string;
  head: PageHead;
  viewport: string;
  /** Font files (in /assets/fonts) to preload, in priority order. */
  fonts: readonly string[];
  /** Classes on <html>, for the pages that paint there too. */
  htmlClassName?: string;
  /** Classes on <body>: the page's own tokens and layout. */
  bodyClassName: string;
  /** Plausible analytics (held back during prerender). */
  analytics: boolean;
  /** Blur-up image reveal. */
  reveal: boolean;
  /** Third-party CSS loaded without blocking first paint. */
  externalStyles?: readonly ExternalStyle[];
  /** Inline CSS inside <noscript> in <head>. */
  noscriptCss?: string;
  Body: ComponentType;
}

/** Asset URLs resolved by the build for a page's client entry. */
export interface PageAssets {
  css: string[];
  js: string;
  /** Chunks the entry imports, preloaded so they fetch in parallel. */
  preload: string[];
  /** Pre-paint inline script (theme, blur-up, analytics gate). */
  early: string;
}
