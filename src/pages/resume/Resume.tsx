import { Island } from '../../components/Island.tsx';
import { innerScroll } from '../../components/classes.ts';
import { SkipLink, TabBar } from '../../components/TabBar.tsx';
import { type Entry, SECTIONS, SKILL_CATEGORIES, type Skill } from './data.ts';
import { ContactForm } from './ContactForm.tsx';
import { HeroTerminal } from './HeroTerminal.tsx';
import { MobileNav } from './MobileNav.tsx';

/* ----------------------------- shared styling ----------------------------- */

const mono = 'font-resume-mono';
const sectionGap = 'mb-[clamp(64px,7vw,104px)]';

/* --------------------------------- chips --------------------------------- */

/** A skill or tech chip. Devicon icons keep their own brand colour; Font Awesome ones are muted. */
function SkillChip({ skill }: { skill: Skill }) {
  const fas = skill.icon.startsWith('fas');
  return (
    <div
      className={`inline-flex items-center gap-[0.45em] rounded-[8px] border border-line bg-surface-2 px-[0.75em] py-[0.35em] ${mono} text-[0.72rem] whitespace-nowrap text-ink-2`}
    >
      <i className={`${skill.icon} text-[0.95em] ${fas ? 'text-ink-3' : ''}`} /> {skill.label}
    </div>
  );
}

/* ------------------------------ entry cards ------------------------------ */

// Every entry uses the same card. Clickable ones (projects, certifications) lift,
// take the section's colour on their border, and show an external-link glyph.
const cardBase =
  'tl-card rounded-[18px] border border-line bg-surface p-6 [box-shadow:var(--shadow-sm)] [transition:border-color_0.25s_ease,box-shadow_0.25s_ease,transform_0.25s_cubic-bezier(0.22,1,0.36,1)] le-560:px-4 print:break-inside-avoid print:border-[#ccc] print:shadow-none';
const cardPlain = `${cardBase} hover:border-line-strong hover:[box-shadow:var(--shadow-md)]`;
const cardLink = [
  cardBase,
  'relative hover:[box-shadow:var(--shadow-md)] group-hover:border-(--sect) group-hover:[transform:translateY(-2px)]',
  "after:absolute after:top-6 after:right-6 after:text-[0.72rem] after:text-ink-3 after:opacity-0 after:content-['\\f35d'] after:[font-family:'Font_Awesome_6_Free'] after:font-black after:transition-opacity after:duration-[250ms] after:ease-[ease] group-hover:after:opacity-100",
].join(' ');

const bullets = 'mt-4 mb-0 list-none p-0';
const bulletBase =
  "relative mb-3 pl-4 leading-[1.6] text-ink-2 before:absolute before:top-[0.62em] before:left-[2px] before:size-1 before:rounded-full before:bg-ink-3 before:content-[''] last:mb-0";
const bullet = `${bulletBase} text-[0.88rem]`;
const courseBullet = `${bulletBase} text-[0.86rem] [break-inside:avoid]`;

function EntryCard({ entry, span }: { entry: Entry; span?: boolean }) {
  const e = entry;
  return (
    <div
      className={`job-item relative mb-6 block ${span ? 'min-[901px]:col-span-full' : ''} ${e.link ? 'clickable-card group cursor-pointer' : ''}`}
      {...(e.link ? { 'data-hover-text': e.link.hint, 'data-href': e.link.href } : {})}
    >
      <div className="p-0">
        {/* The visible title is in the card; this heading keeps the outline and screen readers whole. */}
        <h3 className="sr-only">{e.title}</h3>
        <span className={`block ${mono} text-[0.7rem] font-bold tracking-[0.12em] text-ink-3 uppercase`}>{e.date}</span>
      </div>
      <div className="p-0 text-ink-2">
        {e.logo && (
          <img
            alt={e.logo.alt}
            className="mr-2 inline-block size-5 object-contain align-[-4px] opacity-[0.85]"
            loading="lazy"
            src={e.logo.src}
          />
        )}
        <h4 className="mt-1 mb-3 text-[0.84rem] leading-[1.45] font-medium">
          {e.subIcon && <i className={e.subIcon} style={{ marginRight: '0.4rem' }} />}
          {e.sub}
        </h4>
      </div>
      <div className={e.link ? cardLink : cardPlain}>
        <div className="mb-4 font-display text-[1.04rem] leading-[1.35] font-bold tracking-[-0.01em] [text-wrap:balance]">{e.title}</div>
        {e.badge && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full border border-accent-line bg-accent-soft px-[0.8em] py-[0.35em] text-[0.76rem] font-semibold text-accent">
              {e.badge}
            </span>
          </div>
        )}
        {e.courses && (
          <div className="mt-6">
            <h4 className={`m-0 mb-3 ${mono} text-[0.68rem] font-bold tracking-[0.12em] text-ink-3 uppercase`}>{e.courseHeader}</h4>
            <ul className="m-0 columns-2 list-none gap-x-8 p-0 le-900:columns-1">
              {e.courses.map((c) => (
                <li key={c} className={courseBullet}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {e.skills && (
          <div className="mb-4 flex flex-wrap gap-2 p-0">
            {e.skills.map((s) => (
              <SkillChip key={s.label} skill={s} />
            ))}
          </div>
        )}
        {e.bullets && (
          <ul className={bullets}>
            {e.bullets.map((b) => (
              <li key={b} className={bullet}>
                {b}
              </li>
            ))}
          </ul>
        )}
        {e.video && (
          <div className="mt-6">
            <div className="overflow-hidden rounded-[12px] border border-line">
              <video
                className="block h-auto w-full max-w-full object-cover"
                muted
                loop
                playsInline
                preload="none"
                width={e.video.width}
                height={e.video.height}
                style={{ aspectRatio: `${e.video.width} / ${e.video.height}` }}
                poster={e.video.poster}
              >
                <source src={e.video.src} type="video/mp4" />
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- sections -------------------------------- */

const h2 = [
  'm-0 mb-[44px] flex items-center gap-4 font-display text-[clamp(1.15rem,1.8vw,1.45rem)] font-bold tracking-[0.02em] text-ink',
  // a hairline runs out to the right of every section title
  "after:h-px after:flex-auto after:bg-line after:content-[''] le-560:after:hidden",
].join(' ');

/** Sections of entries lay their cards out as a grid on wide screens; a lone entry spans the row. */
const gridSection = 'min-[901px]:grid min-[901px]:grid-cols-[repeat(auto-fit,minmax(420px,1fr))] min-[901px]:items-start min-[901px]:gap-x-4';

function Section({ id, title, children, grid }: { id: string; title: string; children: React.ReactNode; grid?: boolean }) {
  return (
    <section id={id} className={`relative ${sectionGap} [--sect:var(--accent)] print:break-inside-avoid-page ${grid ? gridSection : ''}`}>
      <h2 className={`${h2} ${grid ? 'min-[901px]:col-span-full' : ''}`}>{title}</h2>
      {children}
    </section>
  );
}

/* ---------------------------------- hero ---------------------------------- */

const chipBase = 'inline-flex items-center gap-[0.5em] rounded-full border px-[0.85em] py-[0.4em] text-[0.8rem] whitespace-nowrap';
const chip = `${chipBase} border-line bg-surface text-ink-2`;
const chipLive = `${chipBase} border-accent-line bg-accent-soft text-accent before:size-[7px] before:animate-pulse-dot before:rounded-full before:bg-accent before:content-['']`;

function Hero() {
  return (
    <header className="resume-hero relative isolate mb-[clamp(48px,5vw,72px)] border-b border-line pt-4 pb-[44px]">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,clamp(340px,36%,460px))] items-center gap-[clamp(28px,4vw,56px)] le-1000:grid-cols-1">
        <div className="min-w-0">
          <span
            className={`mb-4 inline-flex items-center gap-[0.6em] ${mono} text-[0.7rem] tracking-[0.18em] text-ink-2 uppercase`}
          >
            <span className="size-[7px] animate-pulse-dot rounded-full bg-accent [box-shadow:0_0_0_3px_var(--accent-soft)]" />
            CURRICULUM VITAE · <span id="cvVersion">v2026.08</span>
          </span>
          <h1 className="m-0 mb-4 font-display text-[clamp(2.9rem,6.4vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.035em] [text-wrap:balance]">
            Alex <span className="text-accent">Gaffen</span>
          </h1>
          <div className="mb-6 flex flex-wrap gap-2">
            <span className={chip}>
              <i className="fas fa-location-dot text-[0.9em] text-ink-3" /> Hamilton, ON
            </span>
            <span className={chip}>
              <i className="fas fa-graduation-cap text-[0.9em] text-ink-3" /> 4th-year Honours CS @ McMaster
            </span>
            <span className={chipLive}>Open to AI &amp; Cybersecurity roles</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-[0.6em] rounded-full bg-accent px-[1.5em] py-[0.8em] text-[0.9rem] font-bold text-accent-ink no-underline [box-shadow:var(--shadow-md)] [transition:transform_0.2s_cubic-bezier(0.22,1,0.36,1),filter_0.2s_ease] hover:[filter:brightness(1.08)] hover:[transform:translateY(-2px)]"
              href="mailto:alexgaffen@gmail.com"
            >
              <i className="fas fa-paper-plane" /> Hire / Collaborate
            </a>
          </div>
        </div>
        <div
          className={`hero-terminal min-w-0 overflow-hidden rounded-[18px] border border-line bg-[#0b0e14] ${mono} [box-shadow:var(--shadow-lg)] le-1000:order-2 light:border-[rgba(60,40,10,0.18)] light:bg-[#fcefd4] print:hidden`}
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] px-[0.9em] py-[0.7em] light:border-b-[rgba(0,0,0,0.08)] light:bg-[rgba(0,0,0,0.035)]">
            <span className="size-[10px] rounded-full bg-[#ff5f57]" />
            <span className="size-[10px] rounded-full bg-[#febc2e]" />
            <span className="size-[10px] rounded-full bg-[#28c840]" />
            <span className="ml-[0.5em] text-[0.68rem] tracking-[0.04em] text-[#7a8494] light:text-[rgba(40,30,12,0.65)]">alex@portfolio: ~</span>
          </div>
          <Island
            name="hero-terminal"
            component={HeroTerminal}
            props={{}}
            id="heroTerminal"
            className="min-h-[210px] p-4 text-[0.78rem] leading-[1.75] text-[#c6c9d0] light:text-[#2a2010]"
          />
        </div>
      </div>

      <div className="mt-[44px] grid grid-cols-4 gap-3 le-1000:grid-cols-2 le-560:grid-cols-1">
        {[
          { icon: 'fa-code', label: 'Coding Since', value: <>2021</>, sub: '~5 years building software' },
          { icon: 'fa-briefcase', label: 'Industry · Research', value: <>14<span className="text-accent">+</span> mo</>, sub: 'Co-op, RA & freelance' },
          { icon: 'fa-rocket', label: 'Shipped Projects', value: <>10<span className="text-accent">+</span></>, sub: 'Full-stack · AI · Systems' },
          { icon: 'fa-microchip', label: 'Stack Highlights', value: <>C++ · Py · React</>, sub: '+ Docker, PyTorch, Flask' },
        ].map((s) => (
          <div key={s.label} className="relative rounded-[12px] border border-line bg-surface px-6 py-4">
            <i className={`fas ${s.icon} mb-3 block text-[0.9rem] text-accent`} />
            <div className={`mb-1 ${mono} text-[0.62rem] tracking-[0.14em] text-ink-3 uppercase`}>{s.label}</div>
            <div className="font-display text-[1.5rem] leading-[1.1] font-bold tracking-[-0.02em]">{s.value}</div>
            <div className="mt-1 text-[0.76rem] text-ink-3">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6" aria-label="Section quick nav">
        {[
          ['#workexperience', 'fa-briefcase', 'Experience'],
          ['#projects', 'fa-rocket', 'Projects'],
          ['#skills', 'fa-microchip', 'Skills'],
          ['#certifications', 'fa-certificate', 'Certs'],
          ['#competitions-awards', 'fa-trophy', 'Awards'],
        ].map(([href, icon, label]) => (
          <a
            key={href}
            className="group inline-flex items-center gap-[0.5em] rounded-full px-[0.9em] py-[0.45em] text-[0.8rem] text-ink-2 no-underline [transition:background_0.2s_ease,color_0.2s_ease] hover:bg-surface-2 hover:text-ink"
            href={href}
          >
            <i className={`fas ${icon} text-[0.85em] text-ink-3 group-hover:text-accent`} /> {label}
          </a>
        ))}
      </div>
    </header>
  );
}

/* --------------------------------- skills --------------------------------- */

function Skills() {
  return (
    <Section id="skills" title="SKILLS">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {SKILL_CATEGORIES.map((c) => (
          <div key={c.title} className="rounded-[18px] border border-line bg-surface px-8 py-6">
            <h3
              className={`m-0 mb-4 border-b border-line pb-3 ${mono} text-[0.7rem] font-bold tracking-[0.14em] text-ink-3 uppercase`}
            >
              {c.title}
            </h3>
            <div className="m-0 flex flex-wrap gap-2 p-0">
              {c.skills.map((sk) => (
                <SkillChip key={sk.label} skill={sk} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------- page ---------------------------------- */

const byId = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

function EntrySection({ id }: { id: string }) {
  const s = byId[id]!;
  return (
    <Section id={s.id} title={s.title} grid>
      {s.items.map((it) => (
        <EntryCard key={it.title} entry={it} span={s.id === 'education'} />
      ))}
    </Section>
  );
}

export function Resume() {
  return (
    <>
      <SkipLink />
      <TabBar active="resume.html" />

      <div className={innerScroll}>
        <main
          className="content relative z-1 mx-auto max-w-[1240px] px-[clamp(20px,4vw,48px)] pt-[52px] pb-[clamp(64px,7vw,104px)] le-900:pt-5"
          id="main-content"
          tabIndex={-1}
        >
          <Hero />
          <EntrySection id="education" />
          <EntrySection id="workexperience" />
          <EntrySection id="projects" />
          <EntrySection id="competitions-awards" />
          <Skills />
          <EntrySection id="certifications" />
          <EntrySection id="hobbies-interests" />

          <section id="contact" className={`relative ${sectionGap} print:hidden`}>
            <h2 className={h2}>GET IN TOUCH</h2>
            <div className="max-w-[640px]">
              <Island name="contact-form" component={ContactForm} props={{}} />
            </div>
          </section>

          <footer className="site-footer mt-[clamp(64px,7vw,104px)] border-t border-line pt-6 text-center text-[0.82rem] text-ink-3">
            <p className="m-0">© 2026 Alex Gaffen. All rights reserved.</p>
          </footer>
        </main>
      </div>

      {/* The label that follows the cursor over a clickable card (see client/resume.ts). */}
      <div
        aria-hidden="true"
        className={`card-hover-hint pointer-events-none fixed z-[1500] rounded-full bg-ink px-[0.8em] py-[0.4em] ${mono} text-[0.68rem] tracking-[0.04em] text-canvas opacity-0 [transform:translateY(4px)] [transition:opacity_0.18s_ease,transform_0.18s_ease] data-[visible]:opacity-100 data-[visible]:[transform:none] print:hidden`}
        id="cardHoverHint"
      />
      <Island name="mobile-nav" component={MobileNav} props={{}} />
    </>
  );
}
