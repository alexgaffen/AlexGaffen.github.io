/**
 * AG-OS: the drop-down terminal on every page (press ` to toggle).
 *
 * It is a React app, loaded on demand by client/launcher.ts, and mounted into
 * its own element on <body>. The >_ button lives in the tab bar's static
 * markup; this module only wires it up.
 */
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Ascii, Bright, Cmd, Dim, Err, commands, stagedClass, type CommandContext, type StagedLine } from './commands.tsx';

/* ------------------------------ open state ------------------------------ */
/* A one-value store, so the launcher's openConsole() can reach the React tree. */

let isOpen = false;
const listeners = new Set<() => void>();
const setOpen = (v: boolean) => {
  if (isOpen === v) return;
  isOpen = v;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getOpen = () => isOpen;

/* ------------------------------- lines -------------------------------- */

interface Line {
  id: number;
  node: ReactNode;
  cls?: string;
}
type Action = { type: 'add'; lines: Line[] } | { type: 'clear' };
const reduce = (state: Line[], a: Action): Line[] => (a.type === 'clear' ? [] : [...state, ...a.lines]);

const lineBase = 'whitespace-pre-wrap [word-break:break-word] animate-ag-line-in';
const echoLine = 'mt-[6px] text-white light:text-[#1a1206]';

function bootLines(): ReactNode[] {
  const lines: ReactNode[] = [
    <Ascii>{'    _    ____'}</Ascii>,
    <Ascii>
      {'   / \\  / ___|   '}
      <Bright>alex gaffen</Bright> — portfolio shell
    </Ascii>,
    <Ascii>{'  / _ \\| |  _    mcmaster cs · ai · robotics · security'}</Ascii>,
    <Ascii>{' / ___ \\ |_| |   AG-OS v4.2 LTS (kernel 6.6.6-arch-btw)'}</Ascii>,
    <Ascii>{'/_/   \\_\\____|'}</Ascii>,
    ' ',
    <>
      Type <Cmd>help</Cmd> to list commands. <Dim>Tab = autocomplete · ↑↓ = history · Esc = close</Dim>
    </>,
    ' ',
  ];
  return lines;
}

/* ----------------------------- matrix rain ----------------------------- */

function MatrixRain({ onStop }: { onStop: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const fontSize = 16;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01<>/{}#$&*+=?';
    let cols = 0;
    let drops: number[] = [];
    let raf = 0;
    const size = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      cols = Math.floor(c.width / fontSize);
      drops = Array(cols)
        .fill(1)
        .map(() => (Math.random() * -40) | 0);
    };
    size();
    window.addEventListener('resize', size);
    const step = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0]!;
        ctx.fillStyle = Math.random() > 0.975 ? '#d8ffd8' : '#00ff41';
        ctx.fillText(ch, i * fontSize, drops[i]! * fontSize);
        if (drops[i]! * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]!++;
      }
      raf = requestAnimationFrame(step);
    };
    step();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, []);
  return createPortal(
    <canvas id="ag-matrix" ref={ref} className="fixed inset-0 z-[8800] cursor-pointer bg-[rgba(0,0,0,0.92)]" onClick={onStop} />,
    document.body,
  );
}

/* ------------------------------- terminal ------------------------------- */

let mounted: Promise<void> | null = null;
let markMounted: () => void = () => {};

function Console() {
  const open = useSyncExternalStore(subscribe, getOpen);
  const [lines, dispatch] = useReducer(reduce, []);
  const [matrixOn, setMatrixOn] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextId = useRef(0);
  const booted = useRef(false);
  const busy = useRef(false);
  const abortRun = useRef(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const timers = useRef<number[]>([]);
  const matrixRef = useRef(false);
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => markMounted(), []);

  /* ----- output ----- */
  const addLine = useCallback((node: ReactNode, cls?: string) => {
    dispatch({ type: 'add', lines: [{ id: nextId.current++, node, cls }] });
  }, []);
  const print = useCallback((nodes: ReactNode | readonly ReactNode[], cls?: string) => {
    const list = Array.isArray(nodes) ? (nodes as readonly ReactNode[]) : [nodes as ReactNode];
    dispatch({ type: 'add', lines: list.map((node) => ({ id: nextId.current++, node, cls })) });
  }, []);

  // Keep the newest line in view, like a real terminal.
  useLayoutEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [lines]);

  const printStaged = useCallback(
    (staged: readonly StagedLine[]) => {
      busy.current = true;
      abortRun.current = false;
      let i = 0;
      const next = () => {
        if (abortRun.current) {
          busy.current = false;
          addLine('^C', 'err');
          return;
        }
        if (i >= staged.length) {
          busy.current = false;
          return;
        }
        const item = staged[i++]!;
        addLine(item.node, item.cls);
        timers.current.push(window.setTimeout(next, item.delay));
      };
      next();
    },
    [addLine],
  );

  /* ----- matrix ----- */
  const matrixStop = useCallback(() => {
    if (!matrixRef.current) return;
    matrixRef.current = false;
    setMatrixOn(false);
  }, []);
  const matrixStart = useCallback(() => {
    if (matrixRef.current) return;
    matrixRef.current = true;
    setMatrixOn(true);
  }, []);

  /* ----- open / close ----- */
  const close = useCallback(() => {
    if (!openRef.current) return;
    abortRun.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    busy.current = false;
    setOpen(false);
    document.getElementById('ag-console-fab')?.focus();
  }, []);

  useEffect(() => {
    const fab = document.getElementById('ag-console-fab');
    const html = document.documentElement;
    if (open) {
      html.classList.add('ag-console-open');
      fab?.setAttribute('data-open', '');
      if (!booted.current) {
        booted.current = true;
        print(bootLines());
      }
      const t = window.setTimeout(() => inputRef.current?.focus(), 220);
      window.plausible?.('Console Opened');
      return () => clearTimeout(t);
    }
    html.classList.remove('ag-console-open');
    fab?.removeAttribute('data-open');
  }, [open, print]);

  useEffect(() => {
    const onPageHide = () => document.documentElement.classList.remove('ag-console-open');
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  /* ----- global keys + the launcher button ----- */
  useEffect(() => {
    const fab = document.getElementById('ag-console-fab');
    const onFab = () => setOpen(true);
    fab?.addEventListener('click', onFab);

    // While open, the terminal swallows every key that isn't going to its input.
    const onCapture = (e: KeyboardEvent) => {
      if (!openRef.current || e.target === inputRef.current) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === 'Escape' || e.key === '`' || e.key === '~') close();
      else inputRef.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (matrixRef.current) return matrixStop();
        if (openRef.current) return close();
      }
      if ((e.key === '`' || e.key === '~') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        const editable = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (editable && t !== inputRef.current) return;
        e.preventDefault();
        if (openRef.current) close();
        else setOpen(true);
      }
    };
    document.addEventListener('keydown', onCapture, true);
    document.addEventListener('keydown', onKey);
    return () => {
      fab?.removeEventListener('click', onFab);
      document.removeEventListener('keydown', onCapture, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [close, matrixStop]);

  /* ----- commands ----- */
  const ctx: CommandContext = {
    print,
    addLine,
    printStaged: (staged) => printStaged(staged.map((s) => ({ ...s, cls: s.cls ? (stagedClass[s.cls] ?? s.cls) : s.cls }))),
    clear: () => dispatch({ type: 'clear' }),
    close,
    get history() {
      return history.current;
    },
    matrix: {
      get on() {
        return matrixRef.current;
      },
      start: matrixStart,
      stop: matrixStop,
    },
  };

  const runCommand = (raw: string) => {
    const text = raw.trim();
    addLine(
      <>
        <span className="font-bold text-[#34d399] light:text-[#047857]">$</span> {text}
      </>,
      echoLine,
    );
    if (!text) return;
    history.current.push(text);
    histIdx.current = history.current.length;
    const parts = text.split(/\s+/);
    const name = parts[0]!.toLowerCase();
    const cmd = Object.hasOwn(commands, name) ? commands[name] : undefined;
    if (cmd) cmd.run(ctx, parts.slice(1));
    else
      addLine(
        <>
          <Err>command not found:</Err> {name} <Dim>— try 'help'</Dim>
        </>,
      );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy.current) return;
    const input = inputRef.current!;
    const v = input.value;
    input.value = '';
    runCommand(v);
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const input = inputRef.current!;
    if (e.key === 'c' && e.ctrlKey) {
      abortRun.current = true;
      return;
    }
    if (busy.current) {
      // allow typing while output animates; only swallow control keys
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
      return;
    }
    const h = history.current;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx.current > 0) {
        histIdx.current--;
        input.value = h[histIdx.current] ?? '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx.current < h.length) {
        histIdx.current++;
        input.value = h[histIdx.current] ?? '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const cur = input.value.trim().toLowerCase();
      if (!cur) return;
      const matches = Object.keys(commands).filter((k) => k.startsWith(cur));
      if (matches.length === 1) input.value = matches[0] + ' ';
      else if (matches.length > 1) addLine(<Dim>{matches.sort().join('  ')}</Dim>);
    }
  };

  const onWrapClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === wrapRef.current) close();
    else if (!busy.current && (e.target as HTMLElement).closest('[data-console-body]')) {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) inputRef.current?.focus();
    }
  };

  return (
    <>
      <div
        id="ag-console"
        ref={wrapRef}
        role="dialog"
        aria-label="Interactive terminal"
        aria-hidden={!open}
        data-open={open ? '' : undefined}
        onClick={onWrapClick}
        className={[
          'group fixed inset-0 z-[9000] flex items-start justify-center overflow-hidden pointer-events-none',
          'invisible [transition:visibility_0s_0.3s] data-[open]:visible data-[open]:pointer-events-auto data-[open]:transition-none',
          // backdrop: a blurred wash...
          "before:pointer-events-none before:fixed before:inset-0 before:z-0 before:opacity-0 before:content-[''] before:[transition:opacity_0.28s_ease]",
          'before:bg-[linear-gradient(180deg,rgba(6,8,18,0.42),rgba(6,8,18,0.62)),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_42%)]',
          'before:backdrop-blur-[7px] before:backdrop-saturate-[1.18] data-[open]:before:opacity-100',
          // ...and drifting snow
          "after:pointer-events-none after:fixed after:inset-0 after:z-[1] after:opacity-0 after:content-[''] after:[transition:opacity_0.28s_ease]",
          'after:[background-image:radial-gradient(circle,rgba(255,255,255,0.92)_0_1px,transparent_1.6px),radial-gradient(circle,rgba(103,232,249,0.65)_0_1px,transparent_1.8px),radial-gradient(circle,rgba(255,255,255,0.5)_0_0.8px,transparent_1.5px)]',
          'after:[background-size:110px_110px,150px_150px,82px_82px] after:[background-position:0_-120px,44px_-180px,20px_-90px]',
          'after:[filter:drop-shadow(0_0_5px_rgba(255,255,255,0.45))] after:animate-ag-snowfall data-[open]:after:opacity-[0.72]',
        ].join(' ')}
      >
        <div
          className={[
            'relative z-[2] flex h-[min(62vh,560px)] w-[min(860px,calc(100vw-24px))] flex-col overflow-hidden pointer-events-auto',
            'rounded-[0_0_14px_14px] border border-t-0 border-[rgba(168,85,247,0.55)] bg-[rgba(9,9,16,0.96)]',
            'shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75),0_0_42px_rgba(168,85,247,0.28)] backdrop-blur-[10px]',
            '[transform:translateY(-105%)] transition-transform duration-[280ms] ease-out-expo group-data-[open]:[transform:translateY(0)]',
            'le-800:h-[72vh] le-800:w-screen le-800:rounded-[0_0_12px_12px]',
            'light:border-[rgba(249,115,22,0.55)] light:bg-[rgba(252,239,212,0.98)]',
            'light:shadow-[0_24px_64px_-12px_rgba(60,40,10,0.35),0_0_42px_rgba(249,115,22,0.22)]',
          ].join(' ')}
        >
          <div className="flex flex-none items-center gap-[7px] border-b border-[rgba(168,85,247,0.3)] bg-[rgba(255,255,255,0.04)] px-[14px] py-[10px] light:border-b-[rgba(249,115,22,0.3)] light:bg-[rgba(0,0,0,0.035)]">
            <span className="size-[11px] rounded-full bg-[#ff5f57]" />
            <span className="size-[11px] rounded-full bg-[#febc2e]" />
            <span className="size-[11px] rounded-full bg-[#28c840]" />
            <span className="ml-2 flex-1 text-left font-term text-[0.78rem] tracking-[0.04em] text-[rgba(216,216,232,0.75)] light:text-[rgba(40,30,12,0.7)]">
              visitor@alexgaffen.com: ~
            </span>
            <button
              className="cursor-pointer rounded-[6px] border-none bg-transparent px-2 py-[2px] text-[1.25rem] leading-none text-[rgba(216,216,232,0.6)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white light:text-[rgba(40,30,12,0.55)] light:hover:bg-[rgba(0,0,0,0.06)] light:hover:text-[#1a1206]"
              type="button"
              aria-label="Close terminal"
              onClick={close}
            >
              &times;
            </button>
          </div>
          <div
            ref={bodyRef}
            data-console-body=""
            className="flex-auto overflow-y-auto overscroll-contain px-4 pt-[14px] pb-2 text-left font-term text-[0.84rem] leading-[1.65] text-[#d4d4e4] [scrollbar-color:rgba(168,85,247,0.5)_transparent] [scrollbar-width:thin] light:text-[#2a2010] light:[scrollbar-color:rgba(249,115,22,0.5)_transparent]"
          >
            {lines.map((l) => (
              <div key={l.id} className={l.cls ? `${lineBase} ${l.cls}` : lineBase}>
                {l.node}
              </div>
            ))}
          </div>
          <form
            className="flex flex-none items-center gap-[9px] border-t border-[rgba(168,85,247,0.25)] px-4 pt-[10px] pb-3 light:border-t-[rgba(249,115,22,0.25)]"
            onSubmit={onSubmit}
          >
            <span
              className="font-['Space_Mono',Consolas,monospace] text-[0.9rem] font-bold text-[#34d399] light:text-[#047857]"
              aria-hidden="true"
            >
              $
            </span>
            <input
              ref={inputRef}
              className="flex-1 border-none bg-transparent font-term text-[16px] text-white caret-[#a855f7] outline-none placeholder:text-[rgba(212,212,228,0.35)] light:text-[#1a1206] light:caret-[#f97316] light:placeholder:text-[rgba(60,48,30,0.4)]"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Terminal command input"
              placeholder="type 'help'"
              onKeyDown={onInputKey}
            />
          </form>
        </div>
      </div>
      {matrixOn && <MatrixRain onStop={matrixStop} />}
    </>
  );
}

/* ------------------------------- public API ------------------------------- */

/** Mount the terminal (closed) on <body>. Safe to call more than once. */
export function attachConsole(): void {
  if (mounted) return;
  mounted = new Promise<void>((resolve) => (markMounted = resolve));
  const host = document.createElement('div');
  document.body.appendChild(host);
  createRoot(host).render(<Console />);
}

/** Slide the terminal down. Waits for the closed terminal to have rendered, so it always animates in. */
export function openConsole(): void {
  attachConsole();
  void mounted!.then(() =>
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true))),
  );
}
