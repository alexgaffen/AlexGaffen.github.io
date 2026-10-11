import '../styles/site.css';
import { initGame } from '../client/game.ts';
import { initShell } from '../client/shell.ts';
import { initWorldCanvas } from '../client/world.ts';

initShell({ terminal: false });
initWorldCanvas();
initGame();
