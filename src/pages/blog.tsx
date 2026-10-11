import { Island } from '../components/Island.tsx';
import { TabBar } from '../components/TabBar.tsx';
import { Blog } from './blog/Blog.tsx';
import type { PageDef } from './types.ts';

// Light: warm beige. Dark: neutral black and off-white text, with the CRT-green
// accents the tags and code blocks still use.
const tokens = [
  '[--bg-color:#fcefd4] [--text-color:#0f0f0f] [--link-color:#0f0f0f] [--link-hover:#d62020] [--border-color:#d1cdc2]',
  '[--tag-bg:rgba(0,0,0,0.08)] [--tag-active:#0f0f0f] [--code-bg:#1e1e2e] [--code-text:#cdd6f4]',
  'dark:[--bg-color:#000000] dark:[--text-color:#f0f1f4] dark:[--link-color:#f0f1f4] dark:[--link-hover:#ffffff] dark:[--border-color:rgba(255,255,255,0.1)]',
  'dark:[--tag-bg:rgba(0,255,65,0.1)] dark:[--tag-active:#00ff41] dark:[--code-bg:#0d1117] dark:[--code-text:#00ff41]',
].join(' ');

const bodyClass = [
  'has-site-tabs blog-page',
  tokens,
  'm-0 box-border w-full max-w-none bg-(--bg-color) p-0 pt-[74px] font-mono-site text-[14px] leading-[1.6] text-(--text-color) [transition:background-color_0.4s,color_0.4s] le-640:text-[13px]',
  // a faint CRT glow on all text in dark mode
  'dark:[text-shadow:0_0_8px_rgba(0,255,65,0.3)]',
].join(' ');

function Body() {
  return (
    <>
      <TabBar active="blog.html" blog terminal={false} />
      <Island name="blog" component={Blog} props={{}} />
    </>
  );
}

export const blog: PageDef = {
  file: 'blog',
  title: 'Alex Gaffen',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: [
    'inter-latin-wght-normal.woff2',
    'press-start-2p-latin-400-normal.woff2',
    'space-mono-latin-400-normal.woff2',
    'space-mono-latin-700-normal.woff2',
  ],
  bodyClassName: bodyClass,
  analytics: false,
  reveal: true,
  head: { fullIcons: false },
  Body,
};
