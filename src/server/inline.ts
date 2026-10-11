/**
 * Inline scripts compiled by the build (scripts/inline.ts) and handed to the
 * server render through a global, so page components can emit them in place.
 */
type Registry = Record<string, string>;
const g = globalThis as { __INLINE__?: Registry };

export function setInlineScripts(r: Registry): void {
  g.__INLINE__ = r;
}

export function inlineScript(name: string): string {
  const s = g.__INLINE__?.[name];
  if (s === undefined) throw new Error(`inline script "${name}" was not built`);
  return s;
}
