import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';

/**
 * An interactive part of an otherwise static page.
 *
 * The page is rendered to HTML at build time, islands included, so the content
 * is there in the first frame with no script. The client then hydrates just
 * the island (client/hydrate.tsx); everything around it ships zero JavaScript.
 *
 * By default the wrapper is `display: contents`, so it never takes part in layout.
 */
export function Island<P extends object>({
  name,
  component: C,
  props,
  className = 'contents',
  id,
}: {
  name: string;
  component: ComponentType<P>;
  props: P;
  /** Defaults to `contents` (no box). Pass classes to make the island root a real element. */
  className?: string;
  id?: string;
}) {
  return <div data-island={name} id={id} className={className} dangerouslySetInnerHTML={{ __html: renderToString(<C {...props} />) }} />;
}
