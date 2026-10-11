import { TabBar } from '../components/TabBar.tsx';
import type { PageDef } from './types.ts';

/* A tiny flappy-egg game, linked from the terminal (`play`), not the tab bar. */

const pixel = "font-['Press_Start_2P',monospace]";

// The page paints on <html> as well as <body>: both are full-size, centred flex
// columns that never scroll.
const frame = [
  "m-0 p-0 w-full h-full overflow-hidden touch-none flex flex-col items-center justify-center bg-(--bg-color) text-(--text-color) font-['Space_Mono',Courier,monospace]",
].join(' ');

const bodyClass = [
  'has-site-tabs game-page',
  frame,
  'pt-[72px]',
  '[--bg-color:#fcefd4] [--text-color:#0f0f0f] dark:[--bg-color:#000000] dark:[--text-color:#f0f1f4]',
  '[--site-world-a:rgba(255,210,105,0.2)] [--site-world-b:rgba(255,120,120,0.2)] [--site-world-c:rgba(255,255,255,0.12)]',
  // a soft three-colour wash over the whole viewport, under the game
  "after:pointer-events-none after:fixed after:inset-0 after:z-0 after:content-[''] after:opacity-(--site-world-overlay-opacity,0.95)",
  'after:[background:radial-gradient(circle_at_16%_18%,var(--site-world-a,rgba(90,197,255,0.16)),transparent_30%),radial-gradient(circle_at_84%_24%,var(--site-world-b,rgba(255,143,92,0.12)),transparent_28%),radial-gradient(circle_at_50%_82%,var(--site-world-c,rgba(255,255,255,0.08)),transparent_34%)]',
  // every <canvas> on the page -- the game's and the backdrop's -- gets the
  // chunky bordered frame
  '[&_canvas]:block [&_canvas]:max-h-[85vh] [&_canvas]:max-w-[95vw] [&_canvas]:border-4 [&_canvas]:border-(--text-color) [&_canvas]:bg-white',
  '[&_canvas]:shadow-[6px_6px_0_var(--text-color)] [&_canvas]:[background-image:radial-gradient(circle_at_50%_50%,#fdfdfd_0%,#e0e0e0_100%)]',
  'dark:[&_canvas]:bg-black!',
].join(' ');

function Body() {
  return (
    <>
      <TabBar terminal={false} />

      <div
        id="ui-layer"
        className={`pointer-events-none absolute top-[70px] right-5 z-90 text-right text-[1.2rem] le-760:top-16 dark:bg-black! ${pixel}`}
      >
        SCORE: <span id="scoreEl">0</span>
      </div>
      <div
        id="instructions"
        className="pointer-events-none absolute bottom-10 left-1/2 text-center text-[0.9rem] opacity-80 [transform:translateX(-50%)]"
      >
        TAP, CLICK, OR SPACE TO BOOST
      </div>

      <canvas id="game" />

      <div
        id="gameover"
        className={`absolute top-1/2 left-1/2 z-200 hidden border-4 border-(--text-color) bg-(--bg-color) p-[30px] text-center shadow-[5px_5px_0_var(--text-color)] [transform:translate(-50%,-50%)] ${pixel}`}
      >
        <h2 className="mt-0 text-[1.5rem] text-[#d62020]">CRASHED!</h2>
        <p style={{ fontFamily: "'Space Mono'", fontSize: '1.2rem' }}>
          Score: <span id="finalScore" />
        </p>
        <button
          className={`restart-btn mt-5 cursor-pointer border-2 border-(--text-color) bg-white px-5 py-[10px] shadow-[2px_2px_0_var(--text-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_var(--text-color)] dark:bg-black! ${pixel}`}
          type="button"
        >
          PLAY AGAIN
        </button>
      </div>
    </>
  );
}

export const game: PageDef = {
  file: 'game',
  title: 'Alex Gaffen',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  fonts: ['inter-latin-wght-normal.woff2', 'press-start-2p-latin-400-normal.woff2', 'space-mono-latin-400-normal.woff2'],
  htmlClassName: frame + ' [--bg-color:#fcefd4] [--text-color:#0f0f0f]',
  bodyClassName: bodyClass,
  analytics: false,
  reveal: false,
  head: { fullIcons: false },
  Body,
};
