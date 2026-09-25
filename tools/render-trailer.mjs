// Renders the launch trailer (trailer/) to MP4: bundles the scene, steps it frame by frame in headless Chromium,
// renders the soundtrack offline, then encodes with ffmpeg.
//   node tools/render-trailer.mjs                 full render → trailer/out/
//   node tools/render-trailer.mjs --stills 3,12.6  just a few preview frames
// Needs playwright (npm i -g playwright) and ffmpeg on PATH or in $FFMPEG.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'trailer');
const out = path.join(root, 'out');
const FPS = 30;
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

await build({ entryPoints: [path.join(root, 'trailer.js')], bundle: true, format: 'esm', minify: true, target: 'es2022',
  loader: { '.glb': 'binary' }, outfile: path.join(root, 'trailer.bundle.js'), logLevel: 'warning' });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    let f = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (f.endsWith(path.sep)) f += 'index.html';
    const body = await readFile(f);
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(body);
  }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(import.meta.url)(path.join(process.execPath, '../../lib/node_modules/playwright'))); }
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', e => console.error('[page]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.trailerReady === true, null, { timeout: 180000 });
const shot = async (t, file) => { await page.evaluate(t => window.renderAt(t), t); await page.screenshot({ path: file, type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 1920, height: 1080 } }); };

await mkdir(out, { recursive: true });
if (opt('--stills')) {
  for (const t of opt('--stills').split(',').map(Number)) { await shot(t, path.join(out, `still-${t}.jpg`)); console.log('still', t); }
} else {
  const { DURATION } = await page.evaluate(() => window.TRAILER);
  const wav = await page.evaluate(() => window.renderSoundtrack());
  await writeFile(path.join(out, 'soundtrack.wav'), Buffer.from(wav, 'base64'));
  const frames = path.join(out, 'frames');
  const from = Number(opt('--from') || 0);
  if (!from) { await rm(frames, { recursive: true, force: true }); }
  await mkdir(frames, { recursive: true });
  const N = Math.ceil(DURATION * FPS), t0 = Date.now();
  for (let i = from; i < N; i++) {
    await shot(i / FPS, path.join(frames, `${String(i).padStart(5, '0')}.jpg`));
    if (i % 30 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  const enc = (file, extra) => {
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg'), '-i', path.join(out, 'soundtrack.wav'),
      ...extra, '-c:v', 'libx264', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(out, file)], { stdio: 'inherit' });
    if (r.status) throw new Error('ffmpeg failed for ' + file);
  };
  enc('aurora-trailer-1080p.mp4', ['-crf', '18', '-profile:v', 'high']);
  enc('aurora-trailer-720p.mp4', ['-vf', 'scale=1280:720:flags=lanczos', '-crf', '24', '-profile:v', 'high']);
  const poster = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '30.4', '-i', path.join(out, 'aurora-trailer-1080p.mp4'), '-frames:v', '1', '-vf', 'scale=1280:720', '-q:v', '3', path.join(out, 'aurora-trailer-poster.jpg')], { stdio: 'inherit' });
  console.log('done', poster.status === 0 ? '' : '(poster failed)');
}
await browser.close(); server.close();
