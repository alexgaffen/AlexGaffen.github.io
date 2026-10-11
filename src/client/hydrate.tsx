import type { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';

/** Hydrate the island the server rendered for `name` (see components/Island.tsx). */
export function hydrateIsland<P extends object>(name: string, Component: ComponentType<P>, props: P): void {
  const el = document.querySelector<HTMLElement>(`[data-island="${name}"]`);
  if (!el) throw new Error(`island "${name}" not found`);
  hydrateRoot(el, <Component {...props} />);
}
