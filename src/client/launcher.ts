/**
 * The terminal is a React app, and most visits never open it, so none of it is
 * downloaded until it is wanted: on first use, on hover/focus of the >_
 * button, or once the browser is idle after the page has loaded. This file is
 * the small always-present part -- the button, the ` key and the konami code.
 */
type ConsoleModule = typeof import('../console/index.tsx');

let loading: Promise<ConsoleModule> | null = null;
let attached = false;

/** Fetch the terminal; the first caller wires it to the button and the ` key. */
function load(): Promise<ConsoleModule> {
  loading ??= import('../console/index.tsx').then((m) => {
    if (!attached) {
      attached = true;
      m.attachConsole();
    }
    return m;
  });
  return loading;
}

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

/* ------------------------------- konami code ------------------------------- */

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function toast(msg: string): void {
  let t = document.getElementById('ag-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'ag-toast';
    t.setAttribute('role', 'status');
    t.className = [
      'fixed top-16 left-1/2 z-[10500] pointer-events-none rounded-full border border-[rgba(34,211,238,0.7)] bg-[rgba(12,12,20,0.95)] px-[22px] py-[10px]',
      'font-term text-[0.9rem] font-bold tracking-[0.06em] text-[#67e8f9] shadow-[0_10px_36px_-8px_rgba(34,211,238,0.6)]',
      'opacity-0 [transform:translate(-50%,-16px)] transition-[opacity,transform] duration-300 ease-[ease]',
      'data-[show]:opacity-100 data-[show]:[transform:translate(-50%,0)]',
    ].join(' ');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.setAttribute('data-show', '');
  clearTimeout((t as HTMLElement & { __hide?: number }).__hide);
  (t as HTMLElement & { __hide?: number }).__hide = window.setTimeout(() => t!.removeAttribute('data-show'), 2600);
}

function hyperdrive(): void {
  toast('⚡ HYPERDRIVE ENGAGED');
  window.dispatchEvent(new CustomEvent('ag:hyperdrive'));
  document.body.classList.add('animate-ag-spin', 'motion-reduce:animate-none');
  setTimeout(() => document.body.classList.remove('animate-ag-spin', 'motion-reduce:animate-none'), 1300);
}

/* --------------------------------- launcher --------------------------------- */

export function initLauncher(): void {
  const fab = document.getElementById('ag-console-fab');
  const open = () => void load().then((m) => m.openConsole());

  // Until the terminal module takes over (it adds its own listeners), these
  // handle the open gestures.
  fab?.addEventListener('click', () => {
    if (!attached) open();
  });
  document.addEventListener('keydown', (e) => {
    if (attached) return;
    if ((e.key === '`' || e.key === '~') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      open();
    }
  });

  // Warm it when the user shows intent; otherwise once the page is idle.
  fab?.addEventListener('pointerenter', () => void load(), { once: true });
  fab?.addEventListener('focus', () => void load(), { once: true });
  const warm = () => {
    // A prerendered tab must not spend bandwidth until it is actually shown.
    if (document.prerendering) return document.addEventListener('prerenderingchange', warm, { once: true });
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void load(), { timeout: 5000 });
  };
  if (document.readyState === 'complete') warm();
  else window.addEventListener('load', warm, { once: true });

  let k = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[k]) {
      k++;
      if (k === KONAMI.length) {
        k = 0;
        hyperdrive();
      }
    } else {
      k = key === KONAMI[0] ? 1 : 0;
    }
  });
}
