export {};

declare global {
  interface Window {
    /** Set by theme.ts; also used by the terminal's `theme` command. */
    toggleSiteTheme?: () => void;
    plausible?: (event: string) => void;
  }
  interface Document {
    /** Chromium: true while the page is being prerendered for an instant tab switch. */
    readonly prerendering?: boolean;
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  }
  interface Navigator {
    readonly connection?: { saveData?: boolean; effectiveType?: string };
  }
  interface HTMLScriptElementConstructor {
    supports?: (type: string) => boolean;
  }
}
