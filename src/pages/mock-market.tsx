import { GITHUB, ICONS, SiteNav } from './index.tsx';
import type { PageDef } from './types.ts';

/* Mock Market case study: what it is, how it's wired, how the signal is made, how it
   degrades, and how it ships. Same look as the home page (styles/portfolio.css, the
   `.cs-` block); same behaviour script (client/portfolio.ts). */

const REPO = `${GITHUB}/MockMarket`;
const URL = 'https://alexgaffen.com/mock-market';
const SUMMARY =
  'Mock Market: a paper-trading platform with live market data, a C++ indicator engine and LLM news analysis, shipped as three Docker services.';

const META = [
  ['Stack', 'React · Node · C++ · Docker'],
  ['Year', '2025'],
  ['Role', 'Solo · design to deploy'],
] as const;

const SPECS = [
  ['Services', '3 containers'],
  ['Starting cash', '$100,000'],
  ['Signal', 'Buy · Sell · Hold'],
  ['Data window', '60d prices · 7d news'],
] as const;

const STEPS = [
  <>Express pulls 60 days of daily closes from Yahoo Finance and the last week of company news from Finnhub.</>,
  <>The closes go to the C++ engine as JSON over a socket.</>,
  <>
    The engine computes a <strong>14-day RSI</strong> with Wilder smoothing, the <strong>20-day SMA</strong> and{' '}
    <strong>Bollinger Bands</strong> at two standard deviations, and returns them as a ready-to-read block of text.
  </>,
  <>Gemini 2.5 Flash, prompted as a portfolio manager, weighs those numbers against the five latest headlines.</>,
  <>
    It answers in <strong>JSON mode</strong> with a decision and four bullets of reasoning, which the client shows beside a
    buy box.
  </>,
];

const FAILURES = [
  ['C++ engine', 'Offline or refuses', 'Analysis continues on news alone, and says so'],
  ['Gemini', 'API error or bad JSON', 'A safe HOLD with “review the indicators” bullets'],
  ['Yahoo Finance', 'No price history', 'UNKNOWN with a data-error note; no AI call made'],
  ['Finnhub news', 'Request fails', '“No specific news found”; analysis still runs'],
  ['Finnhub search', 'Request fails', 'Portfolio search falls back to a local symbol match'],
] as const;

const NEXT = [
  'Add health checks so the API waits for the engine to be ready, not just started.',
  'Move the client’s hard-coded API address into per-environment config.',
  'Settle trades server-side in a Firestore transaction. Today the client reads, then writes, so two open tabs could spend the same cash.',
  'Emit structured logs and per-dependency latency, so the fallbacks above show up on a dashboard, not only in the UI.',
];

function SectionHead({ n, label, title }: { n: string; label: string; title: string }) {
  return (
    <>
      <div className="cs-head">
        <p className="section-label">{label}</p>
        <span className="cs-num">{n}</span>
      </div>
      <h2 className="section-title reveal">{title}</h2>
    </>
  );
}

/** Service map in the drawing-sheet style: three containers on one network, plus the
    managed services they call. Arrows carry a slow dash so the requests read as flowing. */
function Architecture() {
  const box = (x: number, y: number, title: string, sub: string, ext = false) => (
    <g className={ext ? 'ext' : 'svc'}>
      <rect x={x} y={y} width="200" height={ext ? 62 : 78} rx="2" />
      <text className="a-title" x={x + 16} y={y + (ext ? 27 : 33)}>
        {title}
      </text>
      <text className="a-sub" x={x + 16} y={y + (ext ? 46 : 56)}>
        {sub}
      </text>
    </g>
  );
  return (
    <figure className="cs-fig cs-arch reveal">
      <div className="cs-arch-scroll">
        <svg viewBox="0 0 760 420" role="img" aria-label="Architecture: a React client, an Express API and a C++ engine on one Docker network. The client uses Firebase; the API calls Finnhub, Yahoo Finance and Gemini, and sends prices to the C++ engine.">
          <defs>
            <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L8 4L0 8Z" />
            </marker>
          </defs>
          <rect className="net" x="8" y="138" width="744" height="160" />
          <text className="a-net" x="740" y="288" textAnchor="end">
            DOCKER COMPOSE · INVESTOR-NET
          </text>
          {box(20, 22, 'Firebase', 'GOOGLE SIGN-IN · FIRESTORE', true)}
          {box(280, 22, 'Finnhub · Yahoo', 'QUOTES · NEWS · HISTORY', true)}
          {box(280, 340, 'Gemini 2.5 Flash', 'JSON-MODE VERDICT', true)}
          {box(20, 182, 'React client', 'UI · PORTFOLIO · :80')}
          {box(280, 182, 'Express API', 'ORCHESTRATION · :5000')}
          {box(540, 182, 'C++ engine', 'RSI · SMA · BANDS · :8080')}
          <g className="flow">
            <path d="M220 221H276" markerEnd="url(#arr)" />
            <path d="M480 221H536" markerEnd="url(#arr)" />
            <path d="M120 182V88" markerEnd="url(#arr)" markerStart="url(#arr)" />
            <path d="M380 182V88" markerEnd="url(#arr)" />
            <path d="M380 260V336" markerEnd="url(#arr)" />
          </g>
          <text className="a-edge" x="248" y="210" textAnchor="middle">
            REST
          </text>
          <text className="a-edge" x="508" y="210" textAnchor="middle">
            TCP
          </text>
        </svg>
      </div>
      <figcaption>Service map. Solid boxes are the three containers; dashed boxes are the managed services they call.</figcaption>
    </figure>
  );
}

function Body() {
  return (
    <>
      <div className="sb" id="sb" aria-hidden="true">
        <span className="sb-thumb" />
      </div>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteNav base="/" />

      <main id="main" className="cs">
        <header className="cs-hero">
          <img className="cs-hero-bg" src="/assets/mock-market-home.png" alt="" width="2880" height="1460" />
          <div className="cs-hero-inner">
            <div>
              <p className="cs-eyebrow">Personal project · 2025</p>
              <h1 className="cs-title">
                <span className="word">Mock</span>
                <span className="word">
                  Market<span className="stop">.</span>
                </span>
              </h1>
            </div>
            <dl className="cs-meta">
              {META.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <div>
                <dt>Source</dt>
                <dd>
                  <a href={REPO} target="_blank" rel="noopener noreferrer">
                    github.com/alexgaffen/MockMarket <span className="arrow">↗</span>
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <dl className="cs-specs">
          {SPECS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <section className="cs-sec">
          <SectionHead n="01" label="Project overview" title="A trading floor with nothing to lose" />
          <div className="cs-split">
            <div className="cs-text reveal">
              <p>
                Mock Market is a paper-trading site: sign in with Google, get <strong>$100,000 of virtual cash</strong>, and buy
                and sell real tickers at live prices. I built it to practise investing without paying for the lessons, and to
                build a real multi-service system end to end instead of another single-page app.
              </p>
              <p>
                Search finds any listed company, holdings keep their average cost, and the portfolio re-prices itself every
                minute. Every ticker also has an <strong>Analyze</strong> button that returns a Buy, Sell or Hold call with its
                reasoning, built from a C++ indicator engine and an LLM reading the news.
              </p>
              <div className="cs-stats">
                <div>
                  <b>$100K</b>
                  <span>Virtual cash</span>
                </div>
                <div>
                  <b>60s</b>
                  <span>Re-price interval</span>
                </div>
                <div>
                  <b>3</b>
                  <span>Services</span>
                </div>
              </div>
            </div>
            <figure className="cs-fig reveal">
              <img src="/assets/mock-market-home.png" alt="Mock Market portfolio page with a buy panel and a holdings table" width="2880" height="1460" loading="lazy" />
              <figcaption>Portfolio view: holdings, average cost and live equity, re-priced every 60 seconds.</figcaption>
            </figure>
          </div>
        </section>

        <section className="cs-sec">
          <SectionHead n="02" label="Architecture" title="Three services, one network" />
          <div className="cs-text cs-wide reveal">
            <p>
              Each part runs in its own container on one Docker Compose network. The <strong>React client</strong> owns the UI
              and talks to Firebase for Google sign-in and the user&rsquo;s Firestore document: cash balance plus holdings.
              Everything that needs an API key goes through the <strong>Express API</strong>, so no secret ever reaches the
              browser. It proxies Finnhub for search, quotes and logos, pulls price history from Yahoo Finance, and runs the
              analysis.
            </p>
            <p>
              The maths lives in a <strong>C++ service</strong> with no web framework at all: a raw TCP socket that parses just
              enough HTTP to read a JSON body of prices and answer with the indicators. Keeping it separate means the numeric
              code can be swapped or scaled without touching the API.
            </p>
          </div>
          <Architecture />
        </section>

        <section className="cs-sec">
          <SectionHead n="03" label="The signal" title="Hard math, soft news" />
          <div className="cs-split">
            <div className="cs-text reveal">
              <p>Analyze runs a five-step pipeline for each ticker:</p>
              <ol className="cs-steps">
                {STEPS.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <p>
                The split plays to each side&rsquo;s strengths. Deterministic code does the arithmetic, which language models are
                unreliable at, and the model does what code can&rsquo;t: read the news. The prompt spells out the rules of thumb
                (RSI over 70 is overbought, under 30 oversold) and lets strong news override them.
              </p>
            </div>
            <figure className="cs-fig reveal">
              <img src="/assets/mock-market-analyze.jpg" alt="Analyze dialog for GOOG showing a BUY call and four bullets of reasoning" width="2880" height="1450" loading="lazy" />
              <figcaption>The Analyze view: the call, the price, and four bullets citing the indicators and the news.</figcaption>
            </figure>
          </div>
        </section>

        <section className="cs-sec">
          <SectionHead n="04" label="Reliability" title="Any dependency can fail. The page can’t." />
          <div className="cs-text cs-wide reveal">
            <p>
              One analysis touches four outside services, so each one has a defined fallback. The user always gets an answer,
              with a plain note about what was missing, never an error page.
            </p>
          </div>
          <div className="cs-table-wrap reveal">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Dependency</th>
                  <th>Failure</th>
                  <th>What the user gets</th>
                </tr>
              </thead>
              <tbody>
                {FAILURES.map(([d, f, r]) => (
                  <tr key={d}>
                    <td>{d}</td>
                    <td>{f}</td>
                    <td>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cs-sec">
          <SectionHead n="05" label="Shipping it" title="Containers, Compose and CI" />
          <div className="cs-split">
            <div className="cs-text reveal">
              <p>
                Each service has its own Dockerfile and image. One <code>docker compose up</code> builds all three and starts
                them on a shared bridge network, the API after the engine, with API keys passed in from the environment and
                never committed.
              </p>
              <p>
                A <strong>GitHub Actions</strong> workflow builds every image on each push and pull request to main, so a broken
                Dockerfile shows up in review, not on deploy day.
              </p>
            </div>
            <div className="cs-text reveal">
              <h3 className="cs-h3">What I&rsquo;d harden next</h3>
              <ul className="cs-next">
                {NEXT.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="cs-sec">
          <SectionHead n="06" label="Demo" title="See it run" />
          <figure className="cs-fig cs-video reveal">
            <video controls playsInline preload="none" poster="/assets/demos/mock-market-poster.webp" width="1280" height="649">
              <source src="/assets/demos/mock-market-demo.mp4" type="video/mp4" />
            </video>
            <figcaption>Screen recording of Mock Market in use.</figcaption>
          </figure>
        </section>

        <section className="cs-sec cs-end">
          <a className="cs-repo reveal" href={REPO} target="_blank" rel="noopener noreferrer">
            <span className="contact-icon">{ICONS.github}</span>
            <span className="cs-repo-text">
              <span className="contact-card-label">Source code</span>
              <span className="cs-repo-title">View Mock Market on GitHub</span>
            </span>
            <span className="contact-card-arrow">↗</span>
          </a>
          <footer className="foot">
            <a href="/#projects">← Back to portfolio</a>
            <span>© 2026 Alex Gaffen</span>
          </footer>
        </section>
      </main>
    </>
  );
}

export const mockMarket: PageDef = {
  file: 'mock-market',
  title: 'Mock Market | Alex Gaffen',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: ['instrument-serif-latin-400-italic.woff2', 'dm-sans-latin-opsz-normal.woff2'],
  htmlClassName: 'portfolio-root',
  bodyClassName: 'portfolio',
  analytics: true,
  reveal: false,
  head: {
    fullIcons: true,
    description: SUMMARY,
    keywords: 'Mock Market, Alex Gaffen, paper trading, React, Node, C++, Docker, GitHub Actions, Gemini, Firebase',
    author: 'Alex Gaffen',
    og: {
      title: 'Mock Market | Alex Gaffen',
      description: SUMMARY,
      type: 'article',
      url: URL,
      image: 'https://alexgaffen.com/assets/demos/mock-market-poster.webp',
    },
    twitter: {
      title: 'Mock Market | Alex Gaffen',
      description: SUMMARY,
      image: 'https://alexgaffen.com/assets/demos/mock-market-poster.webp',
    },
    canonical: URL,
    themeColor: '#080808',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: 'Mock Market',
      description: SUMMARY,
      url: URL,
      codeRepository: REPO,
      programmingLanguage: ['JavaScript', 'C++'],
      author: { '@type': 'Person', name: 'Alex Gaffen', url: 'https://alexgaffen.com/' },
    },
  },
  Body,
};
