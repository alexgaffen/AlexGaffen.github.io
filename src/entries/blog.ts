import '../styles/site.css';
import { hydrateIsland } from '../client/hydrate.tsx';
import { initShell } from '../client/shell.ts';
import { Blog } from '../pages/blog/Blog.tsx';

initShell({ terminal: false });
hydrateIsland('blog', Blog, {});
