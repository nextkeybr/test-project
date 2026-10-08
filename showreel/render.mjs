// Renders reel.html frame-by-frame with headless Chromium and pipes PNGs to ffmpeg.
//
// usage:
//   node render.mjs preview 0.3 2.5 5.1 ...      -> preview/f_<t>.png stills
//   node render.mjs video [--workers 4] [--samples 5] [--from 0] [--to 30]
//                                                -> build/video.mp4 (no audio)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// use a local install if present, else the globally installed playwright
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const FPS = 60, W = 1920, H = 1080;
const args = process.argv.slice(2);
const mode = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

async function openPage(browser, samples) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto('file://' + path.join(HERE, 'reel.html') + '?samples=' + samples);
  const ok = await page.evaluate(() => window.ready);
  if (!ok) console.warn('fonts not confirmed loaded');
  return page;
}
const shot = page => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });

async function preview(times) {
  fs.mkdirSync(path.join(HERE, 'preview'), { recursive: true });
  const browser = await chromium.launch({ args: ['--disable-gpu'] });
  const page = await openPage(browser, +opt('samples', 1));
  for (const ts of times) {
    const f = Math.round(parseFloat(ts) * FPS);
    await page.evaluate(i => window.renderFrame(i), f);
    fs.writeFileSync(path.join(HERE, 'preview', `f_${String(ts).padStart(5, '0')}.png`), await shot(page));
    process.stdout.write('.');
  }
  await browser.close();
  console.log(' done');
}

async function worker(id, f0, f1, samples, outFile) {
  const browser = await chromium.launch({ args: ['--disable-gpu'] });
  const page = await openPage(browser, samples);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', String(FPS), outFile],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate(i => window.renderFrame(i), f);
    const buf = await shot(page);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 60 === 0) console.log(`w${id} ${f - f0}/${f1 - f0}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
}

async function video() {
  const workers = +opt('workers', 4), samples = +opt('samples', 5);
  const from = Math.round(+opt('from', 0) * FPS), to = Math.round(+opt('to', 30) * FPS);
  const build = path.join(HERE, 'build');
  fs.mkdirSync(build, { recursive: true });
  const per = Math.ceil((to - from) / workers), parts = [];
  const jobs = [];
  for (let w = 0; w < workers; w++) {
    const a = from + w * per, b = Math.min(to, a + per);
    if (a >= b) break;
    const f = path.join(build, `part${w}.mp4`); parts.push(f);
    jobs.push(worker(w, a, b, samples, f));
  }
  await Promise.all(jobs);
  fs.writeFileSync(path.join(build, 'parts.txt'), parts.map(p => `file '${p}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(build, 'parts.txt'),
    '-c', 'copy', path.join(build, 'video.mp4')], { stdio: 'inherit' }).on('close', r));
  console.log('wrote build/video.mp4');
}

if (mode === 'preview') await preview(args.slice(1).filter(a => !a.startsWith('--') && !isNaN(+a)));
else if (mode === 'video') await video();
else console.log('usage: node render.mjs preview <t...> | video [--workers N] [--samples N]');
