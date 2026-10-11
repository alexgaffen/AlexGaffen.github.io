import { Resume } from './resume/Resume.tsx';
import type { PageDef } from './types.ts';

const bodyClass = [
  'has-site-tabs resume-page has-inner-scroll h-dvh overflow-hidden',
  '[--site-tabs-top:0]',
  'm-0 bg-canvas font-body text-[16px] leading-[1.65] text-ink antialiased',
  'selection:bg-accent selection:text-accent-ink',
  // the page reset every box (and pseudo-box) to border-box
  '[&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border',
  'print:bg-white print:text-black',
].join(' ');

export const resume: PageDef = {
  file: 'resume',
  title: 'Alex Gaffen — Resume',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: [
    'inter-latin-wght-normal.woff2',
    'dm-sans-latin-opsz-normal.woff2',
    'syne-latin-wght-normal.woff2',
    'space-mono-latin-400-normal.woff2',
    'space-mono-latin-700-normal.woff2',
  ],
  htmlClassName: 'resume-root [-webkit-text-size-adjust:100%]',
  bodyClassName: bodyClass,
  analytics: true,
  reveal: true,
  // Icon fonts load without blocking first paint.
  externalStyles: [
    { href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', preconnect: 'https://cdnjs.cloudflare.com' },
    { href: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css', preconnect: 'https://cdn.jsdelivr.net' },
  ],
  head: {
    fullIcons: true,
    description:
      'Alex Gaffen - Web CV & Resume. Honours Computer Science student at McMaster University. Highlighting technical expertise, work history in research & industry co-ops, and shipped engineering works.',
    keywords: 'Alex Gaffen Resume, Alex Gaffen McMaster, CS Co-op, AI Developer, Exploit Researcher, Systems Engineering Resume',
    og: {
      title: 'Alex Gaffen — Technical Resume',
      description:
        "Explore Alex Gaffen's computer science resume, featuring 14+ months of industry co-op and research experience, technical stack highlights, and advanced academic shipments.",
      type: 'profile',
      url: 'https://alexgaffen.com/resume.html',
      image: 'https://alexgaffen.github.io/assets/frontheadshot.jpg',
    },
    twitter: {
      title: 'Alex Gaffen — Technical Resume',
      description: 'Explore highlights, publications, stack profiles, and active engineering co-ops of Alex Gaffen from McMaster University.',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    canonical: 'https://alexgaffen.com/resume.html',
    themeColor: '#0d0d0d',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Alex Gaffen',
      url: 'https://alexgaffen.com/resume.html',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
      jobTitle: 'Software Developer · AI & Cybersecurity Researcher',
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'McMaster University' },
      address: { '@type': 'PostalAddress', addressLocality: 'Hamilton', addressRegion: 'ON', addressCountry: 'CA' },
      sameAs: ['https://github.com/alexgaffen', 'https://www.linkedin.com/in/alexgaffen'],
    },
  },
  Body: Resume,
};
