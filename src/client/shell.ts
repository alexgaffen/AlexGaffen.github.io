/**
 * Behaviour every page with the tab bar shares. Runs after first paint (the
 * module is deferred); everything that must happen before paint is in early.ts.
 */
import { initLauncher } from './launcher.ts';
import { initInstantNav } from './speculation.ts';
import { initTheme } from './theme.ts';

interface ShellOptions {
  /** The page has the >_ launcher and the hidden terminal behind it. */
  terminal?: boolean;
}

export function initShell({ terminal = true }: ShellOptions = {}): void {
  initTheme();
  initInstantNav();
  if (terminal) initLauncher();
}
