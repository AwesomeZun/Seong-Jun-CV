// Render the built pages to MP4 through headless Chrome, frame-exact at 30 fps.
//
//   node --experimental-websocket render.mjs                          all eight → mp4/
//   node --experimental-websocket render.mjs --only ko-landscape-15   one or more, comma-separated
//   node --experimental-websocket render.mjs --stills 1,4.2,9         JPEG stills → stills/
//
// Each page exposes window.reel: frame(t) returns the canvas as a JPEG data URL, audioWav()
// mixes the sound cue sheet offline. Needs Google Chrome and ffmpeg (brew install ffmpeg).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ALL = ['ko', 'en'].flatMap(l => ['landscape', 'portrait'].flatMap(o => [15, 30].map(d => `${l}-${o}-${d}`)));
const opt = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const only = opt('--only') ? opt('--only').split(',') : ALL;
const stills = opt('--stills') ? opt('--stills').split(',').map(Number) : null;
const wait = ms => new Promise(r => setTimeout(r, ms));

const port = 9700 + Math.floor(Math.random() * 200), profile = fs.mkdtempSync('/tmp/showreel-new-');
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });

let targets = null;
for (let i = 0; i < 150 && !targets; i++){ await wait(200); try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch {} }
if (!targets) throw new Error('Chrome did not open its debugging port');
const sock = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => { sock.onopen = r; });
let seq = 0; const waiting = new Map(), pageErrors = [];
sock.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && waiting.has(m.id)){ waiting.get(m.id)(m); waiting.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') pageErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
};
const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; waiting.set(id, r); sock.send(JSON.stringify({ id, method, params })); });
async function js(expression){
  const m = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (m.result?.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description || 'evaluate failed');
  return m.result?.result?.value;
}
await cdp('Runtime.enable'); await cdp('Page.enable');

for (const name of only){
  await cdp('Page.navigate', { url: `file://${path.join(DIR, name + '.html')}?t=0` });
  for (let i = 0; i < 900; i++){ await wait(100); if (await js('!!window.reel')) break; }
  if (!(await js('!!window.reel'))) throw new Error(`${name}: page script failed — ${pageErrors.join(' | ') || 'no exception reported'}`);
  await js('reel.ready');
  let fontsOK = false;
  for (let i = 0; i < 90 && !fontsOK; i++){ fontsOK = await js('reel.load()'); if (!fontsOK) await wait(1000); }
  if (!fontsOK) console.warn(`${name}: web fonts still missing after 90 s; frames would use fallback faces`);
  await wait(300);
  const info = await js('({ W: reel.W, H: reel.H, fps: reel.fps, duration: reel.duration })');

  if (stills){
    fs.mkdirSync(path.join(DIR, 'stills'), { recursive: true });
    for (const t of stills){
      const url = await js(`reel.frame(${t}, .9)`);
      fs.writeFileSync(path.join(DIR, 'stills', `${name}_${t}.jpg`), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
    }
    console.log(`${name}  ${info.W}×${info.H}  ${stills.length} stills`);
    continue;
  }

  fs.mkdirSync(path.join(DIR, 'mp4'), { recursive: true });
  const wav = path.join(profile, name + '.wav');
  fs.writeFileSync(wav, Buffer.from(await js('reel.audioWav()'), 'base64'));
  const out = path.join(DIR, 'mp4', name + '.mp4');
  /* poster: the finished outro (slide, name, URL); saved beside the MP4 and embedded as its cover art */
  const poster = path.join(DIR, 'mp4', name + '.jpg');
  const pUrl = await js(`reel.frame(${info.duration - .25}, .92)`);
  fs.writeFileSync(poster, Buffer.from(pUrl.slice(pUrl.indexOf(',') + 1), 'base64'));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(info.fps), '-c:v', 'mjpeg', '-i', '-', '-i', wav, '-i', poster,
    '-map', '0:v', '-map', '1:a', '-map', '2:v',
    '-c:v:0', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '10M', '-bufsize', '20M', '-pix_fmt:v:0', 'yuv420p',
    '-c:v:1', 'copy', '-disposition:v:1', 'attached_pic',
    '-c:a', 'aac', '-b:a', '192k', '-af', 'alimiter=limit=0.89:level=0', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(info.duration * info.fps), started = Date.now();
  for (let i = 0; i < frames; i++){
    /* frame 0 is the poster: most players and file previews show the first frame, not the cover art,
       and the opener's first frame is blank paper */
    const url = i === 0 ? pUrl : await js(`reel.frame(${(i / info.fps).toFixed(5)}, .95)`);
    if (!ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`${name}  ${frames} frames in ${((Date.now() - started) / 1000).toFixed(0)} s → mp4/${name}.mp4`);
}

console.log('page errors:', pageErrors.length ? pageErrors : 'none');
sock.close(); chrome.kill(); await wait(800); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
