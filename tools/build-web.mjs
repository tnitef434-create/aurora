// Builds the browser version of Aurora into web/ (hosted on Unpaused at /aurora/).
import { cpSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
const out = new URL('../web/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'game.bundle.js', 'icon.png', 'favicon.svg']) cpSync(new URL('../' + f, import.meta.url), new URL(f, out));
cpSync(new URL('../relics/', import.meta.url), new URL('relics/', out), { recursive: true });
console.log('web build:', readdirSync(out).join(', '));
