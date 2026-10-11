import type { ReactNode } from 'react';

/* ------------------------- output vocabulary ------------------------- */
/* The terminal's colours: dark mode keeps purple/cyan/green on black; light
   mode swaps in a warm, beige-friendly set. */

const NBSP = ' ';

export const Key = ({ children }: { children: ReactNode }) => (
  <span className="font-bold text-[#c084fc] light:text-[#ea580c]">{children}</span>
);
export const Cmd = ({ children }: { children: ReactNode }) => (
  <span className="font-bold text-[#34d399] light:text-[#047857]">{children}</span>
);
export const Ok = ({ children }: { children: ReactNode }) => <span className="text-[#34d399] light:text-[#047857]">{children}</span>;
export const Err = ({ children }: { children: ReactNode }) => <span className="text-[#f87171] light:text-[#dc2626]">{children}</span>;
export const Dim = ({ children }: { children: ReactNode }) => (
  <span className="text-[rgba(212,212,228,0.5)] light:text-[rgba(60,48,30,0.6)]">{children}</span>
);
export const Dir = ({ children }: { children: ReactNode }) => (
  <span className="font-bold text-[#60a5fa] light:text-[#1d4ed8]">{children}</span>
);
export const Bright = ({ children }: { children: ReactNode }) => (
  <span className="font-bold text-white light:text-[#1a1206]">{children}</span>
);
export const Ascii = ({ children }: { children: ReactNode }) => <span className="text-[#a855f7] light:text-[#f97316]">{children}</span>;
export const Swatch = () => (
  <span className="inline-block size-[0.8em] rounded-[3px] bg-[#a855f7] align-[-0.07em] light:bg-[#f97316]" />
);

/** A link inside terminal output. */
function Link({ href, children, ext }: { href: string; children: ReactNode; ext?: boolean }) {
  return (
    <a
      className="text-[length:inherit] [font-family:inherit] text-[#67e8f9] normal-case underline underline-offset-2 hover:text-[#a5f3fc] light:text-[#0e7490] light:hover:text-[#0c5c73]"
      href={href}
      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

const KV = ({ k, children }: { k: string; children?: ReactNode }) => (
  <>
    <Key>{k}</Key>
    {children}
  </>
);

/* ------------------------------ plumbing ------------------------------ */

export interface StagedLine {
  node: ReactNode;
  cls?: string;
  /** Pause after this line, ms. */
  delay: number;
}

export interface CommandContext {
  print(lines: ReactNode | readonly ReactNode[], cls?: string): void;
  addLine(node: ReactNode, cls?: string): void;
  /** Print lines one at a time; Ctrl+C cancels. */
  printStaged(lines: readonly StagedLine[]): void;
  clear(): void;
  close(): void;
  history: readonly string[];
  matrix: { on: boolean; start(): void; stop(): void };
}

export interface Command {
  desc: string;
  run(ctx: CommandContext, args: string[]): void;
}

const FAKE_FS: Record<string, ReactNode> = {
  'resume.txt': "run 'experience' or open the full page with 'resume'",
  'skills.txt': "run 'skills'",
  'flag.txt': (
    <>
      <Ok>CTF{'{'}w3lc0m3_t0_my_p0rtf0l10_h4ck3r{'}'}</Ok> — nice find. 🏴
    </>
  ),
  '.bashrc': "alias hire-alex='mailto:alexgaffen@gmail.com'  # recommended",
};

const go = (ctx: CommandContext, msg: string, to: string) => {
  ctx.addLine(msg);
  location.href = to;
};

/* ------------------------------ commands ------------------------------ */

const base: Record<string, Command> = {
  help: {
    desc: 'list all commands',
    run: ({ print }) => {
      const rows: [string, string][] = [
        ['ABOUT   ', 'whoami · neofetch · interests · education'],
        ['CAREER  ', 'experience · projects · skills · certs · awards'],
        ['LINKS   ', 'contact · social · github'],
        ['GO TO   ', 'home · resume · photos · play'],
        ['SYSTEM  ', 'ls · cat <file> · echo · date · theme · history · clear · exit'],
        ['FUN     ', 'hack · matrix · sudo · hint'],
      ];
      print(rows.map(([k, v]) => <KV k={k}>{v}</KV>));
    },
  },
  whoami: {
    desc: 'who is alex?',
    run: ({ print }) =>
      print([
        <>
          <Bright>Alex Gaffen</Bright> — Software Developer &amp; Researcher
        </>,
        '4th-year Honours Computer Science Co-op @ McMaster University',
        <>
          Into the problems without clean answers: <Ok>medical AI</Ok>, <Ok>robotics</Ok>, <Ok>systems security</Ok>.
        </>,
        'Currently: biomedical ML research @ McMaster (Wang Lab). Open to AI & cybersecurity roles.',
      ]),
  },
  neofetch: {
    desc: 'system info',
    run: ({ print }) => {
      const left = [
        '       .---.      ',
        '      /  A  \\     ',
        '     /  / \\  \\    ',
        '    /  /___\\  \\   ',
        '   /  _____G   \\  ',
        '  /__/       \\__\\ ',
        '                  ',
      ];
      const right: ReactNode[] = [
        <KV k="visitor">@alexgaffen.com</KV>,
        <Dim>─────────────────────</Dim>,
        <KV k="OS:       ">AG-OS (Arch-based, btw)</KV>,
        <KV k="Host:     ">McMaster University · Year 4</KV>,
        <KV k="Kernel:   ">honours-cs-coop 6.6.6</KV>,
        <KV k="Uptime:   ">~5 years of building software</KV>,
        <KV k="Shell:    ">python · c/c++ · bash · js</KV>,
        <KV k="Focus:    ">AI · Robotics · Cybersecurity · Medtech</KV>,
        <KV k="Research: ">Biomedical ML @ Wang Lab</KV>,
        <KV k="GPU:      ">neural nets go brrr</KV>,
        <KV k="Theme:    ">
          purple <Swatch /> #a855f7
        </KV>,
      ];
      const n = Math.max(left.length, right.length);
      print(
        Array.from({ length: n }, (_, i) => (
          <>
            <Ascii>{left[i] ?? '                  '}</Ascii>
            {right[i]}
          </>
        )),
      );
    },
  },
  experience: {
    desc: 'work history',
    run: ({ print }) =>
      print([
        <KV k="[2026–now] ">
          <Bright>AI &amp; Full-Stack Developer</Bright> — McMaster Wang Lab
        </KV>,
        <Dim>{'           end-to-end clinical AI for liver fibrosis diagnosis · React + Flask + deep learning'}</Dim>,
        <KV k="[8 months] ">
          <Bright>AI &amp; Robotics Research Engineer</Bright> — Adaptron Inc (co-op)
        </KV>,
        <KV k="[2024]     ">
          <Bright>Front-End Developer Intern</Bright> — Bonbon Technologies, LA (remote)
        </KV>,
        <Dim>{'           Svelte components for a loyalty platform · shipped on deadline'}</Dim>,
        <KV k="[2022]     ">
          <Bright>CS Tutor</Bright> — Ontario ICS3U/4U curriculum
        </KV>,
        NBSP,
        <>
          Full detail: <Link href="resume.html#workexperience">resume.html#workexperience</Link>
        </>,
      ]),
  },
  projects: {
    desc: "things i've built",
    run: ({ print }) =>
      print([
        <KV k="mock-market  ">full-stack trading sim — React · Node · C++ signals · Docker · Firebase</KV>,
        <KV k="ghost-shell  ">autonomous AI honeypot — Python LLM agent + Go terminal emulator</KV>,
        <KV k="battle-game  ">networked multiplayer game in C — raw sockets, client-server</KV>,
        <KV k="matrix-viz   ">matrix visualizer web app — Elm, team of 6</KV>,
        NBSP,
        <>
          Code:{' '}
          <Link href="https://github.com/alexgaffen" ext>
            github.com/alexgaffen
          </Link>{' '}
          · details: <Link href="resume.html#projects">resume.html#projects</Link>
        </>,
      ]),
  },
  skills: {
    desc: 'tech stack',
    run: ({ print }) =>
      print([
        <KV k="languages  ">Python · C/C++ · JavaScript · Bash · Go · Elm</KV>,
        <KV k="ai/ml      ">PyTorch · TensorFlow/Keras · scikit-learn · CNNs · transformers</KV>,
        <KV k="web        ">React · Node.js · Svelte · Flask · Firebase</KV>,
        <KV k="systems    ">Linux · Docker · Git · sockets · OS internals · compilers</KV>,
        <KV k="security   ">network security · firewalls/VPNs · applied cryptography · honeypots</KV>,
      ]),
  },
  certs: {
    desc: 'certifications',
    run: ({ print }) =>
      print([
        '• Deep Learning Specialization — DeepLearning.AI (Andrew Ng, 5 courses)',
        '• PyTorch for Deep Learning — DeepLearning.AI',
        '• Machine Learning A-Z — Udemy',
      ]),
  },
  awards: {
    desc: 'awards',
    run: ({ print }) =>
      print([
        '🏆 McMaster Award of Excellence — entrance scholarship',
        '🥇 Euclid Mathematics Contest — 1st in school (Waterloo)',
        '🥇 Canadian Senior Mathematics Contest — 1st in school',
      ]),
  },
  education: {
    desc: 'education',
    run: ({ print }) =>
      print([
        <>
          <Bright>Honours Computer Science Co-op (B.A.Sc.)</Bright> — McMaster University, 2022–present
        </>,
        <Dim>A+ in compilers &amp; algorithms · applied cryptography · OS · networks &amp; security</Dim>,
      ]),
  },
  interests: {
    desc: 'beyond the keyboard',
    run: ({ print }) =>
      print([
        '🎻 violinist — McMaster Symphony Orchestra',
        <>
          📷 photography — <Link href="photography.html">see the gallery</Link>
        </>,
        '⚽ intramural soccer · pickleball · football',
        '🏋️ gym, running, and picking up new things to see if I can',
      ]),
  },
  contact: {
    desc: 'get in touch',
    run: ({ print }) =>
      print([
        <KV k="email    ">
          <Link href="mailto:alexgaffen@gmail.com">alexgaffen@gmail.com</Link>
        </KV>,
        <KV k="form     ">
          <Link href="resume.html#contact">resume.html#contact</Link>
        </KV>,
        <Dim>response time: faster than my CI pipeline</Dim>,
      ]),
  },
  social: {
    desc: 'profiles',
    run: ({ print }) =>
      print([
        <KV k="github     ">
          <Link href="https://github.com/alexgaffen" ext>
            github.com/alexgaffen
          </Link>
        </KV>,
        <KV k="linkedin   ">
          <Link href="https://www.linkedin.com/in/alexgaffen/" ext>
            linkedin.com/in/alexgaffen
          </Link>
        </KV>,
      ]),
  },
  github: {
    desc: 'live github stats',
    run: ({ addLine, print }) => {
      addLine(<Dim>querying api.github.com…</Dim>);
      fetch('https://api.github.com/users/alexgaffen')
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<{ login: string; name?: string; public_repos: number; followers: number; created_at: string; html_url: string }>;
        })
        .then((d) =>
          print([
            <KV k="user        ">
              {d.login}
              {d.name ? ` (${d.name})` : ''}
            </KV>,
            <KV k="public repos">{String(d.public_repos)}</KV>,
            <KV k="followers   ">{String(d.followers)}</KV>,
            <KV k="member since">{new Date(d.created_at).getFullYear().toString()}</KV>,
            <KV k="profile     ">
              <Link href={d.html_url} ext>
                {d.html_url}
              </Link>
            </KV>,
          ]),
        )
        .catch(() =>
          print(
            <>
              <Err>api unreachable</Err> — visit{' '}
              <Link href="https://github.com/alexgaffen" ext>
                github.com/alexgaffen
              </Link>
            </>,
          ),
        );
    },
  },
  home: { desc: 'go home', run: (ctx) => go(ctx, 'cd ~ …', 'index.html') },
  resume: { desc: 'open resume', run: (ctx) => go(ctx, 'opening resume…', 'resume.html') },
  photos: { desc: 'open gallery', run: (ctx) => go(ctx, 'opening gallery…', 'photography.html') },
  play: { desc: 'secret game', run: (ctx) => go(ctx, 'loading game…', 'game.html') },
  theme: {
    desc: 'toggle light/dark',
    run: ({ addLine }) => {
      if (window.toggleSiteTheme) {
        window.toggleSiteTheme();
        addLine('theme toggled.');
      } else addLine(<Err>theme controller not found</Err>);
    },
  },
  matrix: {
    desc: 'there is no spoon',
    run: ({ matrix, addLine }) => {
      if (matrix.on) {
        matrix.stop();
        addLine('matrix disengaged.');
      } else {
        matrix.start();
        addLine(
          <>
            wake up, neo… <Dim>(click anywhere or run 'matrix' again to exit)</Dim>
          </>,
        );
      }
    },
  },
  hack: {
    desc: '???',
    run: ({ printStaged }) =>
      printStaged([
        { node: 'initializing exploit framework v6.6.6 …', cls: 'dim', delay: 420 },
        { node: '[*] scanning alexgaffen.com (443/tcp) …', delay: 600 },
        { node: '[*] enumerating attack surface … 0 open ports. suspicious.', delay: 650 },
        { node: '[*] attempting SQLi on a static site …', delay: 700 },
        { node: "[!] that's not how any of this works", cls: 'err', delay: 550 },
        { node: '[*] deploying zero-day …', delay: 800 },
        {
          node: <Err>█ ACCESS DENIED █</Err>,
          delay: 500,
        },
        {
          node: (
            <>
              <Ok>ghost-shell</Ok> already logged this session: your IP, keystrokes, and your favourite snack. 👻
            </>
          ),
          delay: 80,
        },
        { node: <Dim>(it's one of my projects — run 'projects')</Dim>, delay: 0 },
      ]),
  },
  sudo: {
    desc: 'permission games',
    run: ({ print }, args) => {
      const rest = args.join(' ');
      if (/make me a sandwich/i.test(rest)) return print('Okay. 🥪');
      if (/rm\s+-rf/i.test(rest))
        return print([
          <>
            <Err>nice try.</Err> this incident will be reported to Santa.
          </>,
        ]);
      print(
        <>
          visitor is not in the sudoers file. <Dim>this incident will be reported.</Dim>
        </>,
      );
    },
  },
  ls: {
    desc: 'list files',
    run: ({ print }) =>
      print(
        <>
          <Ok>resume.txt</Ok>
          {'  '}
          <Ok>skills.txt</Ok>
          {'  '}
          <Ok>flag.txt</Ok>
          {'  '}
          <Ok>.bashrc</Ok>
          {'  '}
          <Err>secrets.txt</Err>
          {'  '}
          <Dir>photos/</Dir>
          {'  '}
          <Dir>projects/</Dir>
        </>,
      ),
  },
  cat: {
    desc: 'read a file',
    run: ({ print }, args) => {
      const f = (args[0] ?? '').trim();
      if (!f) return print('usage: cat <file>');
      if (f === 'secrets.txt')
        return print(
          <>
            <Err>cat: secrets.txt: Permission denied</Err> <Dim>(try 'hack'… or don't)</Dim>
          </>,
        );
      if (f in FAKE_FS) return print(FAKE_FS[f]);
      print(<Err>cat: {f}: No such file or directory</Err>);
    },
  },
  echo: { desc: 'echo', run: ({ print }, args) => print(args.join(' ') || NBSP) },
  date: { desc: 'date', run: ({ print }) => print(new Date().toString()) },
  history: {
    desc: 'command history',
    run: ({ print, history }) =>
      print(
        history.map((h, i) => (
          <>
            <Dim>{i + 1}</Dim>
            {'  '}
            {h}
          </>
        )),
      ),
  },
  hint: {
    desc: 'psst',
    run: ({ print }) =>
      print([
        "• there's a flag hiding in the filesystem",
        '• ↑ ↑ ↓ ↓ ← → ← → B A — works anywhere on the site',
        '• clicking empty space on the home page fires neurons',
      ]),
  },
  clear: { desc: 'clear screen', run: ({ clear }) => clear() },
  exit: { desc: 'close terminal', run: ({ close }) => close() },
};

/** Every command plus its aliases, keyed by the word the visitor types. */
export const commands: Record<string, Command> = {
  ...base,
  exp: base.experience!,
  work: base.experience!,
  proj: base.projects!,
  edu: base.education!,
  certifications: base.certs!,
  about: base.whoami!,
  game: base.play!,
  photography: base.photos!,
  cls: base.clear!,
  quit: base.exit!,
};

/** Terminal line class for staged output ('dim' / 'err'). */
export const stagedClass: Record<string, string> = {
  dim: 'text-[rgba(212,212,228,0.5)] light:text-[rgba(60,48,30,0.6)]',
  err: 'text-[#f87171] light:text-[#dc2626]',
};
