import '../styles/site.css';
import '../styles/icons.css';
import { hydrateIsland } from '../client/hydrate.tsx';
import { initResume } from '../client/resume.ts';
import { initShell } from '../client/shell.ts';
import { ContactForm } from '../pages/resume/ContactForm.tsx';
import { HeroTerminal } from '../pages/resume/HeroTerminal.tsx';
import { MobileNav } from '../pages/resume/MobileNav.tsx';

initShell();
initResume();
hydrateIsland('hero-terminal', HeroTerminal, {});
hydrateIsland('mobile-nav', MobileNav, {});
hydrateIsland('contact-form', ContactForm, {});
