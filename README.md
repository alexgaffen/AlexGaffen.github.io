# Alex Gaffen — personal site

Source for [alexgaffen.com](https://alexgaffen.com): **React + TypeScript + Tailwind CSS**, prerendered to plain static HTML and hosted on GitHub Pages.

Every page is rendered to HTML at build time, so the content is on screen in the first frame with no JavaScript. Scripts then add behaviour: React only where there is real state (the terminal, photo gallery and lightbox, résumé widgets, blog reader), plain TypeScript everywhere else.

## Commands

```bash
npm install
npm run dev        # dev server: every page, live-reloading (same prerender as production)
npm run build      # type-check, bundle, prerender -> dist/
npm run preview    # serve dist/ locally
npm run typecheck
npm run icons      # re-subset the icon fonts after using a new fa-* / devicon-* class (needs Python + fonttools)
```

Needs Node 22.18 or newer.

## How it is put together

```
public/                  copied to the site root as-is
  assets/, photography/  images, video, self-hosted fonts (URLs are stable)
  CNAME, robots.txt, sitemap.xml, site.webmanifest
src/
  pages/                 one file per page: its <head> metadata + body (React)
    index.tsx  resume.tsx  photography.tsx  notes.tsx  note-defending-llms.tsx  game.tsx  blog.tsx
    resume/  photography/  blog/    the content and components of the bigger pages
  components/            TabBar, Document (the <html> shell), Island, shared class bundles
  console/               the AG-OS terminal (React; loaded only when used)
  client/                browser TypeScript: theme, prerender hints, blur-up, home fitter, game ...
  entries/               one tiny client entry per page
  styles/site.css        Tailwind setup, design tokens, fonts, theme-switch transitions
scripts/build.ts         client bundle -> server bundle -> prerender every page
.github/workflows/       build + deploy to Pages
```

**Common edits**

- *Résumé entries*: `src/pages/resume/data.ts`.
- *Photos*: drop files in `public/photography/` (thumb + mid + full) and add a line to `src/pages/photography/data.ts`.
- *Published notes*: add to `NOTES` in `src/pages/notes.tsx`.
- *Terminal commands*: `src/console/commands.tsx`.
- *A new page*: add `src/pages/<name>.tsx`, register it in `src/pages/index.ts` and `src/pages/entries.ts`, and add `src/entries/<name>.ts`.

## Design notes

- **Icons.** The résumé's Font Awesome and devicon icons are subset to just the glyphs used and self-hosted (`scripts/subset-icons.py` -> `src/styles/icons.css`), so the page makes no third-party requests: a few KB instead of a ~1.3 MB icon-font download.
- **Tailwind v4, no preflight.** The site was built without a CSS reset, so the browser defaults are kept; Tailwind supplies utilities only. Colours that flip with the theme are CSS variables set once per theme.
- **Theme.** `html.dark-mode` is dark, anything else is light. A tiny inline script sets it before first paint; the switch is a View Transition.
- **Instant tab switches.** Every page prefetches and prerenders the other tabs (speculation rules), so a click swaps to a page that is already built.
- **Islands.** Interactive parts are rendered into the HTML at build time, then hydrated on their own (`components/Island.tsx`, `client/hydrate.tsx`); everything around them ships no JavaScript.
- **Breakpoints.** The `le-*` variants are the inclusive `max-width` queries the site has always used (Tailwind's own `max-*` are exclusive, which would shift the layout at exactly that width).

## Bundle size: the React runtime

Pages with islands (résumé, photos, blog) load React to hydrate them: about 70 KB gzipped. Home, notes and the game run no framework at load; the terminal's files download in the background but only run when it is used.

If that cost matters, the whole site can run on Preact's React-compatible runtime (~7 KB) with no source changes -- the pages are still rendered to HTML by React at build time, and only the browser bundle is swapped:

```bash
npm i -D preact
```

```ts
// vite.config.ts: wrap the config as defineConfig(({ isSsrBuild }) => ({ ... })) and add
resolve: isSsrBuild ? {} : { alias: {
  react: 'preact/compat', 'react-dom/client': 'preact/compat/client',
  'react-dom': 'preact/compat', 'react/jsx-runtime': 'preact/jsx-runtime',
} },
```

This was tried against the same visual and behavioural comparisons as the React build and matched.

## Deploying

Pushes to `main` build and publish through `.github/workflows/deploy.yml`. In the repository's **Settings → Pages**, the source must be **GitHub Actions**.

## Contact

[LinkedIn](https://www.linkedin.com/in/alexgaffen) · [GitHub](https://github.com/alexgaffen) · alexgaffen@gmail.com

© 2026 Alex Gaffen
