import { Island } from '../components/Island.tsx';
import { SkipLink, TabBar } from '../components/TabBar.tsx';
import { Gallery } from './photography/Gallery.tsx';
import type { PageDef } from './types.ts';

// Light: warm beige. Dark: the site's neutral black with off-white text.
const tokens = [
  '[--bg-color:#fcefd4] [--text-color:#0f0f0f] [--link-color:#0f0f0f] [--link-hover:#d62020] [--border-color:#d1cdc2] [--card-radius:16px]',
  'dark:[--bg-color:#000000] dark:[--text-color:#f0f1f4] dark:[--border-color:rgba(255,255,255,0.1)] dark:[--link-color:#f0f1f4] dark:[--link-hover:#ffffff]',
].join(' ');

const bodyClass = [
  'has-site-tabs photo-page has-inner-scroll h-dvh overflow-hidden',
  tokens,
  'm-0 box-border bg-(--bg-color) p-0 font-mono-site text-[14px] leading-[1.6] text-(--text-color) transition-[background-color] duration-[800ms] ease-[ease]',
  // the page reset every box (and pseudo-box) to border-box
  '[&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border',
].join(' ');

function Body() {
  return (
    <>
      <SkipLink />
      <TabBar active="photography.html" />
      <Island name="gallery" component={Gallery} props={{}} />
    </>
  );
}

export const photography: PageDef = {
  file: 'photography',
  title: 'Alex Gaffen — Photography',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: ['inter-latin-wght-normal.woff2', 'space-mono-latin-400-normal.woff2', 'space-mono-latin-700-normal.woff2'],
  htmlClassName: 'scroll-smooth',
  bodyClassName: bodyClass,
  analytics: true,
  reveal: true,
  head: {
    fullIcons: true,
    description:
      'Alex Gaffen - Amateur DSLR and Mobile Photography. High-quality street, landscape, and macro shots from San Francisco and Banff.',
    keywords: 'Alex Gaffen Photography, McMaster DSLR, Street Photography, Landscape Photography, Travel DSLR, Hamilton Photography',
    og: {
      title: 'Alex Gaffen — Photography',
      description: 'A visual diary of amateur landscape, structural, and macro photography captured via DSLR and Samsung.',
      type: 'website',
      url: 'https://alexgaffen.com/photography.html',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    twitter: {
      title: 'Alex Gaffen — Photography',
      description: 'Visual media, travel galleries, and street exploration images shot by Alex Gaffen.',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    canonical: 'https://alexgaffen.com/photography.html',
    themeColor: '#0d0d0d',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Alex Gaffen — Photography',
      url: 'https://alexgaffen.com/photography.html',
      author: { '@type': 'Person', name: 'Alex Gaffen', url: 'https://alexgaffen.com/' },
    },
  },
  Body,
};
