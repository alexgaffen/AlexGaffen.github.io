import { type ReactNode, useEffect, useState } from 'react';

/** The hero's decorative terminal: types a few commands, holds each answer, then starts over. */

const LINES = [
  { cmd: 'whoami', out: 'Alex Gaffen — Software Developer · AI & Cybersecurity Researcher' },
  { cmd: 'ls ~/passions', out: 'C/C++   Python   Linux   neural-nets   exploits' },
  { cmd: 'cat status.txt', out: 'Seeking AI Research & Cybersecurity roles · open to relocation' },
  { cmd: 'echo $MISSION', out: "Let's build something that actually matters." },
] as const;

const TYPE_SPEED = 55; // ms per character
const ENTER_PAUSE = 420; // pause after typing before "enter"
const HOLD = 3000; // each finished message holds 3s
const MAX_HISTORY = 3; // visible command blocks before the screen clears

const user = 'font-bold text-[#d7dae1] light:text-[#1a1206]';
const path = 'text-[#9aa0ab] light:text-[rgba(40,30,12,0.55)]';
const sign = 'mx-[0.35em] text-[#63666d] light:text-[rgba(40,30,12,0.4)]';
const cmdColor = 'text-white light:text-[#1a1206]';
const out = 'my-0 mt-[0.1em] mb-[0.9em] block text-[#878b93] light:text-[rgba(40,30,12,0.6)]';
const cursor =
  'ml-[3px] inline-block h-[1.05em] w-[7px] animate-caret bg-[#e6e8ec] align-text-bottom light:bg-[#2a2010]';
const line = 'whitespace-pre-wrap [word-break:break-word]';

const Prompt = () => (
  <>
    <span className={user}>visitor@alex</span>
    <span className={sign}>:</span>
    <span className={path}>~</span>
    <span className={sign}>$</span>{' '}
  </>
);

interface Block {
  cmd: string;
  out: string;
}

export function HeroTerminal() {
  const [history, setHistory] = useState<Block[]>([]);
  // What is being typed right now; null once the command has been "entered".
  const [typed, setTyped] = useState<string | null>('');

  useEffect(() => {
    let alive = true;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => alive && fn(), ms));
    };
    let blocks: Block[] = [];
    let idx = 0;

    const typeCmd = (cmd: string, done: () => void) => {
      let i = 0;
      const step = () => {
        setTyped(cmd.slice(0, i));
        if (i < cmd.length) {
          i++;
          later(step, TYPE_SPEED + Math.random() * 35);
        } else {
          later(done, ENTER_PAUSE);
        }
      };
      step();
    };

    const runNext = () => {
      const l = LINES[idx]!;
      typeCmd(l.cmd, () => {
        // "Enter" pressed: commit the command and its output to history.
        blocks = [...blocks, { cmd: l.cmd, out: l.out }];
        if (blocks.length > MAX_HISTORY) blocks.shift();
        setHistory(blocks);
        setTyped(null);
        later(() => {
          idx = (idx + 1) % LINES.length;
          if (idx === 0) {
            blocks = []; // fresh screen each full cycle
          }
          runNext();
        }, HOLD);
      });
    };
    runNext();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const rows: ReactNode[] = [];
  history.forEach((b, i) => {
    rows.push(
      <div key={`c${i}-${b.cmd}`} className={line}>
        <Prompt />
        <span className={cmdColor}>{b.cmd}</span>
      </div>,
      <div key={`o${i}-${b.cmd}`} className={out}>
        {b.out}
      </div>,
    );
  });
  if (typed !== null) {
    rows.push(
      <div key="typing" className={line}>
        <Prompt />
        <span className={cmdColor}>{typed}</span>
        <span className={cursor} />
      </div>,
    );
  }
  return <>{rows}</>;
}
