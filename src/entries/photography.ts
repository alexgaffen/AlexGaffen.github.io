import '../styles/site.css';
import { hydrateIsland } from '../client/hydrate.tsx';
import { initShell } from '../client/shell.ts';
import { Gallery } from '../pages/photography/Gallery.tsx';

initShell();
hydrateIsland('gallery', Gallery, {});
