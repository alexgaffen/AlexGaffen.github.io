import { SECTIONS } from './resume/data.ts';
import { FILTERS, PHOTOS } from './photography/data.ts';
import type { PageDef } from './types.ts';

/* The landing page: one scrolling portfolio. A drawing-sheet hero (revision
   table = career history, title block, a live network diagram), then Experience, Projects,
   About, Honours, Coursework, Skills, Photography and Contact.
   Styles: styles/portfolio.css. Behaviour: client/portfolio.ts. */

const EMAIL = 'alexgaffen@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/alexgaffen/';
export const GITHUB = 'https://github.com/alexgaffen';
const X = 'https://x.com/alex_gaffen';

const NAV = [
  ['#experience', 'Experience'],
  ['#projects', 'Projects'],
  ['#about', 'About'],
  ['#photos', 'Photos'],
] as const;

/* Log tail under the hero: one line per role, newest first. */
const BAND = [
  ['2026-05', 'adaptron', 'AI Research Engineer', 'running'],
  ['2026-01', 'mcmaster-medicine', 'Biomedical ML Research Engineer', 'shipped'],
  ['2024-05', 'bonbon', 'Front End Developer Intern', 'shipped'],
  ['2022-09', 'mcmaster', 'Honours Computer Science Co-op', 'running'],
] as const;

type Mark = { img: string } | { mono: string; tone?: string } | { violin: true };

interface Job {
  company: string;
  where: string;
  /** Left out until known (an incoming role before its title and dates are set). */
  role?: string;
  date?: string;
  bullets: string[];
  badge?: string;
  mark: Mark;
}

const EXPERIENCE: Job[] = [
  {
    company: 'PointClickCare',
    where: 'Mississauga, ON',
    badge: 'Incoming',
    mark: { mono: 'PCC', tone: 'pcc' },
    bullets: [
      'Canadian healthcare technology company, headquartered in Mississauga and founded in 2000.',
      'Builds a cloud-based electronic health record platform for long-term and post-acute care: skilled nursing, senior living and home health.',
      'Its care-collaboration network connects those providers with hospitals, health plans and pharmacies.',
    ],
  },
  {
    company: 'Adaptron Inc',
    where: 'Ottawa, ON',
    role: 'AI Research Engineer · 8-month co-op',
    date: 'May 2026 – Present',
    badge: 'Current',
    mark: { img: '/assets/logos/adaptron.png' },
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
    mark: { img: '/assets/logos/bonbon.png' },
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

/* Deploy history = career history, oldest first; the last one is live. */
const DEPLOYS = [
  ['3f9a1c2', 'bonbon/front-end-intern', '2024-05'],
  ['a71e0d4', 'medicine/ml-research-eng', '2026-01'],
  ['c4b28e9', 'adaptron/ai-research-eng', '2026-05'],
] as const;

/* The hero loads like a terminal session: the deploy table and the node card each
   type their command (at s) and print, while the figure scans in on its own. */
const DEPLOYS_CMD = ['git log --deploys', 2.6] as const;
const NODE_CMD = ['kubectl describe node a.gaffen', 3.9] as const;

/** A prompt whose command types itself out at `at` seconds. */
function Typed({ cmd, at }: { cmd: string; at: number }) {
  return (
    <span className="cmd-line" style={{ ['--n' as string]: cmd.length, ['--at' as string]: `${at}s` }}>
      <span className="ps">~ $</span> <span className="typed">{cmd}</span>
    </span>
  );
}

/* Node card (bottom right): who's running this. */
const NODE = [
  ['Node', 'a.gaffen', ''],
  ['Role', 'AI Researcher', ''],
  ['School', 'McMaster', 'hide-sm'],
  ['Year', '4th · CS', 'hide-sm'],
  ['Region', 'Hamilton, ON', 'span2'],
  ['Status', 'Healthy', 'ok-cell'],
  ['Shell', 'zsh', ''],
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

/* ── Hero figure: a model's forward pass feeding a deploy pipeline (train -> ship -> run).
   Positions are percentages rather than a viewBox, so the figure stretches to fill
   whatever box the hero leaves it; nested <svg x y> anchor the fixed-size marks
   (stage boxes, pods). Signal pulses run input -> output -> build -> test -> deploy -> pod. ── */
const LAYERS = [4, 6, 6, 3];
const LX = [3, 15.5, 28, 40.5];
const STAGES = [
  ['BUILD', 53.5],
  ['TEST', 65.5],
  ['DEPLOY', 77.5],
] as const;
const PODS = 4;
const POD_X = 94;
const PIPE_Y = 48;
const nodeY = (n: number, i: number) => 11 + ((i + 0.5) * 74) / n;
const pct = (v: number) => `${+v.toFixed(2)}%`;
type Pt = [number, number];
const EDGES: [Pt, Pt][] = [];
LAYERS.slice(0, -1).forEach((n, l) => {
  for (let a = 0; a < n; a++)
    for (let b = 0; b < LAYERS[l + 1]; b++) EDGES.push([[LX[l], nodeY(n, a)], [LX[l + 1], nodeY(LAYERS[l + 1], b)]]);
});
for (let a = 0; a < LAYERS[3]; a++) EDGES.push([[LX[3], nodeY(LAYERS[3], a)], [STAGES[0][1], PIPE_Y]]);
for (let p = 0; p < PODS; p++) EDGES.push([[STAGES[2][1], PIPE_Y], [POD_X, nodeY(PODS, p)]]);
const ROUTES: Pt[][] = [
  [0, 1, 2, 0, 1],
  [3, 4, 3, 2, 3],
  [1, 3, 5, 1, 0],
  [2, 0, 1, 1, 2],
  [0, 5, 4, 2, 3],
  [3, 2, 0, 0, 1],
].map((r) => [
  ...r.slice(0, 4).map((n, l): Pt => [LX[l], nodeY(LAYERS[l], n)]),
  ...STAGES.map(([, x]): Pt => [x, PIPE_Y]),
  [POD_X, nodeY(PODS, r[4])],
]);
const LABELS = ['INPUT', 'FEATURES', 'LATENT', 'OUTPUT'];
const GROUPS = [
  ['MODEL', LX[0], LX[3]],
  ['CI / CD', STAGES[0][1], STAGES[2][1]],
  ['PROD', POD_X - 4.5, POD_X + 4.5],
] as const;
const late = (d: string) => ({ ['--d' as string]: d });

function Diagram() {
  return (
    <figure className="dwg" aria-hidden="true">
      <svg>
        {EDGES.map(([[x1, y1], [x2, y2]], i) => (
          <line key={i} className="band" x1={pct(x1)} y1={pct(y1)} x2={pct(x2)} y2={pct(y2)} style={{ ['--b' as string]: i % 24 }} />
        ))}
        <line className="pipe late" x1={pct(STAGES[0][1])} x2={pct(STAGES[2][1])} y1={pct(PIPE_Y)} y2={pct(PIPE_Y)} style={late('1.6s')} />
        {ROUTES.map((r, i) => {
          const begin = `${3.4 + i * 0.85}s`;
          const dur = `${5 + (i % 3) * 0.6}s`;
          return (
            <circle key={`p${i}`} className="pulse" r="3.2" opacity="0" cx={pct(r[0][0])} cy={pct(r[0][1])}>
              {/* Hidden until it starts moving, so it never sits at the origin. */}
              <set attributeName="opacity" to="1" begin={begin} />
              <animate attributeName="cx" values={r.map((p) => pct(p[0])).join(';')} dur={dur} begin={begin} repeatCount="indefinite" />
              <animate attributeName="cy" values={r.map((p) => pct(p[1])).join(';')} dur={dur} begin={begin} repeatCount="indefinite" />
            </circle>
          );
        })}
        {LAYERS.map((n, l) =>
          Array.from({ length: n }, (_, i) => (
            <circle key={`${l}-${i}`} className="node late" cx={pct(LX[l])} cy={pct(nodeY(n, i))} r="6" style={late(`${1.2 + l * 0.18}s`)} />
          )),
        )}
        {STAGES.map(([name, x], i) => (
          <svg key={name} x={pct(x)} y={pct(PIPE_Y)} overflow="visible">
            <g className="stage late" style={{ ...late(`${1.9 + i * 0.12}s`), ['--s' as string]: i }}>
              <rect x="-30" y="-13" width="60" height="26" rx="2" />
              <circle className="led" cx="-21" cy="0" r="2.2" />
              <text x="5" y="3.5" textAnchor="middle" fontSize="9">
                {name}
              </text>
            </g>
          </svg>
        ))}
        {Array.from({ length: PODS }, (_, p) => (
          <svg key={`pod${p}`} x={pct(POD_X)} y={pct(nodeY(PODS, p))} overflow="visible">
            <g className="pod late" style={{ ...late(`${2.3 + p * 0.1}s`), ['--p' as string]: p }}>
              <rect x="-15" y="-10" width="30" height="20" rx="2" />
              <circle className="led" cx="9" cy="-4" r="2" />
              <path d="M-9 1H3M-9 5H0" />
            </g>
          </svg>
        ))}
        {LX.map((x, l) => (
          <g key={l} className="col-label late" style={late('2.2s')}>
            <line className="g-dim" x1={pct(x)} x2={pct(x)} y1={pct(91)} y2={pct(94)} />
            <svg x={pct(x)} y="100%" overflow="visible">
              <text className="t-label" y="-2" textAnchor="middle" fontSize="9">
                {LABELS[l]}
              </text>
            </svg>
          </g>
        ))}
        <g className="col-label late" style={late('2.2s')}>
          <line className="g-dim" x1={pct(POD_X)} x2={pct(POD_X)} y1={pct(91)} y2={pct(94)} />
          <svg x={pct(POD_X)} y="100%" overflow="visible">
            <text className="t-label" y="-2" textAnchor="middle" fontSize="9">
              REPLICAS ×{PODS}
            </text>
          </svg>
        </g>
        {GROUPS.map(([name, a, b]) => (
          <g key={name} className="dim late" style={late('2s')}>
            <line x1={pct(a)} x2={pct(b)} y1="12" y2="12" />
            <line x1={pct(a)} x2={pct(a)} y1="7" y2="17" />
            <line x1={pct(b)} x2={pct(b)} y1="7" y2="17" />
            {/* A separate dark copy underneath knocks the line out. Outlining the label
                itself let WebKit paint each letter's outline over its neighbour. */}
            <text className="knock" x={pct((a + b) / 2)} y="15" textAnchor="middle" fontSize="9">
              {name}
            </text>
            <text x={pct((a + b) / 2)} y="15" textAnchor="middle" fontSize="9">
              {name}
            </text>
          </g>
        ))}
        <line className="scan" x1="0" x2="0" y1="0" y2="100%" />
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
      <span className={`exp-mark mono${mark.tone ? ` ${mark.tone}` : ''}`} aria-hidden="true">
        {mark.mono}
      </span>
    );
  return (
    <span className="exp-mark">
      <Violin />
    </span>
  );
}

/** Name on two lines, each line rising in as a whole word. */
function HeroName() {
  return (
    <h1 className="hero-name">
      <span className="word">Alex Gaffen</span>
    </h1>
  );
}

/** Top bar. `base` is '/' on other pages, so the section links lead back home. */
export function SiteNav({ base = '' }: { base?: string }) {
  return (
    <nav id="nav">
      <a className="nav-logo" href={`${base}#hero`} aria-label="Alex Gaffen, home">
        AG
      </a>
      <div className="nav-links">
        {NAV.map(([href, label]) => (
          <a key={href} className="nav-link" href={base + href}>
            {label}
          </a>
        ))}
        <a className="nav-cta" href={`${base}#contact`}>
          Get in touch
        </a>
      </div>
    </nav>
  );
}

export const ICONS = {
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
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

function Body() {
  const first = PHOTOS[0];
  return (
    <>
      <div className="sb" id="sb" aria-hidden="true">
        <span className="sb-thumb" />
      </div>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteNav />

      <main id="main">
        <section id="hero">
          <div className="sheet" id="sheet" aria-hidden="true">
            <img className="sheet-photo" src="/photography/DSLR/banffgondolasunisset.webp" alt="" />
            <span className="sheet-scrim" />
            <div className="con-bar">
              <span className="con-path">
                alexgaffen.com <span>/ portfolio</span>
              </span>
              <span className="con-ok">All systems operational</span>
              <span className="con-clock">
                <b id="clock">--:--:-- EST</b>
              </span>
            </div>
          </div>
          <table className="rev">
            <caption>
              <Typed cmd={DEPLOYS_CMD[0]} at={DEPLOYS_CMD[1]} />
            </caption>
            <thead>
              <tr>
                <th aria-label="Status" />
                <th>Commit</th>
                <th>Deployment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {DEPLOYS.map(([h, d, t], i) => (
                <tr key={h} className={i === DEPLOYS.length - 1 ? 'current' : undefined} style={{ ['--r' as string]: i }}>
                  <td>
                    <span className="dot" />
                  </td>
                  <td>{h}</td>
                  <td data-scramble="">{d}</td>
                  <td data-scramble="">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Diagram />
          <div className="tb">
            <div className="tb-cmd">
              <Typed cmd={NODE_CMD[0]} at={NODE_CMD[1]} />
            </div>
            {NODE.map(([k, v, c], i) => (
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
                <strong>CS</strong> <span className="role-at">@ McMaster University</span>
              </span>
              <span className="role-line">
                <strong>AI Research Engineer</strong> <span className="role-at">@ Adaptron Inc</span>
              </span>
            </p>
          </div>
        </section>

        <div className="status-band" aria-hidden="true">
          <div className="status-band-inner">
            {[...BAND, ...BAND].map(([date, svc, role, state], i) => (
              <div key={i} className="status-band-item">
                <span className="log-time">{date}</span>
                <span className={`log-state ${state}`}>{state === 'running' ? '● running' : '✓ shipped'}</span>
                <span className="log-svc">{svc}</span>
                {role}
              </div>
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
                    {e.role && <strong>{e.role}</strong>}
                    <ul>
                      {e.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="exp-meta">
                    {e.date && <span className="exp-date">{e.date}</span>}
                    {e.badge && <span className={`exp-badge ${e.badge.toLowerCase()}`}>{e.badge}</span>}
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
            <a className="project-card reveal" href="/mock-market">
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
                <span className="card-link">
                  Read the build <span className="arrow">→</span>
                </span>
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
                <span className="card-link">
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
            <h2 className="section-title reveal">Recognition</h2>
            <div className="honours">
              <article className="honour feature reveal">
                <div className="honour-amount">
                  $<span data-count="13800">13,800</span>
                </div>
                <div className="honour-body">
                  <div className="honour-org">Polytechnique Montréal · 2026</div>
                  <h3 className="honour-title">
                    Undergraduate Summer Internship Award <span className="honour-note">(Offer)</span>
                  </h3>
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
            <h2 className="section-title reveal">Toolkit</h2>
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
              <div>
                <p className="section-label">Photography</p>
                <h2 className="section-title reveal">Through My Lens</h2>
              </div>
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
                Let’s build<span className="stop">.</span>
              </h2>
              <div className="contact-stack">
                <div className="contact-card tint t-mail reveal">
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
                <div className="contact-card tint t-linkedin reveal">
                  <a className="contact-card-link" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                    <span className="contact-icon">{ICONS.linkedin}</span>
                    <span className="contact-card-text">
                      <span className="contact-card-label">LinkedIn</span>
                      <span className="contact-card-value">in/alexgaffen</span>
                    </span>
                    <span className="contact-card-arrow">↗</span>
                  </a>
                </div>
                <div className="contact-card tint t-github reveal">
                  <a className="contact-card-link" href={GITHUB} target="_blank" rel="noopener noreferrer">
                    <span className="contact-icon">{ICONS.github}</span>
                    <span className="contact-card-text">
                      <span className="contact-card-label">GitHub</span>
                      <span className="contact-card-value">@alexgaffen</span>
                    </span>
                    <span className="contact-card-arrow">↗</span>
                  </a>
                </div>
                <div className="contact-card tint t-x reveal">
                  <a className="contact-card-link" href={X} target="_blank" rel="noopener noreferrer">
                    <span className="contact-icon">{ICONS.x}</span>
                    <span className="contact-card-text">
                      <span className="contact-card-label">X</span>
                      <span className="contact-card-value">@alex_gaffen</span>
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
  fonts: ['space-grotesk-latin-wght-normal.woff2', 'inter-latin-wght-normal.woff2'],
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
      sameAs: [GITHUB, LINKEDIN, X],
    },
  },
  Body,
};
