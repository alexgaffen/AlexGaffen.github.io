import type { ReactNode } from 'react';
import { innerScroll } from '../components/classes.ts';
import { SkipLink, TabBar } from '../components/TabBar.tsx';
import { inlineScript } from '../server/inline.ts';
import type { PageDef } from './types.ts';

/* The landing page: a headshot and one card. The page never scrolls -- the
   .inner-scroll panel under the tab bar does, like every other tab -- so on a
   phone the browser's toolbars stay the same size when switching tabs. */

// Tokens: light is a warm beige; dark is neutral black with off-white text.
const tokens = [
  '[--bg-color:#fcefd4] [--text-color:#0f0f0f] [--link-color:#0f0f0f] [--link-hover:#d62020] [--border-color:#d1cdc2]',
  'dark:[--bg-color:#000000] dark:[--text-color:#f0f1f4] dark:[--border-color:rgba(255,255,255,0.1)] dark:[--link-color:#f0f1f4] dark:[--link-hover:#ffffff]',
].join(' ');

const bodyClass = [
  'has-site-tabs index-page has-inner-scroll h-dvh overflow-hidden',
  tokens,
  'm-0 bg-(--bg-color) font-mono-site leading-[1.6] text-(--text-color)',
  // Tops out at the size it reaches on a ~1512px-wide laptop window; it used to
  // keep growing to 28px, so on a big monitor the card was a bigger,
  // tighter-wrapped version of itself.
  'text-[clamp(18px,1.46vw,22px)] laptop:text-[clamp(20px,1.72vw,27px)]',
  'le-800:text-[16px] le-800:leading-[1.55] le-380:text-[15px]',
].join(' ');

// Content sits 24px below the 52px bar (76px from the top); the side gutters
// are 1% + 20px (0.5% + 20px at laptop widths, 16px / 12px on phones).
const scroller = [
  innerScroll,
  'home-scroll box-border flex flex-col px-[calc(1%+20px)] pt-6 pb-14',
  'laptop:px-[calc(0.5%+20px)]',
  'le-800:items-start le-800:px-4 le-800:pb-10 le-380:px-3',
].join(' ');

// Two columns on desktop (photo | card) centred in the panel; one column on a
// phone. fit.ts scales it to the viewport and then reveals it (.is-fit).
const wrapperClass = [
  'relative z-5 m-auto grid w-[min(100%,1440px)] items-center justify-center',
  'grid-cols-[minmax(300px,430px)_minmax(560px,1120px)] gap-[clamp(44px,3.6vw,80px)]',
  'laptop:grid-cols-[minmax(260px,360px)_minmax(520px,900px)] laptop:gap-[clamp(36px,3vw,60px)]',
  'le-800:mx-auto le-800:my-0 le-800:box-border le-800:flex le-800:w-full le-800:max-w-[620px] le-800:min-w-0 le-800:flex-col le-800:gap-4 le-380:gap-[14px]',
  // hidden until the fit script has sized it
  'not-[.is-fit]:invisible',
].join(' ');

const photoFrame = [
  'headshot-card relative z-6 aspect-[4/5] w-full max-w-[480px] shrink-0 self-center justify-self-end overflow-hidden rounded-[16px]',
  'border-4 border-[#a855f7] shadow-[0_10px_30px_rgba(0,0,0,0.15),0_0_25px_rgba(138,43,226,0.25)]',
  'light:border-[#f97316] light:shadow-[0_10px_30px_rgba(0,0,0,0.15),0_0_25px_rgba(249,115,22,0.3)]',
  'laptop:max-w-[420px]',
  'le-800:h-auto le-800:w-[clamp(185px,54vw,225px)] le-800:self-center le-800:rounded-[14px] le-800:border-[3px]',
  'le-380:w-[175px]',
].join(' ');

// The card: a plain solid ring (violet in dark, orange in light) around a fill.
const cardFrame = [
  'main-content glistening-box relative z-1 box-border mb-[1em] w-full max-w-[1120px] justify-self-center rounded-[16px]',
  'border-4 border-[#a855f7] shadow-[0_0_20px_rgba(138,43,226,0.2)]',
  'light:border-[#f97316] light:shadow-[0_0_20px_rgba(249,115,22,0.22)]',
  'dark:shadow-[0_0_22px_rgba(138,43,226,0.22)]',
  'laptop:max-w-[900px]',
  'le-800:mb-0 le-800:block le-800:max-w-full le-800:min-w-0 le-800:rounded-[14px] le-800:border-[3px] le-800:text-center',
].join(' ');

const cardFill = [
  'glisten-fill box-border h-full rounded-[12px] bg-(--bg-color) px-[2.5em] py-[2.25em]',
  'laptop:px-[2.25em] laptop:py-[2.05em]',
  'le-800:rounded-[11px] le-800:p-[clamp(1.25rem,5vw,1.75rem)] le-380:p-[1.1rem]',
].join(' ');

// The card's copy reads as prose, so it uses Inter instead of the site-wide
// monospace; the mono face stays on the chrome around it (tabs, console).
const copy = 'box-inner-content font-inter opacity-100';

const title =
  'home-title -mt-[0.15em] mb-[0.22em] block text-[3.45rem] leading-[1.12] font-bold tracking-[-0.04em] le-800:mt-0 le-800:mb-[0.2em] le-800:text-[clamp(2.15rem,10.5vw,3rem)] le-800:[overflow-wrap:anywhere] le-380:text-[clamp(2rem,10.5vw,2.35rem)]';
const role =
  'home-role mb-[1.2em] block text-[1.08em] italic opacity-[0.82] le-800:mb-[1em] le-800:text-[1rem] le-800:leading-[1.4]';
// One role per line; "@ organisation" never splits, so a role too long for the
// line breaks cleanly before the "@".
const roleLine = 'block le-800:[&+&]:mt-[0.35em]';
const roleOrg = 'whitespace-nowrap le-800:block';

const bio =
  'bio-intro mt-[1em] mb-[1em] text-[1.05em] le-800:mb-[1.15em] le-800:text-left le-800:text-[1rem] le-800:leading-[1.65] le-800:[overflow-wrap:anywhere]';

// Links out of the site are always underlined so they read as links.
const linkCommon =
  'underline decoration-1 underline-offset-[3px] normal-case [line-height:inherit] text-[#b5651d] dark:text-[#cdc4e8] transition-colors duration-[180ms] ease-[ease] hover:decoration-2 focus-visible:decoration-2';
const inlineLink = `${linkCommon} [font-family:inherit] text-[length:inherit] font-semibold`;
const contactLink = `${linkCommon} p-[2px] font-['Space_Mono',monospace] text-[1em]`;

// A dark wash reads fine on the light card but is invisible on the near-black
// dark card, so the tint direction flips with the theme.
const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="bg-[rgba(5,5,5,0.08)] px-1 font-bold dark:bg-[rgba(255,255,255,0.16)]">{children}</strong>
);

const ExternalLink = ({ href, className, children }: { href: string; className: string; children: ReactNode }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

function Body() {
  return (
    <>
      <SkipLink />
      <TabBar active="index.html" />

      <div className={scroller}>
        <div id="main-wrapper" className={wrapperClass}>
          <div className={photoFrame}>
            <img className="block h-full w-full rounded-[12px] object-cover" src="/assets/frontheadshot.jpg" alt="Alex Gaffen" />
          </div>
          <div className={cardFrame} id="main-content" tabIndex={-1}>
            <div className={cardFill}>
              <div className={copy}>
                <div>
                  <span className={title}>Alex Gaffen</span>
                  <span className={role}>
                    <span className={roleLine}>
                      AI Research Engineering <span className={roleOrg}>@ Adaptron Inc</span>
                    </span>
                    <span className={roleLine}>
                      ML Research <span className={roleOrg}>@ McMaster ICE Lab X Adastra Inc</span>
                    </span>
                  </span>
                </div>
                <p className={bio}>
                  Hey! I'm a <Strong>4th year CS</Strong> student at <Strong>McMaster</Strong>. I am obsessed with engineering problems
                  that don't have clean answers in the fields and intersections of <Strong>medical AI</Strong>,{' '}
                  <Strong>robotics</Strong>, and <Strong>systems security</Strong>. I thrive on understanding how things work deeply,
                  optimizing them with creative solutions, and figuring out how they break. I currently research{' '}
                  <Strong>biomedical ML algorithms and interpretable AI models</Strong>. I'm always looking to connect with people
                  passionate about these areas and beyond. Aside from work, I enjoy playing soccer, reading novels, playing violin in
                  the McMaster Symphony Orchestra, and exploring new music genres. A couple of projects I loved building were{' '}
                  <ExternalLink className={inlineLink} href="https://github.com/alexgaffen/investor-practice-website">
                    Mock Market
                  </ExternalLink>
                  , a full-stack investing practice site, and{' '}
                  <ExternalLink className={inlineLink} href="https://github.com/alexgaffen/GhostShell">
                    Ghost Shell
                  </ExternalLink>
                  , an autonomous AI honeypot agent.
                </p>

                <p className="bio-links-wrap mt-[1.2em] mb-[0.2em] flex items-center gap-[10px] text-left font-['Space_Mono',monospace] text-[1.275rem] tracking-[0.06em] le-800:mt-4 le-800:justify-center le-800:text-[0.9rem]">
                  <a className={contactLink} href="mailto:alexgaffen@gmail.com">
                    Email
                  </a>
                  <span className="text-(--border-color)" aria-hidden="true">
                    ·
                  </span>
                  <ExternalLink className={contactLink} href="https://github.com/alexgaffen">
                    GitHub
                  </ExternalLink>
                  <span className="text-(--border-color)" aria-hidden="true">
                    ·
                  </span>
                  <ExternalLink className={contactLink} href="https://www.linkedin.com/in/alexgaffen/">
                    LinkedIn
                  </ExternalLink>
                </p>
                <div className="clear-both" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: inlineScript('fit') }} />
    </>
  );
}

export const index: PageDef = {
  file: 'index',
  title: 'Alex Gaffen',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: ['inter-latin-wght-normal.woff2', 'space-mono-latin-400-normal.woff2', 'space-mono-latin-700-normal.woff2'],
  bodyClassName: bodyClass,
  analytics: true,
  reveal: true,
  noscriptCss: '#main-wrapper { visibility: visible !important; }',
  head: {
    fullIcons: true,
    description:
      'Alex Gaffen - Honours Computer Science student at McMaster University. Building highly optimized systems, artificial intelligence, and interactive web experiences.',
    keywords:
      'Alex Gaffen, Gaffen, McMaster, Computer Science, Software Engineer, Resume, Projects, Developer Portfolio, AI, Systems, Hamilton',
    author: 'Alex Gaffen',
    og: {
      title: 'Alex Gaffen — Software Engineer',
      description:
        'Computer Science student at McMaster. Focusing on AI, low-level systems, and security exploits. Discover portfolio shipments, resume highlights, and active project builds.',
      type: 'website',
      url: 'https://alexgaffen.com/',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    twitter: {
      title: 'Alex Gaffen — Software Engineer',
      description:
        'Honours Computer Science student at McMaster University. Active systems developer, machine learning researcher, and tech shipments director.',
      image: 'https://alexgaffen.github.io/assets/frontheadshot.jpg',
    },
    canonical: 'https://alexgaffen.com/',
    themeColor: '#0d0d0d',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Alex Gaffen',
      url: 'https://alexgaffen.com/',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
      jobTitle: 'AI Research Engineer @ Adaptron Inc · ML Research @ McMaster ICE Lab x Adastra Inc',
      description: 'Honours Computer Science student at McMaster University focused on AI, low-level systems, and security.',
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'McMaster University' },
      address: { '@type': 'PostalAddress', addressLocality: 'Hamilton', addressRegion: 'ON', addressCountry: 'CA' },
      sameAs: ['https://github.com/alexgaffen', 'https://www.linkedin.com/in/alexgaffen'],
    },
  },
  Body,
};
