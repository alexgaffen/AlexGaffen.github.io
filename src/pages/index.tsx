import { SECTIONS } from './resume/data.ts';
import { FILTERS, PHOTOS } from './photography/data.ts';
import type { PageDef } from './types.ts';

/* The landing page: one scrolling portfolio. An intro plot, a drawing-sheet hero (revision
   table = career history, title block, a live network diagram), then Experience, Projects,
   About, Honours, Coursework, Skills, Photography and Contact.
   Styles: styles/portfolio.css. Behaviour: client/portfolio.ts. */

const EMAIL = 'alexgaffen@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/alexgaffen/';
const GITHUB = 'https://github.com/alexgaffen';

const NAV = [
  ['#experience', 'Experience'],
  ['#projects', 'Projects'],
  ['#about', 'About'],
  ['#photos', 'Photos'],
] as const;

const BAND = [
  'Adaptron Inc — AI Research Engineer',
  'McMaster Dept. of Medicine — Biomedical ML Research Engineer',
  'Bonbon Technologies — Front End Developer Intern',
  'McMaster University — Honours Computer Science Co-op',
];

type Mark = { img: string } | { mono: string } | { violin: true };

interface Job {
  company: string;
  where: string;
  role: string;
  date: string;
  bullets: string[];
  badge?: string;
  mark: Mark;
}

const EXPERIENCE: Job[] = [
  {
    company: 'Adaptron Inc',
    where: 'Ottawa, ON',
    role: 'AI Research Engineer · 8-month co-op',
    date: 'May 2026 – Present',
    badge: 'Current',
    mark: { mono: 'Ad' },
    bullets: [
      'Researching and developing an interpretable cognitive architecture in Python for autonomous robot control, world models, and combining supervised and unsupervised learning.',
      'Building modular, tested components in a Git-based, multi-contributor codebase through code reviews and planning.',
      'Now building the attention and proprioception systems, weighting signals by where on the body they originate to avoid combinatorial overload as sensor inputs grow.',
    ],
  },
  {
    company: 'McMaster Department of Medicine',
    where: 'Hamilton, ON',
    role: 'Biomedical ML Research Engineer',
    date: 'Jan 2026 – May 2026',
    mark: { img: '/assets/mcmaster.png' },
    bullets: [
      'First author on a manuscript in preparation for an AI clinical tool: a patch-based medical imaging pipeline with VGG16 feature extraction and FCM clustering that quantifies and stages liver fibrosis.',
      'Engineered a rate-of-change descent thresholding algorithm with automated brightness normalization, halving the margin of error on fibrosis quantification, plus a human-in-the-loop editor for pathologists.',
      'Met the pathologists who use the tool in their lab, gathered feedback and shipped their changes.',
    ],
  },
  {
    company: 'Bonbon Technologies',
    where: 'Los Angeles, CA · Remote',
    role: 'Front End Developer Intern',
    date: 'May 2024 – Jul 2024',
    mark: { mono: 'Bb' },
    bullets: ['Collaborated with a cross-functional team to build and deploy web components in Svelte, reporting to the CTO.'],
  },
  {
    company: 'McMaster Symphony Orchestra',
    where: 'Hamilton, ON',
    role: 'Violinist',
    date: 'Sept 2022 – Apr 2026',
    mark: { violin: true },
    bullets: ['Four-year member with Level 10 RCM Violin; mentor to students at OrKidstra.'],
  },
];

const REVS = [
  ['A', 'Bonbon — Front End Dev Intern', '2024-05'],
  ['B', 'Dept. of Medicine — ML Research Eng.', '2026-01'],
  ['C', 'Adaptron — AI Research Engineer', '2026-05'],
] as const;

const TITLE_BLOCK = [
  ['Drawn', 'A. Gaffen', ''],
  ['Role', 'AI Researcher', ''],
  ['School', 'McMaster', 'hide-sm'],
  ['Year', '4th · CS', 'hide-sm'],
  ['Part', 'Portfolio', 'span2'],
  ['Rev', 'C', 'rev-cell'],
  ['Sheet', '1 / 1', ''],
];

const SKILLS = [
  ['Python', 'ML · research', ['Adaptron', 'Dept. of Medicine']],
  ['Computer Vision', 'VGG16 · clustering', ['Dept. of Medicine']],
  ['Cognitive Architectures', 'World models · robotics', ['Adaptron']],
  ['React / JavaScript', 'Frontend', ['Dept. of Medicine', 'Mock Market']],
  ['Svelte', 'Web components', ['Bonbon']],
  ['C / C++', 'Systems', ['Mock Market', 'Coursework']],
  ['Docker', 'Containers', ['Mock Market']],
  ['Git & Code Review', 'Collaboration', ['Adaptron', 'Bonbon']],
] as const;

// Every A-range grade from the résumé's coursework list, best first.
const GRADE_ORDER: Record<string, number> = { 'A+': 0, A: 1, 'A-': 2 };
const COURSES = (SECTIONS.find((s) => s.id === 'education')?.items[0].courses ?? [])
  .map((c) => c.match(/\((A[+-]?)\)\s+(\S+\s+\S+?):\s+(.+)$/))
  .filter((m): m is RegExpMatchArray => !!m)
  .map(([, grade, code, name]) => ({ grade, code, name }))
  .sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]);

/* ── Hero network diagram: layers of nodes, every edge between neighbouring layers,
   and signal pulses that run input -> output along fixed routes. ── */
const LAYERS = [4, 6, 6, 3];
const LX = [70, 210, 350, 490];
const nodeY = (n: number, i: number) => 40 + ((i + 0.5) * 300) / n;
const EDGES: string[] = [];
LAYERS.slice(0, -1).forEach((n, l) => {
  for (let a = 0; a < n; a++)
    for (let b = 0; b < LAYERS[l + 1]; b++)
      EDGES.push(`M${LX[l]} ${nodeY(n, a).toFixed(1)}L${LX[l + 1]} ${nodeY(LAYERS[l + 1], b).toFixed(1)}`);
});
const ROUTES = [
  [0, 1, 2, 0],
  [3, 4, 3, 2],
  [1, 3, 5, 1],
  [2, 0, 1, 1],
  [0, 5, 4, 2],
  [3, 2, 0, 0],
].map((r) => 'M' + r.map((n, l) => `${LX[l]} ${nodeY(LAYERS[l], n).toFixed(1)}`).join('L'));
const LABELS = ['INPUT', 'FEATURES', 'LATENT', 'OUTPUT'];

function Diagram() {
  return (
    <figure className="dwg" aria-hidden="true">
      <svg viewBox="0 0 560 400" className="intro-svg">
        {EDGES.map((d, i) => (
          <path key={i} className="band" d={d} style={{ ['--b' as string]: i % 24 }} />
        ))}
        {ROUTES.map((d, i) => (
          <circle key={`p${i}`} className="pulse" r="3.2" opacity="0">
            {/* Hidden until it starts moving, so it never sits at the origin. */}
            <set attributeName="opacity" to="1" begin={`${3.4 + i * 0.55}s`} />
            <animateMotion dur={`${2.4 + (i % 3) * 0.5}s`} begin={`${3.4 + i * 0.55}s`} repeatCount="indefinite" path={d} />
          </circle>
        ))}
        {LAYERS.map((n, l) =>
          Array.from({ length: n }, (_, i) => (
            <circle key={`${l}-${i}`} className="node late" cx={LX[l]} cy={nodeY(n, i)} r="6" style={{ ['--d' as string]: `${1.2 + l * 0.18}s` }} />
          )),
        )}
        {LX.map((x, l) => (
          <g key={l} className="late" style={{ ['--d' as string]: '2.2s' }}>
            <path className="g-dim" d={`M${x} 352V366`} />
            <text className="t-label" x={x} y="382" textAnchor="middle" fontSize="9">
              {LABELS[l]}
            </text>
          </g>
        ))}
        <path className="g-centre late" d="M20 20H540" style={{ ['--d' as string]: '2s' }} />
        <text className="t-dim late" x="540" y="14" textAnchor="end" fontSize="9" style={{ ['--d' as string]: '2s' }}>
          FIG. 1 — 4·6·6·3
        </text>
        <path className="scan" d="M0 0V400" />
      </svg>
    </figure>
  );
}

/** Line-drawn violin; its strings shimmer and the bow draws while the row is on screen. */
function Violin() {
  const strings = [
    [28, 25.5, 27.5],
    [29.3, 28.5, 29.2],
    [30.7, 31.5, 30.8],
    [32, 34.5, 32.5],
  ];
  return (
    <svg className="violin" viewBox="0 0 60 150" aria-hidden="true">
      <path className="v-line" d="M30 34C18 34 10 40 10 52C10 62 18 66 20 72C21 77 14 82 10 92C6 104 8 128 30 132C52 128 54 104 50 92C46 82 39 77 40 72C42 66 50 62 50 52C50 40 42 34 30 34Z" />
      <path className="v-line" d="M27 36V12H33V36" />
      <circle className="v-line" cx="30" cy="8" r="4" />
      <path className="v-line" d="M21 86c3 6 3 14 0 20M39 86c-3 6-3 14 0 20" />
      <path className="v-line" d="M23 110H37M26 118L30 128L34 118Z" />
      {strings.map(([top, bridge, tail], i) => (
        <path key={i} className="v-string" d={`M${top} 12L${bridge} 110L${tail} 118`} style={{ ['--s' as string]: i }} />
      ))}
      <g className="v-bow">
        <path d="M-6 104L66 90" />
        <path className="v-hair" d="M-6 107L66 93" />
      </g>
    </svg>
  );
}

function JobMark({ mark }: { mark: Mark }) {
  if ('img' in mark) return <img className="exp-mark" src={mark.img} alt="" width="72" height="72" loading="lazy" />;
  if ('mono' in mark)
    return (
      <span className="exp-mark mono" aria-hidden="true">
        {mark.mono}
      </span>
    );
  return (
    <span className="exp-mark">
      <Violin />
    </span>
  );
}

/** Name split into letters so each can rise in on its own beat. */
function HeroName() {
  let i = 0;
  return (
    <h1 className="hero-name" aria-label="Alex Gaffen">
      {'Alex Gaffen'.split(' ').map((word, w) => (
        <span key={w} className="word" aria-hidden="true">
          {[...word].map((c) => (
            <span key={i} className="ch" style={{ ['--i' as string]: i++ }}>
              {c}
            </span>
          ))}
        </span>
      ))}
      <span className="stop" aria-hidden="true">
        .
      </span>
    </h1>
  );
}

const ICONS = {
  mail: (
    <svg viewBox="0 0 512 512" aria-hidden="true">
      <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 448 512" aria-hidden="true">
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 496 512" aria-hidden="true">
      <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 320 512" aria-hidden="true">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 320 512" aria-hidden="true">
      <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
    </svg>
  ),
};

/** Patch grid for the fibrosis card: tiles tinted by a fixed pseudo-random "stage". */
function PatchGrid() {
  const cells = Array.from({ length: 12 * 15 }, (_, i) => {
    const x = i % 12;
    const y = Math.floor(i / 12);
    const v = (Math.sin(x * 1.7 + y * 0.9) + Math.cos(x * 0.6 - y * 1.3) + 2) / 4;
    return { x, y, v };
  });
  return (
    <svg className="project-card-bg patch-grid" viewBox="0 0 120 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {cells.map(({ x, y, v }) => (
        <rect key={`${x}-${y}`} x={x * 10 + 0.5} y={y * 10 + 0.5} width="9" height="9" style={{ ['--v' as string]: v.toFixed(2), ['--k' as string]: (x + y) % 9 }} />
      ))}
    </svg>
  );
}

// Inline, before first paint: the intro plays once per session (never with reduced motion).
const INTRO_GATE = `try{var d=document.documentElement;if(!sessionStorage.getItem('ag-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-on');sessionStorage.setItem('ag-intro','1')}}catch(e){}`;
const INTRO_COUNT = `(function(){var el=document.getElementById('introCount');if(!el||!document.documentElement.classList.contains('intro-on'))return;var t0=performance.now();function f(t){var p=Math.min(1,(t-t0)/1350);el.textContent=String(Math.round((1-Math.pow(1-p,3))*100)).padStart(3,'0');if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)})()`;

function Body() {
  const first = PHOTOS[0];
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <div className="intro" aria-hidden="true">
        <div className="intro-top">
          <span>Alex Gaffen — Portfolio</span>
          <span>Sheet 1 / 1 · Rev C</span>
        </div>
        <div className="intro-mid">
          <span className="intro-line">Plotting drawing</span>
          <span className="intro-line">Scale 1:1 · Units mm</span>
          <span className="intro-line">McMaster University · Hamilton, ON</span>
        </div>
        <div className="intro-count">
          <span id="introCount">000</span>
          <span className="stop">%</span>
        </div>
        <div className="intro-bar" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: INTRO_COUNT }} />

      <a className="skip" href="#main">
        Skip to content
      </a>
      <nav id="nav">
        <a className="nav-logo" href="#hero" aria-label="Alex Gaffen, top of page">
          AG
        </a>
        <div className="nav-links">
          {NAV.map(([href, label]) => (
            <a key={href} className="nav-link" href={href}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#contact">
            Say hello
          </a>
        </div>
      </nav>

      <main id="main">
        <section id="hero">
          <div className="sheet" id="sheet" aria-hidden="true" />
          <table className="rev">
            <thead>
              <tr>
                <th>Rev</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {REVS.map(([r, d, t], i) => (
                <tr key={r} className={i === REVS.length - 1 ? 'current' : undefined} style={{ ['--r' as string]: i }}>
                  <td>{r}</td>
                  <td data-scramble="">{d}</td>
                  <td data-scramble="">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Diagram />
          <div className="tb">
            {TITLE_BLOCK.map(([k, v, c], i) => (
              <div key={k} className={c || undefined} style={{ ['--i' as string]: i }}>
                <span>{k}</span>
                <b data-scramble="">{v}</b>
              </div>
            ))}
          </div>
          <HeroName />
          <div id="hero-meta">
            <p className="hero-role">
              <span className="role-line">
                <strong>Computer Science Student</strong> at McMaster University
              </span>
              <span className="role-line">
                <strong>AI Research Engineer</strong> at Adaptron Inc
              </span>
            </p>
          </div>
        </section>

        <div className="status-band" aria-hidden="true">
          <div className="status-band-inner">
            {[...BAND, ...BAND, ...BAND, ...BAND].map((t, i) => (
              <span key={i} className="status-band-item">
                {t}
              </span>
            ))}
          </div>
        </div>

        <section id="experience">
          <div className="section-wrap">
            <div className="exp-header">
              <p className="section-label">Experience</p>
              <h2 className="section-title reveal">Work &amp; Education</h2>
            </div>
            <div className="exp-list">
              {EXPERIENCE.map((e) => (
                <article key={e.company} className="exp-item reveal">
                  <div className="exp-company-col">
                    <JobMark mark={e.mark} />
                    <div>
                      <div className="exp-company">{e.company}</div>
                      <div className="exp-company-sub">{e.where}</div>
                    </div>
                  </div>
                  <div className="exp-role">
                    <strong>{e.role}</strong>
                    <ul>
                      {e.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="exp-meta">
                    <span className="exp-date">{e.date}</span>
                    {e.badge && <span className="exp-badge current">{e.badge}</span>}
                  </div>
                </article>
              ))}
              <article className="exp-item reveal">
                <div className="exp-company-col">
                  <img className="exp-mark" src="/assets/mcmaster.png" alt="" width="72" height="72" loading="lazy" />
                  <div>
                    <div className="exp-company">McMaster University</div>
                    <div className="exp-company-sub">Hamilton, ON</div>
                  </div>
                </div>
                <div className="exp-role">
                  <strong>Honours Computer Science Co-op (B.A.Sc.)</strong>
                  <ul>
                    <li>4th year. Dean&rsquo;s Honour List (2023).</li>
                  </ul>
                </div>
                <div className="exp-meta">
                  <span className="exp-date">2022 – Present</span>
                  <span className="exp-badge muted">Education</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="projects">
          <div className="section-wrap">
            <p className="section-label">Projects</p>
            <h2 className="section-title reveal">Selected Work</h2>
          </div>
          <div className="projects-grid">
            <a className="project-card reveal" href="https://github.com/alexgaffen/investor-practice-website" target="_blank" rel="noopener noreferrer">
              <img className="project-card-bg" src="/assets/demos/mock-market-poster.webp" alt="" loading="lazy" />
              <div className="project-card-overlay" />
              <div className="project-card-color" />
              <span className="project-card-num">01</span>
              <div className="project-card-content">
                <div className="project-tag">React · Node · C++ · Docker</div>
                <div className="project-title">Mock Market</div>
                <p className="project-desc">
                  Full-stack investing practice site: Google auth, live stock data, and a C++ analysis service for trading signals.
                </p>
              </div>
            </a>

            <a className="project-card rally reveal" href="https://rallynow.ca" target="_blank" rel="noopener noreferrer">
              <img className="project-card-bg" src="/assets/rally/og.png" alt="" loading="lazy" />
              <div className="project-card-overlay" />
              <div className="project-card-color" />
              <span className="project-card-num">02</span>
              <span className="rally-ping" aria-hidden="true">
                <img src="/assets/rally/favicon.svg" alt="" width="22" height="22" />
              </span>
              <div className="project-card-content">
                <div className="project-tag">Mobile app · In development</div>
                <div className="project-title">Rally</div>
                <p className="project-desc">
                  Pickup games, study sessions and jam nights near you, on one map. Show up for something, leave with a crew.
                </p>
                <span className="rally-link">
                  rallynow.ca <span className="arrow">↗</span>
                </span>
              </div>
            </a>

            <div className="project-card reveal" tabIndex={0}>
              <PatchGrid />
              <div className="project-card-overlay" />
              <div className="project-card-color" />
              <span className="project-card-num">03</span>
              <div className="project-card-content">
                <div className="project-tag">Python · VGG16 · FCM · React</div>
                <div className="project-title">Liver Fibrosis Staging</div>
                <p className="project-desc">
                  Patch-based imaging pipeline that quantifies and stages liver fibrosis, with a human-in-the-loop editor for
                  pathologists. Manuscript in preparation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about">
          <div className="marquee-track" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="marquee-set">
                <span className="marquee-text filled">Alex Gaffen</span>
                <span className="marquee-text">Medical AI</span>
                <span className="marquee-text filled">Robotics</span>
                <span className="marquee-text">Systems Security</span>
              </span>
            ))}
          </div>
          <div className="about-body">
            <div className="about-image-col reveal">
              <img className="about-headshot" src="/assets/frontheadshot.jpg" alt="Alex Gaffen" width="320" height="440" loading="lazy" />
            </div>
            <div className="about-text reveal">
              <p>
                Hey! I&rsquo;m a <strong>4th year CS</strong> student at <strong>McMaster</strong>, obsessed with engineering
                problems that don&rsquo;t have clean answers, in the overlap of <strong>medical AI</strong>,{' '}
                <strong>robotics</strong> and <strong>systems security</strong>.
              </p>
              <p>
                I like understanding how things work deeply, optimizing them with creative solutions, and figuring out how they
                break. Right now that means <strong>interpretable cognitive architectures for robots</strong> at Adaptron, after
                building <strong>biomedical ML</strong> for liver fibrosis staging.
              </p>
              <p>
                Away from the keyboard: soccer, novels, violin in the McMaster Symphony Orchestra, and hunting for new music
                genres.
              </p>
            </div>
          </div>
        </section>

        <section id="honours">
          <div className="section-wrap">
            <p className="section-label">Honours &amp; Awards</p>
            <div className="honours">
              <article className="honour feature reveal">
                <div className="honour-amount">
                  $<span data-count="13800">13,800</span>
                </div>
                <div className="honour-body">
                  <div className="honour-org">Polytechnique Montréal · 2026</div>
                  <h3 className="honour-title">Undergraduate Summer Internship Award</h3>
                  <p className="honour-desc">To research AI in cybersecurity under Prof. N. Boulahia-Cuppens.</p>
                  <div className="honour-stats">
                    <div>
                      <b data-count="326">326</b>
                      <span>applicants</span>
                    </div>
                    <div>
                      <b data-count="36">36</b>
                      <span>universities</span>
                    </div>
                    <div>
                      <b>1</b>
                      <span>selected</span>
                    </div>
                  </div>
                </div>
              </article>
              <article className="honour reveal">
                <div className="honour-amount small">
                  $<span data-count="3000">3,000</span>
                </div>
                <div className="honour-body">
                  <div className="honour-org">McMaster University · 2022</div>
                  <h3 className="honour-title">Award of Excellence</h3>
                </div>
              </article>
              <article className="honour reveal">
                <div className="honour-amount small">2023</div>
                <div className="honour-body">
                  <div className="honour-org">McMaster University</div>
                  <h3 className="honour-title">Dean&rsquo;s Honour List</h3>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="coursework">
          <div className="section-wrap">
            <p className="section-label">Coursework</p>
            <h2 className="section-title reveal">Top Marks</h2>
            <div className="grades" id="grades">
              {COURSES.map((c, i) => (
                <div
                  key={c.code}
                  className={`grade-chip g-${c.grade === 'A+' ? 'aplus' : c.grade === 'A' ? 'a' : 'aminus'}`}
                  style={{ ['--z' as string]: ((i * 7) % 5) + 1, ['--f' as string]: i }}
                >
                  <div className="grade-float">
                    <span className="grade-mark">{c.grade}</span>
                    <span className="grade-text">
                      <span className="grade-code">{c.code}</span>
                      <span className="grade-name">{c.name}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="skills">
          <div className="section-wrap">
            <p className="section-label">Technical Skills</p>
            <div className="skills-grid reveal">
              {SKILLS.map(([name, type, used]) => (
                <div key={name} className="skill-cell">
                  <div className="skill-name">{name}</div>
                  <div className="skill-type">{type}</div>
                  <div className="skill-used">
                    <div className="skill-used-label">Used at</div>
                    <ul className="skill-used-list">
                      {used.map((u) => (
                        <li key={u}>{u}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="photos">
          <div className="section-wrap">
            <div className="ph-head">
              <p className="section-label">Photography</p>
              <div className="ph-filters" role="group" aria-label="Filter photos by place">
                {FILTERS.map((f, i) => (
                  <button key={f.key} type="button" className="ph-filter" data-filter={f.key} aria-pressed={i === 0}>
                    {f.label}
                    <sup>{f.key === 'all' ? PHOTOS.length : PHOTOS.filter((p) => p.loc === f.key).length}</sup>
                  </button>
                ))}
              </div>
            </div>
            <div className="ph-stage" id="phStage" tabIndex={0} aria-roledescription="carousel" aria-label="Photo viewer. Use the arrow keys to browse.">
              <div className="ph-bg" style={{ backgroundImage: `url(${first.thumb})` }} />
              <img className="ph-img on" src={first.mid} alt={first.title} />
              <img className="ph-img" alt="" />
              <span className="ph-corner tl" />
              <span className="ph-corner tr" />
              <span className="ph-corner bl" />
              <span className="ph-corner br" />
              <button type="button" className="ph-arrow prev" aria-label="Previous photo">
                {ICONS.prev}
              </button>
              <button type="button" className="ph-arrow next" aria-label="Next photo">
                {ICONS.next}
              </button>
              <div className="ph-cap" aria-live="polite">
                <span className="ph-title">{first.title}</span>
                <span className="ph-city">{first.city}</span>
              </div>
              <div className="ph-count">
                <b id="phIndex">01</b> / <span id="phTotal">{String(PHOTOS.length).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="ph-strip" id="phStrip">
              {PHOTOS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`ph-thumb${i === 0 ? ' on' : ''}`}
                  data-loc={p.loc}
                  data-mid={p.mid}
                  data-thumb={p.thumb}
                  data-title={p.title}
                  data-city={p.city}
                  aria-label={`${p.title}, ${p.city}`}
                >
                  <img src={p.thumb} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="section-wrap contact-wrap">
            <p className="section-label">Contact</p>
            <div className="contact-grid">
              <h2 className="contact-headline reveal">
                Want to build something together<span className="stop">?</span>
              </h2>
              <div className="contact-stack">
                <div className="contact-card primary reveal">
                  <a className="contact-card-link" href={`mailto:${EMAIL}`}>
                    <span className="contact-icon">{ICONS.mail}</span>
                    <span className="contact-card-text">
                      <span className="contact-card-label">Email</span>
                      <span className="contact-card-value">{EMAIL}</span>
                    </span>
                  </a>
                  <button type="button" className="copy-btn" data-copy={EMAIL}>
                    Copy
                  </button>
                </div>
                <div className="contact-card reveal">
                  <a className="contact-card-link" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                    <span className="contact-icon">{ICONS.linkedin}</span>
                    <span className="contact-card-text">
                      <span className="contact-card-label">LinkedIn</span>
                      <span className="contact-card-value">in/alexgaffen</span>
                    </span>
                    <span className="contact-card-arrow">↗</span>
                  </a>
                </div>
                <div className="contact-card reveal">
                  <a className="contact-card-link" href={GITHUB} target="_blank" rel="noopener noreferrer">
                    <span className="contact-icon">{ICONS.github}</span>
                    <span className="contact-card-text">
                      <span className="contact-card-label">GitHub</span>
                      <span className="contact-card-value">@alexgaffen</span>
                    </span>
                    <span className="contact-card-arrow">↗</span>
                  </a>
                </div>
              </div>
            </div>
            <footer className="foot">
              <span>© 2026 Alex Gaffen</span>
              <a href="#hero">Back to top ↑</a>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}

export const index: PageDef = {
  file: 'index',
  title: 'Alex Gaffen | Computer Science & AI Portfolio',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: ['instrument-serif-latin-400-italic.woff2', 'dm-sans-latin-opsz-normal.woff2'],
  htmlClassName: 'portfolio-root',
  bodyClassName: 'portfolio',
  analytics: true,
  reveal: false,
  head: {
    fullIcons: true,
    description:
      'Alex Gaffen, Honours Computer Science student at McMaster University and AI Research Engineer at Adaptron Inc. Medical AI, robotics and systems security.',
    keywords: 'Alex Gaffen, McMaster, Computer Science, AI, Machine Learning, Robotics, Software Engineer, Portfolio, Hamilton',
    author: 'Alex Gaffen',
    og: {
      title: 'Alex Gaffen | Computer Science & AI Portfolio',
      description: 'Computer Science student at McMaster and AI Research Engineer at Adaptron. Medical AI, robotics and systems security.',
      type: 'website',
      url: 'https://alexgaffen.com/',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    twitter: {
      title: 'Alex Gaffen | Computer Science & AI Portfolio',
      description: 'Computer Science student at McMaster and AI Research Engineer at Adaptron. Medical AI, robotics and systems security.',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    canonical: 'https://alexgaffen.com/',
    themeColor: '#080808',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Alex Gaffen',
      url: 'https://alexgaffen.com/',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
      jobTitle: 'AI Research Engineer at Adaptron Inc',
      description: 'Honours Computer Science student at McMaster University focused on AI, robotics and systems security.',
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'McMaster University' },
      address: { '@type': 'PostalAddress', addressLocality: 'Hamilton', addressRegion: 'ON', addressCountry: 'CA' },
      sameAs: [GITHUB, LINKEDIN],
    },
  },
  Body,
};
