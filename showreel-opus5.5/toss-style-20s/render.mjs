// Render the standalone pages to MP4 (H.264 + AAC), frame-exact, through headless Chrome.
//   node --experimental-websocket render.mjs                 -> mp4/<variant>.mp4 for all four
//   node --experimental-websocket render.mjs --stills 1,5.5  -> stills/<variant>_<t>.jpg
// Needs Google Chrome and ffmpeg on the PATH (brew install ffmpeg).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VARIANTS = ['ko-landscape', 'ko-portrait', 'en-landscape', 'en-portrait'];
const args = process.argv.slice(2);
const stills = args.includes('--stills') ? args[args.indexOf('--stills') + 1].split(',').map(Number) : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : VARIANTS;
const port = 9400 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync('/tmp/reel-chrome-');

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tabs; for (let i = 0; i < 120 && !tabs; i++){ await sleep(250); try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch {} }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
let id = 0; const pend = {}, errs = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) pend[m.id](m); if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const m = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (m.result?.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails)); return m.result?.result?.value; };
await send('Runtime.enable'); await send('Page.enable');

for (const v of only){
  const url = 'file://' + path.join(here, `${v}.html`) + '?t=0';
  await send('Page.navigate', { url });
  for (let i = 0; i < 100; i++){ await sleep(200); if (await ev('!!(window.reel && document.readyState === "complete")')) break; }
  await ev('reel.ready.then(() => new Promise(r => setTimeout(r, 800)))');
  const has3D = await ev('!!window.THREE');
  const { W, H, fps, duration } = await ev('({ W: reel.W, H: reel.H, fps: reel.fps, duration: reel.duration })');
  if (stills){
    fs.mkdirSync(path.join(here, 'stills'), { recursive: true });
    for (const t of stills){ const d = await ev(`reel.frame(${t}, .9)`); fs.writeFileSync(path.join(here, 'stills', `${v}_${t}.jpg`), Buffer.from(d.split(',')[1], 'base64')); }
    console.log(v, `${W}x${H}`, 'three:', has3D, 'stills:', stills.length);
    continue;
  }
  fs.mkdirSync(path.join(here, 'mp4'), { recursive: true });
  const wav = path.join(prof, `${v}.wav`);
  fs.writeFileSync(wav, Buffer.from(await ev('reel.audioWav()'), 'base64'));
  const out = path.join(here, 'mp4', `${v}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps),
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(duration * fps), t0 = Date.now();
  for (let i = 0; i < n; i++){
    const d = await ev(`reel.frame(${i / fps}, .96)`);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`\r${v} ${i}/${n} frames · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`\r${v} ${n}/${n} frames · ${((Date.now() - t0) / 1000).toFixed(0)}s → ${path.relative(here, out)}`);
}
console.log('page errors:', errs.length ? errs : 'none');
ws.close(); chrome.kill(); fs.rmSync(prof, { recursive: true, force: true }); process.exit(0);
