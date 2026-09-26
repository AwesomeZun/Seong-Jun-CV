(() => {
/* =====================================================================================
   STAINED — a showreel printed like a two-ink risograph of an H&E slide.
   Hematoxylin violet and eosin pink overprint (multiply) on paper; every image is a
   halftone; the two ink plates drift out of register and slam back in on the beat.
   One source builds eight cuts: 15 s / 30 s × Korean / English × landscape / portrait.
   ===================================================================================== */
const CFG = Object.assign({ lang: 'ko', orient: 'landscape', dur: 15 }, window.REEL_CFG || {});
const Q = new URLSearchParams(location.search);
for (const k of ['lang', 'orient']) if (Q.get(k)) CFG[k] = Q.get(k);
if (Q.get('dur')) CFG.dur = +Q.get('dur');
const EN = CFG.lang === 'en', PORT = CFG.orient === 'portrait', LONG = CFG.dur === 30;
const W = PORT ? 1080 : 1920, H = PORT ? 1920 : 1080, DUR = LONG ? 30 : 15, TAU = Math.PI * 2;
const B = 60 / 128;                         // one beat at 128 BPM; 15 s = 32 beats, 30 s = 64
const M = PORT ? 72 : 96;                   // outer margin
const CELL = PORT ? 13 : 15;                // halftone pitch in px

const cv = document.getElementById('cv');
cv.width = W; cv.height = H; cv.style.aspectRatio = `${W} / ${H}`;
const ctx = cv.getContext('2d');

/* ---------- inks & type ---------- */
const PAPER = '#EFEDEE', PINK = '#FF4F8B', VIO = '#3A2F9E', DEEP = '#221A5E';
const F = {
  kr: '"Gasoek One","IBM Plex Sans KR",sans-serif',
  en: '"Bricolage Grotesque","IBM Plex Sans KR",sans-serif',
  body: '"IBM Plex Sans KR","Bricolage Grotesque",sans-serif',
  mono: '"DM Mono",ui-monospace,Menlo,monospace'
};
const DISP = EN ? F.en : F.kr, DW = EN ? 800 : 400;

/* ---------- copy (all from kangseongjun.com) ---------- */
const T = EN ? {
  tag: 'COMPUTATIONAL IMMUNOLOGIST · Ph.D.', alt: '강성준',
  thesis: ['IMMUNOLOGY', '×', 'SINGLE-CELL', '& SPATIAL DATA'], thesisSub: 'PRIMARY-CELL ASSAYS → MULTIMODAL MODELS',
  stats: [['18', 'papers', '17 PEER-REVIEWED · 1 IN REVISION'], ['6', 'first / co-first', 'INCL. NATURE IMMUNOLOGY'],
          ['700+', 'donor atlas', 'SCAID · 8 ORGANS · MULTI-SITE QC'], ['$1.3M', 'industry awards', 'KDDF · MSS · NAVER · PROPOSAL LEAD']],
  stamp: 'CO-FIRST AUTHOR · IN REVISION',
  career: [['2008', 'Sungkyunkwan Univ.', 'B.S. GENETIC ENGINEERING'], ['2014', 'Seoul National Univ.', 'M.S. BIOMEDICAL SCIENCES'],
           ['2016', 'SNU Transplantation Inst.', 'RESEARCH PERSONNEL · NHP'], ['2021', 'PB Immune Therapeutics', 'MANAGER → ASSOC. DIRECTOR'],
           ['2023', 'Seoul National Univ.', 'Ph.D. BIOMEDICAL SCIENCES'], ['2025', 'Yonsei Wonju Medicine', 'POSTDOCTORAL RESEARCHER'],
           ['2026', 'Boston, MA', 'NEXT CHAPTER']],
  outroTag: 'Computational immunologist · single-cell & spatial multi-omics · Boston',
  ab: ['ANTI-CD40', 'ANTIBODY PROGRAM'],
  abSteps: ['SPR affinity ranking', 'Receptor blocking', 'Human / NHP cross-reactivity', 'In vivo efficacy in primates', 'Patent registered, 2024'],
  abFoot: 'PB IMMUNE THERAPEUTICS · 2021–2025 · KDDF-FUNDED',
  book: ['AI DRUG', 'DISCOVERY'], bookRole: 'CO-AUTHOR', bookMeta: 'Beommun Education · Sept 2026 · 548 pages',
  bookChips: ['QSAR', 'ChemBERTa', 'GNN', 'Docking', 'Virtual screening'],
  award: 'GRAND PRIZE', awardStamps: [['2024', 'GPTers AI Hackathon'], ['2023', 'SBA Smart Workathon']],
  awardFoot: '+ BEST POSTER IN CONGRESS · AMERICAN TRANSPLANT CONGRESS 2017'
} : {
  tag: '계산 면역학자 · Ph.D.', alt: 'SEONG-JUN KANG',
  thesis: ['실험 면역학', '×', '단일세포·공간', '데이터 분석'], thesisSub: '일차 세포 실험 → 다중모달 모델',
  stats: [['18', '편의 논문', '동료심사 17 · 수정 중 1'], ['6', '제1·공동 제1저자', 'NATURE IMMUNOLOGY 포함'],
          ['700+', '명 공여자 아틀라스', 'SCAID · 8개 장기 · 다기관 QC'], ['$1.3M', '산업 과제 기획·수행', 'KDDF · 중기부 · NAVER']],
  stamp: '공동 제1저자 · 수정 중',
  career: [['2008', '성균관대학교', '유전공학 학사'], ['2014', '서울대학교', '의과학 석사'], ['2016', '서울대 이식연구소', '전문연구요원 · 영장류 연구'],
           ['2021', 'PB Immune Therapeutics', '매니저 → 부이사'], ['2023', '서울대학교', '의과학 박사'], ['2025', '연세대 원주의과대학', '박사후연구원'],
           ['2026', 'Boston, MA', '다음 챕터']],
  outroTag: '계산 면역학자 · 단일세포·공간 멀티오믹스 · 보스턴',
  ab: ['항-CD40', '항체 프로그램'],
  abSteps: ['SPR 친화도 순위 선별', '수용체 차단 확인', '인간·영장류 교차반응', '영장류 생체 내 효능', '특허 등록 (2024)'],
  abFoot: 'PB IMMUNE THERAPEUTICS · 2021–2025 · KDDF 지원',
  book: ['AI 신약개발', '실무서 공저'], bookRole: 'CO-AUTHOR', bookMeta: '범문에듀케이션 · 2026년 9월 · 548쪽',
  bookChips: ['QSAR', 'ChemBERTa', 'GNN', '도킹', '가상 스크리닝'],
  award: '대상', awardStamps: [['2024', 'GPTers AI 해커톤'], ['2023', 'SBA 스마트 워커톤']],
  awardFoot: '+ 2017 미국이식학회(ATC) 베스트 포스터 · 시카고'
};
const WORDS = [
  ['GeoMx DSP', 'SPATIAL PROFILING', '공간 프로파일링'], ['Visium', 'SPATIAL TRANSCRIPTOMICS', '공간 전사체'],
  ['10x Chromium', 'SINGLE-CELL', '단일세포 라이브러리'], ['MACSima', 'CYCLIC MULTIPLEX IF', '다중 면역형광'],
  ['Flow cytometry', 'UP TO 24 MARKERS', '최대 24개 마커'], ['Biacore SPR', 'BINDING KINETICS', '결합 동역학'],
  ['Olink', 'PLASMA PROTEOMICS', '혈장 단백체'], ['Seurat', 'SINGLE-CELL ANALYSIS', '단일세포 분석'],
  ['Scanpy', 'SINGLE-CELL ANALYSIS', '단일세포 분석'],
  ...(LONG ? [['CellChat', 'CELL–CELL SIGNALING', '세포 간 신호'], ['Milo', 'DIFFERENTIAL ABUNDANCE', '차등 풍부도']] : []),
  ['scVI', 'DEEP GENERATIVE MODEL', '심층 생성 모델'], ['cNMF', 'CONSENSUS NMF', '합의 행렬분해'],
  ...(LONG ? [['InferCNV', 'COPY-NUMBER INFERENCE', '복제수 추론'], ['XGBoost', 'HELD-OUT CLASSIFIERS', '독립 검증 분류기']] : []),
  ['PyTorch', 'MULTIMODAL DEEP LEARNING', '다중모달 딥러닝']
];
const JROWS = ['Allergy  ✱  eBioMedicine  ✱  JEADV  ✱  ', 'Xenotransplantation  ✱  Islets  ✱  ', 'J. Neuroimmunology  ✱  Sci. Reports  ✱  ',
  'Exp. & Mol. Medicine  ✱  Transplantation  ✱  ', 'Immunology Letters  ✱  BBRC  ✱  ', 'Current Diabetes Reports  ✱  '];

/* ---------- math ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sstep = (a, b, x) => { const t = inv(a, b, x); return t * t * (3 - 2 * t); };
const eOut3 = t => 1 - Math.pow(1 - t, 3), eOut5 = t => 1 - Math.pow(1 - t, 5), eIn3 = t => t * t * t;
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const spring = p => p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.exp(-6 * p) * Math.cos(11 * p);
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry(1289);
const PERM = new Uint8Array(512);
{ const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; }
function vnoise(x, y){
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h = (i, j) => PERM[(PERM[(xi + i) & 255] + yi + j) & 255] / 255;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h(0, 0), h(1, 0), u), lerp(h(0, 1), h(1, 1), u), v);
}
/* blobby, nucleus-like tissue density */
const tissue = (x, y, t) => vnoise(x * .011 + t * .12, y * .011) * .62 + vnoise(x * .034 - t * .1, y * .034 + 7) * .38;

/* ---------- print primitives ---------- */
function halftone(sample, color, angle, cell = CELL, maxR = .64, comp = 'multiply', alpha = 1){
  const ca = Math.cos(angle), sa = Math.sin(angle), R = Math.hypot(W, H) / 2 + cell, cx = W / 2, cy = H / 2;
  ctx.save(); ctx.globalCompositeOperation = comp; ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
  for (let v = -R; v <= R; v += cell) for (let u = -R; u <= R; u += cell){
    const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
    if (x < -cell || y < -cell || x > W + cell || y > H + cell) continue;
    const f = sample(x, y); if (f <= .03) continue;
    const r = cell * maxR * Math.sqrt(Math.min(1.25, f));
    ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
  }
  ctx.fill(); ctx.restore();
}
/* draw into a quarter-resolution alpha mask and read it back as a sampler */
const MS = 4, mk = document.createElement('canvas'); mk.width = Math.ceil(W / MS); mk.height = Math.ceil(H / MS);
const mx = mk.getContext('2d', { willReadFrequently: true });
function mask(draw){
  mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, mk.width, mk.height);
  mx.setTransform(1 / MS, 0, 0, 1 / MS, 0, 0); mx.fillStyle = '#000'; mx.strokeStyle = '#000';
  draw(mx);
  const d = mx.getImageData(0, 0, mk.width, mk.height).data, w = mk.width, h = mk.height;
  return (x, y) => { const i = Math.floor(x / MS), j = Math.floor(y / MS); return i < 0 || j < 0 || i >= w || j >= h ? 0 : d[(j * w + i) * 4 + 3] / 255; };
}
function ink(color, fn, comp = 'multiply', alpha = 1){ ctx.save(); ctx.globalCompositeOperation = comp; ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.strokeStyle = color; fn(ctx); ctx.restore(); }
function fit(fam, w, text, maxW, maxS){ ctx.font = `${w} ${maxS}px ${fam}`; const m = ctx.measureText(text).width; return m > maxW ? Math.floor(maxS * maxW / m) : maxS; }
function setF(c, fam, w, s, ls = 0){ c.font = `${w} ${s}px ${fam}`; if ('letterSpacing' in c) c.letterSpacing = `${ls}px`; }
function mono(text, x, y, size, color, align = 'left', ls = 3, alpha = 1){
  ctx.save(); ctx.globalAlpha = alpha; setF(ctx, F.mono, 500, size, ls); ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y); ctx.restore();
}
/* registration: 1 while the plates are apart, springing to 0 at the snap */
const apart = (lt, snap, d = .42) => 1 - spring(inv(snap, snap + d, lt));
function typeOn(text, p){ return text.slice(0, Math.round(text.length * clamp(p))); }
function stampBox(cx, cy, w, h, rot, sc, color, lines, a = 1){
  if (sc <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
  ctx.fillStyle = color; ctx.textAlign = 'center';
  lines.forEach(([txt, fam, wt, sz, dy]) => { setF(ctx, fam, wt, Math.min(sz, fit(fam, wt, txt, w - 70, sz)), fam === F.mono ? 3 : 0); ctx.fillText(txt, 0, dy); });
  ctx.restore();
}

/* ---------- name block, shared by the open and the outro ---------- */
let NAME = null;
function nameLayout(){
  if (EN){ const s = fit(F.en, 800, 'SEONG-JUN', W - 2 * M, PORT ? 290 : 300); NAME = { s, lines: [['SEONG-JUN', -s * .44], ['KANG', s * .5]] }; }
  else { const s = fit(F.kr, 400, '강성준', W * (PORT ? .86 : .66), PORT ? 360 : 400); NAME = { s, lines: [['강성준', 0]] }; }
}
function drawName(c, cx, cy, scale, color){
  if (!NAME) nameLayout();
  c.save(); c.translate(cx, cy); c.scale(scale, scale); c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
  setF(c, DISP, DW, NAME.s, EN ? -NAME.s * .02 : 0);
  NAME.lines.forEach(([t, dy]) => c.fillText(t, 0, dy)); c.restore();
}
function nameSlam(lt, cx, cy, sizeK, t0, snap){
  const sp = inv(t0, t0 + .12, lt); if (sp <= 0) return;
  const s = lerp(1.35, 1, eOut5(sp)) * sizeK, a = apart(lt, snap), jit = lt < snap ? Math.sin(lt * 70) * 5 : 0;
  const dx = (PORT ? 26 : 38) * a + jit, dy = -(PORT ? 18 : 24) * a;
  ink(PINK, c => drawName(c, cx + dx, cy + dy, s, PINK));
  ink(VIO, c => drawName(c, cx, cy, s, VIO));
}

/* =================================================================== SCENES
   each: bg(lt, d) → paper colour behind it, draw(lt, d), cues(d) → sound events (scene-local s) */
const S = {};

S.open = {
  bg: () => PAPER,
  draw(lt, d){
    const R0 = eOut3(inv(0, B * 1.3, lt)) * Math.hypot(W, H) * .6, fadeT = 1 - .6 * inv(B, 2.2 * B, lt), cy = H * (PORT ? .45 : .46);
    halftone((x, y) => clamp((R0 - Math.hypot(x - W / 2, y - cy)) / 160) * sstep(.42, .78, tissue(x, y, lt)) * fadeT, PINK, .26);
    halftone((x, y) => clamp((R0 * .8 - Math.hypot(x - W / 2, y - cy)) / 160) * sstep(.6, .85, tissue(x + 90, y - 40, lt)) * fadeT * .8, VIO, .79);
    nameSlam(lt, W / 2, cy, 1, B, 2 * B);
    const nh = EN ? NAME.s * 1.05 : NAME.s * .58;
    if (lt > 2 * B){
      mono(typeOn(T.alt, inv(2 * B, 2 * B + .35, lt)), W / 2, cy - nh - (PORT ? 44 : 50), PORT ? 26 : 28, PINK, 'center', 10);
      ctx.save(); setF(ctx, F.body, 700, PORT ? 38 : 44, 5); ctx.fillStyle = VIO; ctx.textAlign = 'center';
      ctx.fillText(typeOn(T.tag, inv(2 * B + .05, 2 * B + .55, lt)), W / 2, cy + nh + (PORT ? 86 : 96)); ctx.restore();
    }
  },
  cues: d => [[0, 'drone', 2 * B], [0, 'riser', B], [B, 'stamp', .8], [2 * B, 'stamp', 1.1], ...[...Array(8)].map((_, k) => [2 * B + .06 + k * .06, 'tick'])]
};

S.thesis = {
  bg: () => VIO,
  draw(lt, d){
    halftone((x, y) => sstep(.5, .82, tissue(x + lt * 60, y, lt)) * .85, PINK, .26, CELL, .6, 'source-over', .5);
    const L = T.thesis, maxS = PORT ? 176 : 196;
    const sizes = L.map(t => t === '×' ? maxS * .9 : fit(DISP, DW, t, W - 2 * M, maxS));
    const gap = PORT ? 26 : 18, tot = sizes.reduce((a, s) => a + s * .92 + gap, -gap);
    let y = H / 2 - tot / 2 + (PORT ? 0 : 10);
    const snap = apart(lt, 2.4 * B);
    L.forEach((t, k) => {
      const s = sizes[k], t0 = .04 + k * B * .45, p = eOut5(inv(t0, t0 + .32, lt)), dir = k % 2 ? 1 : -1;
      const cy = y + s * .46; y += s * .92 + gap;
      if (p <= 0) return;
      if (t === '×'){
        ctx.save(); ctx.translate(W / 2, cy); ctx.rotate(Math.PI / 4 + (1 - p) * Math.PI + lt * .5); ctx.scale(p, p);
        ctx.fillStyle = PINK; const L2 = s * .78, th = s * .17; ctx.fillRect(-L2 / 2, -th / 2, L2, th); ctx.fillRect(-th / 2, -L2 / 2, th, L2); ctx.restore();
        return;
      }
      const x = W / 2 + dir * (1 - p) * W * .7 + Math.sin(lt * 1.3 + k) * 10;
      ctx.save(); setF(ctx, DISP, DW, s, EN ? -s * .02 : 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = PINK; ctx.fillText(t, x + 16 * snap, cy + 11 * snap);
      ctx.fillStyle = PAPER; ctx.fillText(t, x, cy); ctx.restore();
    });
    mono(typeOn(T.thesisSub, inv(1.6 * B, 2.4 * B, lt)), W / 2, H - (PORT ? 190 : 120), PORT ? 24 : 26, PINK, 'center', 6);
  },
  cues: d => [...T.thesis.map((t, k) => [.04 + k * B * .45, t === '×' ? 'blip' : 'whoosh', t === '×' ? 1320 : .25]), [2.4 * B, 'stamp', .7]]
};

S.methods = {
  seg: d => d / WORDS.length,
  style(lt, d){ return Math.min(WORDS.length - 1, Math.floor(lt / this.seg(d))) % 3; },
  bg(lt, d){ return [PAPER, PINK, VIO][this.style(lt, d)]; },
  draw(lt, d){
    const seg = this.seg(d), k = Math.min(WORDS.length - 1, Math.floor(lt / seg)), u = lt - k * seg, st = k % 3, [word, catEN, catKO] = WORDS[k];
    const fg = [VIO, DEEP, PAPER][st], ghost = [PINK, PAPER, PINK][st];
    if (st === 0) halftone((x, y) => Math.exp(-Math.pow((y - H / 2) / (H * .16), 2)) * .55 * sstep(.35, .7, tissue(x, y, k)), PINK, .26);
    if (st === 2) halftone((x, y) => sstep(.55, .85, tissue(x, y + lt * 80, k)) * .6, PINK, .26, CELL, .6, 'source-over', .45);
    const s = fit(F.en, 800, word, W - 2 * M, PORT ? 250 : 330), sc = lerp(1.1, 1, eOut5(inv(0, .1, u)));
    const g = (1 - eOut3(inv(0, .18, u))) * (PORT ? 30 : 42), dir = k % 2 ? 1 : -1;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); setF(ctx, F.en, 800, s, -s * .025); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalCompositeOperation = st === 0 ? 'multiply' : 'source-over';
    ctx.fillStyle = ghost; ctx.fillText(word, g * dir, -g * .5);
    ctx.fillStyle = fg; ctx.fillText(word, 0, 0); ctx.restore();
    const ly = H / 2 - s * .62 - (PORT ? 24 : 30), lc = st === 2 ? PAPER : VIO;
    mono(EN ? catEN : catKO, M, ly, PORT ? 24 : 26, lc, 'left', 5);
    mono(`${String(k + 1).padStart(2, '0')}/${WORDS.length}`, W - M, ly, PORT ? 24 : 26, st === 1 ? PAPER : PINK, 'right', 5);
    ctx.save(); ctx.fillStyle = lc; ctx.globalAlpha = .7; ctx.fillRect(M, H / 2 + s * .6, (W - 2 * M) * eOut3(clamp(u / seg)), 3); ctx.restore();
  },
  cues(d){ const seg = this.seg(d), sc = [659, 784, 880, 988, 1175, 1319]; return WORDS.flatMap((_, k) => [[k * seg, 'blip', sc[(k * 3) % 6]], [k * seg, 'hit', .5]]); }
};

S.numbers = {
  bg: () => PAPER,
  draw(lt, d){
    const n = T.stats.length, seg = d / n, k = Math.min(n - 1, Math.floor(lt / seg)), u = lt - k * seg, [tpl, label, det] = T.stats[k];
    const target = parseFloat(tpl.replace(/[^\d.]/g, '')), v = target * eOut3(inv(.02, seg * .45, u));
    const str = tpl.startsWith('$') ? '$' + v.toFixed(1) + 'M' : Math.round(v) + (tpl.endsWith('+') ? '+' : '');
    const env = eOut3(inv(0, .14, u)) * (k < n - 1 ? 1 - eIn3(inv(seg - .12, seg, u)) : 1);
    const s = fit(F.en, 800, tpl, PORT ? W - 2 * M : W * .52, PORT ? 560 : 640);
    const nx = PORT ? W / 2 : W * .57, ny = PORT ? H * .52 : H * .5 + s * .36, al = PORT ? 'center' : 'right';
    const a = apart(u, .14, .4);
    ink(PINK, c => { setF(c, F.en, 800, s, -s * .03); c.textAlign = al; c.globalAlpha = env; c.fillText(str, nx + 34 * a, ny - 22 * a); }, 'multiply');
    const m = mask(c => { setF(c, F.en, 800, s, -s * .03); c.textAlign = al; c.fillText(str, nx, ny); });
    halftone((x, y) => m(x, y) * env * 1.15, VIO, .785, PORT ? 11 : 12, .7);
    const lx = PORT ? W / 2 : W * .6, la = PORT ? 'center' : 'left', ly = PORT ? H * .64 : H * .47;
    const lp = eOut5(inv(.08, .3, u));
    ctx.save(); ctx.globalAlpha = lp * env; setF(ctx, F.body, 700, PORT ? 60 : 66, -1); ctx.fillStyle = VIO; ctx.textAlign = la;
    ctx.fillText(label, lx + (PORT ? 0 : (1 - lp) * 40), ly); ctx.restore();
    mono(typeOn(det, inv(.14, .5, u)), lx, ly + (PORT ? 60 : 64), PORT ? 22 : 24, VIO, la, 3, env);
    mono(`${String(k + 1).padStart(2, '0')} / 0${n}`, lx, ly - (PORT ? 90 : 96), PORT ? 24 : 26, PINK, la, 6, env);
  },
  cues(d){ const seg = d / T.stats.length; return T.stats.flatMap((_, k) => [[k * seg + .14, 'stamp', .6], ...[...Array(6)].map((_, j) => [k * seg + .03 + j * .05, 'tick'])]); }
};

S.journals = {
  bg: () => VIO,
  draw(lt, d){
    const rows = PORT ? 7 : 5, rh = H / rows, s = Math.min(rh * .7, PORT ? 150 : 170), mid = Math.floor(rows / 2);
    let j = 0;
    for (let r = 0; r < rows; r++){
      const cy = r * rh + rh / 2;
      ctx.save(); setF(ctx, F.en, 800, s, -s * .02); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      if (r === mid){
        const ns = Math.min(s * 1.08, fit(F.en, 800, 'Nature Immunology', W - 2 * M, s * 1.08)); setF(ctx, F.en, 800, ns, -ns * .02);
        const w = ctx.measureText('Nature Immunology').width, x = W / 2 - w / 2 + (1 - eOut5(inv(0, d * .6, lt))) * W * 1.3;
        ctx.strokeStyle = PINK; ctx.lineWidth = 2.5; ctx.globalAlpha = .55;
        for (let c = -3; c <= 3; c++) if (c) ctx.strokeText('Nature Immunology', x + c * (w + s * .6), cy);
        ctx.globalAlpha = 1; ctx.fillStyle = PINK; ctx.fillText('Nature Immunology', x, cy);
      } else {
        const txt = JROWS[j++ % JROWS.length], uw = ctx.measureText(txt).width, dir = r % 2 ? 1 : -1;
        const off = (((dir * (lt * 380 + r * 260)) % uw) + uw) % uw;
        ctx.strokeStyle = PAPER; ctx.lineWidth = 2.2; ctx.globalAlpha = .6;
        for (let x = -off; x < W; x += uw) ctx.strokeText(txt, x, cy);
      }
      ctx.restore();
    }
    const sp = inv(d * .55, d * .55 + .14, lt);
    if (sp > 0){
      const sw = PORT ? 640 : 700, sh = PORT ? 130 : 120, sx = PORT ? W / 2 : W * .68, sy = mid * rh + rh / 2 + rh * .82;
      ctx.save(); ctx.fillStyle = VIO; ctx.globalAlpha = .75; ctx.fillRect(sx - sw / 2 - 20, sy - sh / 2 - 12, sw + 40, sh + 24); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.translate(sx, sy); ctx.rotate(-.07); const sc = lerp(1.8, 1, eOut5(sp)); ctx.scale(sc, sc);
      ctx.strokeStyle = PINK; ctx.lineWidth = 7; ctx.strokeRect(-sw / 2, -sh / 2, sw, sh); ctx.lineWidth = 2.5; ctx.strokeRect(-sw / 2 + 12, -sh / 2 + 12, sw - 24, sh - 24);
      ctx.fillStyle = PINK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const fs = fit(F.body, 700, T.stamp, sw - 80, PORT ? 42 : 40);
      setF(ctx, F.body, 700, fs, 2); ctx.fillText(T.stamp, 0, 2); ctx.restore();
    }
  },
  cues: d => [[0, 'whoosh', .35], [d * .55, 'stamp', .9]]
};

S.career = {
  bg: () => PAPER,
  draw(lt, d){
    const C = T.career, n = C.length, P = eIO(inv(d * .04, d * .94, lt)), gapW = PORT ? 300 : 560;
    const span = (n - 1) * gapW, cam = P * (span - (PORT ? H * .38 : W * .45));
    const read = PORT ? H * .5 : W * .42;
    let cur = 0; C.forEach((c, k) => { const pos = (PORT ? H * .46 : W * .18) + k * gapW - cam; if (pos < read + 40) cur = k; });
    const yr = C[cur][0], ys = fit(F.en, 800, '2026', PORT ? W - 2 * M : W * .56, PORT ? 400 : 470);
    ink(PINK, c => { setF(c, F.en, 800, ys, -ys * .03); c.textAlign = PORT ? 'left' : 'right'; c.fillText(yr, PORT ? M - 8 : W - M, PORT ? H * .1 + ys * .72 : H * .44); });
    halftone((x, y) => (PORT ? Math.exp(-Math.pow((x - M - 40) / 70, 2)) : Math.exp(-Math.pow((y - H * .66) / 70, 2))) * .5 * sstep(.4, .7, tissue(x, y, lt)), VIO, .785);
    ctx.save(); ctx.fillStyle = VIO;
    if (PORT) ctx.fillRect(M + 36, 0, 6, H); else ctx.fillRect(0, H * .66 - 3, W, 6);
    C.forEach(([year, place, role], k) => {
      const pos = (PORT ? H * .46 : W * .18) + k * gapW - cam; if (pos < -400 || pos > (PORT ? H : W) + 400) return;
      const on = k <= cur, nx = PORT ? M + 39 : pos, ny = PORT ? pos : H * .66;
      ctx.globalAlpha = PORT ? inv(H * .3, H * .4, pos) : 1; if (ctx.globalAlpha <= 0) return;
      ctx.fillStyle = on ? PINK : PAPER; ctx.strokeStyle = VIO; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(nx, ny, on ? 22 : 16, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = VIO; ctx.textAlign = 'left';
      const tx = PORT ? M + 100 : pos - 10, ty = PORT ? pos + 14 : H * .66 - 52;
      setF(ctx, F.en, 800, PORT ? 104 : 116, -3); ctx.fillText(year, tx, ty);
      setF(ctx, F.body, 700, PORT ? 38 : 40, -.5); ctx.fillText(place, tx, PORT ? ty + 58 : H * .66 + 86);
      setF(ctx, F.mono, 500, PORT ? 21 : 23, 3); const ga = ctx.globalAlpha; ctx.globalAlpha = ga * .8; ctx.fillText(role, tx, PORT ? ty + 96 : H * .66 + 128); ctx.globalAlpha = 1;
    });
    ctx.restore();
  },
  cues(d){ return [[0, 'whoosh', .3], ...T.career.map((_, k) => [d * (.06 + .86 * k / 6), 'blip', 880 + k * 110])]; }
};

S.antibody = {
  bg: () => PAPER,
  draw(lt, d){
    const cx = PORT ? W / 2 : W * .26, cy = PORT ? H * .27 : H * .54, S0 = PORT ? 230 : 250, rot = Math.sin(lt * 1.3) * .07;
    const pop = eOut5(inv(0, .3, lt)), a = apart(lt, B);
    const Y = c => {
      c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(pop, pop); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = S0 * .27;
      c.beginPath(); c.moveTo(0, S0 * .95); c.lineTo(0, S0 * .05); c.lineTo(-S0 * .78, -S0 * .85); c.moveTo(0, S0 * .05); c.lineTo(S0 * .78, -S0 * .85); c.stroke();
      c.lineWidth = S0 * .17;
      for (const sg of [-1, 1]){ c.beginPath(); c.moveTo(sg * S0 * .55, -S0 * .05); c.lineTo(sg * S0 * 1.1, -S0 * .68); c.stroke(); }
      c.restore();
    };
    ink(PINK, c => { c.translate(30 * a, -20 * a); Y(c); });
    const m = mask(Y); halftone((x, y) => m(x, y) * 1.2, VIO, .785, PORT ? 11 : 12, .7);
    const hx = PORT ? M : W * .5, hy = PORT ? H * .43 : H * .22, hw = PORT ? W - 2 * M : W * .5 - M;
    T.ab.forEach((t, k) => {
      const s = fit(DISP, DW, t, hw, PORT ? 130 : 118), p = eOut5(inv(.05 + k * .1, .4 + k * .1, lt));
      ctx.save(); ctx.beginPath(); ctx.rect(hx - 10, hy + k * s * 1.02 - s * .05, W, s * 1.1); ctx.clip();
      setF(ctx, DISP, DW, s, EN ? -s * .02 : 0); ctx.fillStyle = k ? PINK : VIO; ctx.textBaseline = 'top'; ctx.globalCompositeOperation = 'multiply';
      ctx.fillText(t, hx, hy + k * s * 1.02 + (1 - p) * s * 1.1); ctx.restore();
    });
    const sy = PORT ? H * .64 : H * .5, step = PORT ? 88 : 84;
    T.abSteps.forEach((t, k) => {
      const t0 = (1.5 + k * (LONG ? 1 : .6)) * B, p = eOut5(inv(t0, t0 + .2, lt)); if (p <= 0) return;
      const y = sy + k * step;
      ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * 40, 0);
      ctx.strokeStyle = VIO; ctx.lineWidth = 4; ctx.strokeRect(hx, y - 34, 44, 44);
      const cp = inv(t0 + .05, t0 + .2, lt);
      if (cp > 0){ ctx.strokeStyle = PINK; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx + 8, y - 14); ctx.lineTo(hx + 8 + 12 * Math.min(1, cp * 2), y - 14 + 12 * Math.min(1, cp * 2)); if (cp > .5) ctx.lineTo(hx + 20 + 26 * (cp - .5) * 2, y - 2 - 34 * (cp - .5) * 2); ctx.stroke(); }
      setF(ctx, F.body, 700, fit(F.body, 700, t, hw - 80, PORT ? 40 : 40), -.5); ctx.fillStyle = VIO; ctx.textAlign = 'left'; ctx.fillText(t, hx + 74, y);
      ctx.restore();
    });
    mono(typeOn(T.abFoot, inv(.3, 1.2, lt)), hx, PORT ? H - 150 : H - 120, PORT ? 21 : 23, PINK, 'left', 4);
  },
  cues(d){ return [[0, 'whoosh', .25], [B, 'stamp', .8], ...T.abSteps.map((_, k) => [(1.5 + k * (LONG ? 1 : .6)) * B + .05, 'stamp', .45])]; }
};

S.book = {
  bg: () => VIO,
  draw(lt, d){
    halftone((x, y) => sstep(.55, .85, tissue(x - lt * 50, y, lt)) * .7, PINK, .26, CELL, .6, 'source-over', .35);
    const bw = PORT ? 470 : 440, bh = PORT ? 640 : 600, bx = PORT ? W / 2 : W * .29, by = PORT ? H * .31 : H * .53;
    const op = eOut5(inv(0, .45, lt)), tilt = Math.sin(lt * 1.1) * .03;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-.05 + tilt); ctx.transform(Math.max(.02, op), (1 - op) * .35, 0, 1, 0, 0);
    ctx.fillStyle = DEEP; ctx.fillRect(-bw / 2 + 16, -bh / 2 + 18, bw, bh);
    ctx.fillStyle = PINK; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.fillStyle = 'rgba(34,26,94,.28)'; ctx.fillRect(-bw / 2, -bh / 2, 26, bh);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = VIO;
    const mol = [[-.2, -.12], [.05, -.02], [.25, -.16], [.1, .2], [-.18, .16], [.32, .12]];
    ctx.lineWidth = 10; ctx.strokeStyle = VIO; ctx.beginPath();
    [[0, 1], [1, 2], [1, 3], [3, 4], [4, 0], [3, 5], [2, 5]].forEach(([a, b]) => { ctx.moveTo(mol[a][0] * bw, mol[a][1] * bh); ctx.lineTo(mol[b][0] * bw, mol[b][1] * bh); }); ctx.stroke();
    mol.forEach(([x, y], k) => { ctx.beginPath(); ctx.arc(x * bw, y * bh, k % 2 ? 22 : 30, 0, TAU); ctx.fill(); });
    ctx.globalCompositeOperation = 'source-over';
    setF(ctx, F.en, 800, 64, -1.5); ctx.fillStyle = DEEP; ctx.textAlign = 'left';
    ctx.fillText('AI DRUG', -bw / 2 + 50, -bh / 2 + 96); ctx.fillText('DISCOVERY', -bw / 2 + 50, -bh / 2 + 160);
    const pages = Math.round(548 * eOut3(inv(.25, 1.2, lt)));
    setF(ctx, F.en, 800, 120, -4); ctx.fillStyle = PAPER; ctx.fillText(String(pages), -bw / 2 + 46, bh / 2 - 60);
    setF(ctx, F.mono, 500, 20, 4); ctx.fillText('PAGES', -bw / 2 + 52, bh / 2 - 30);
    ctx.restore();
    const hx = PORT ? M : W * .54, hy = PORT ? H * .6 : H * .26, hw = PORT ? W - 2 * M : W * .46 - M;
    T.book.forEach((t, k) => {
      const s = fit(DISP, DW, t, hw, PORT ? 130 : 120), p = eOut5(inv(.15 + k * .1, .5 + k * .1, lt));
      ctx.save(); setF(ctx, DISP, DW, s, EN ? -s * .02 : 0); ctx.fillStyle = k ? PINK : PAPER; ctx.textBaseline = 'top';
      ctx.globalAlpha = p; ctx.fillText(t, hx + (1 - p) * 60, hy + k * s * 1.05); ctx.restore();
    });
    const my = PORT ? H * .6 + 300 : H * .26 + 290;
    mono(T.bookRole, hx, my, PORT ? 24 : 26, PINK, 'left', 8, eOut3(inv(.4, .6, lt)));
    ctx.save(); setF(ctx, F.body, 500, PORT ? 34 : 34, 0); ctx.fillStyle = PAPER; ctx.globalAlpha = eOut3(inv(.45, .7, lt)); ctx.fillText(T.bookMeta, hx, my + 56); ctx.restore();
    let cx = hx, cy = my + 110;
    T.bookChips.forEach((c, k) => {
      const p = eOut5(inv(.6 + k * .08, .85 + k * .08, lt)); if (p <= 0) return;
      setF(ctx, F.mono, 500, PORT ? 24 : 24, 2); const w = ctx.measureText(c).width + 36;
      if (cx + w > hx + hw){ cx = hx; cy += 64; }
      ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = PAPER; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx, cy, w, 48, 24) : ctx.rect(cx, cy, w, 48); ctx.stroke();
      ctx.fillStyle = PAPER; ctx.fillText(c, cx + 18, cy + 32); ctx.restore(); cx += w + 14;
    });
  },
  cues: d => [[0, 'whoosh', .3], ...[...Array(14)].map((_, k) => [.25 + k * .065, 'tick']), [.45, 'stamp', .5]]
};

S.awards = {
  bg: () => PAPER,
  draw(lt, d){
    const s = fit(DISP, DW, T.award, PORT ? W - 2 * M : W * .56, PORT ? 300 : 300), ty = PORT ? H * .2 : H * .34;
    const p = eOut5(inv(0, .18, lt)), a = apart(lt, .5 * B);
    ctx.save(); ctx.globalAlpha = p; setF(ctx, DISP, DW, s, EN ? -s * .02 : 0); ctx.textAlign = 'left'; ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = PINK; ctx.fillText(T.award, M + 26 * a, ty - 18 * a); ctx.fillStyle = VIO; ctx.fillText(T.award, M, ty); ctx.restore();
    const xs = fit(F.en, 800, '×2', PORT ? W * .5 : W * .3, PORT ? 360 : 420), xp = eOut5(inv(.2, .4, lt));
    const m = mask(c => { setF(c, F.en, 800, xs * lerp(1.5, 1, xp), -8); c.textAlign = 'right'; c.fillText('×2', W - M, PORT ? H * .2 + xs * .9 : H * .44); });
    if (xp > 0) halftone((x, y) => m(x, y) * 1.2, PINK, .26, PORT ? 12 : 13, .7);
    T.awardStamps.forEach(([yr, name], k) => {
      const t0 = (1 + k) * B, sp = inv(t0, t0 + .14, lt); if (sp <= 0) return;
      const sw = PORT ? W - 2 * M - 40 : W * .36, sh = PORT ? 250 : 260;
      const sx = PORT ? W / 2 : M + sw / 2 + k * (sw + 60), sy = PORT ? H * .52 + k * 310 : H * .7;
      stampBox(sx, sy, sw, sh, k ? .045 : -.05, lerp(1.7, 1, eOut5(sp)), VIO,
        [[yr, F.en, 800, PORT ? 110 : 110, -4], [name, F.body, 700, PORT ? 44 : 42, 66]]);
    });
    mono(typeOn(T.awardFoot, inv(3 * B, 3 * B + .6, lt)), M, PORT ? H - 160 : H - 110, PORT ? 20 : 22, PINK, 'left', 3);
  },
  cues: d => [[0, 'whoosh', .25], [.5 * B, 'stamp', .7], [B, 'stamp', .9], [2 * B, 'stamp', .9], [3 * B, 'blip', 1568]]
};

S.outro = {
  bg: () => PAPER,
  draw(lt, d){
    const sx = M, sy = PORT ? H * .1 : H * .1, sw = W - 2 * M, sh = PORT ? H * .4 : H * .44;
    const slide = eOut5(inv(0, .38, lt)), oy = (1 - slide) * H * .7;
    ctx.save(); ctx.translate(0, oy);
    ctx.fillStyle = 'rgba(58,47,158,.05)'; ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = VIO; ctx.lineWidth = 3; ctx.strokeRect(sx, sy, sw, sh);
    const lw = PORT ? sw : sw * .26, lh = PORT ? sh * .24 : sh;
    ink(PINK, c => c.fillRect(sx, sy, lw, lh), 'multiply', .9);
    halftone((x, y) => (x > sx && x < sx + lw && y > sy + oy && y < sy + oy + lh) ? .35 : 0, PINK, .26);
    ctx.fillStyle = DEEP; setF(ctx, F.mono, 500, PORT ? 26 : 26, 4); ctx.textAlign = 'left';
    [['SJK-2026', 0], ['H&E · 4 µm', 1], ['40× · FFPE', 2]].forEach(([t, k]) => ctx.fillText(t, sx + 30, sy + (PORT ? 60 + k * 44 : 70 + k * 46)));
    ctx.restore();
    const tx0 = PORT ? sx : sx + lw, ty0 = PORT ? sy + lh : sy, tw = PORT ? sw : sw - lw, th = PORT ? sh - lh : sh;
    const sweep = lerp(tx0 - 300, tx0 + tw + 300, eOut3(inv(.15, 1.3 * B + .3, lt)));
    const cxT = tx0 + tw / 2, cyT = ty0 + oy + th / 2;
    const inside = (x, y) => { const dx = (x - cxT) / (tw * .44), dy = (y - cyT) / (th * .4), th2 = Math.atan2(dy, dx); return Math.hypot(dx, dy) < 1 + .12 * Math.sin(3 * th2 + 1) + .08 * Math.sin(5 * th2); };
    halftone((x, y) => inside(x, y) && x < sweep ? sstep(.35, .7, tissue(x, y, lt * .5)) : 0, PINK, .26);
    halftone((x, y) => inside(x, y) && x < sweep - 120 ? sstep(.55, .82, tissue(x + 60, y + 30, lt * .5)) * 1.1 : 0, VIO, .785);
    const ny = PORT ? H * .64 : H * .72, k = PORT ? .74 : .52;
    nameSlam(lt, W / 2, ny, k, B, 2 * B);
    if (lt > 2 * B){
      const us = PORT ? 62 : 64, uy = PORT ? H * .64 + (EN ? NAME.s * k * .95 : NAME.s * k * .5) + 120 : H * .72 + (EN ? NAME.s * k * .95 : NAME.s * k * .5) + 96;
      ctx.save(); setF(ctx, F.en, 800, us, -1); ctx.fillStyle = VIO; ctx.textAlign = 'center'; ctx.fillText(typeOn('kangseongjun.com', inv(2 * B + .04, 2 * B + .45, lt)), W / 2, uy); ctx.restore();
      ctx.save(); setF(ctx, F.body, 500, fit(F.body, 500, T.outroTag, W - 2 * M, PORT ? 30 : 30), 0); ctx.fillStyle = VIO; ctx.globalAlpha = eOut3(inv(2 * B + .3, 2 * B + .6, lt));
      ctx.textAlign = 'center'; ctx.fillText(T.outroTag, W / 2, uy + (PORT ? 64 : 56)); ctx.restore();
    }
  },
  cues: d => [[-B, 'riser', B], [0, 'whoosh', .3], [B, 'stamp', .8], [2 * B, 'stamp', 1.2], [2 * B, 'chord', d - 2 * B + .6], ...[...Array(10)].map((_, k) => [2 * B + .06 + k * .04, 'tick'])]
};

/* ---------- running order ---------- */
const PLAN = LONG
  ? [['open', 6], ['thesis', 6], ['methods', 8], ['antibody', 8], ['numbers', 8], ['journals', 6], ['book', 5], ['awards', 5], ['career', 7], ['outro', 5]]
  : [['open', 4], ['thesis', 4], ['methods', 6], ['numbers', 6], ['journals', 4], ['career', 4], ['outro', 4]];
let acc = 0;
const SC = PLAN.map(([id, beats], i) => { const s = { id, i, t0: acc * B, d: beats * B }; acc += beats; return s; });
const CODE = { open: 'OPEN', thesis: 'PROFILE', methods: 'METHODS', antibody: 'ANTI-CD40', numbers: 'OUTPUT', journals: 'JOURNALS', book: 'BOOK', awards: 'AWARDS', career: 'CAREER', outro: 'SLIDE' };

/* ---------- global layers ---------- */
const grain = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), im = g.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4){ const v = 205 + rnd() * 50; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); return ctx.createPattern(c, 'repeat');
})();
function dotWipe(p, color, fromRight){
  halftone((x, y) => { const e = fromRight ? 1 - x / W : x / W; return clamp((p * 1.7 - e) * 3.2 + (vnoise(x * .01, y * .01) - .5) * .6); }, color, .26, CELL, .78, 'source-over');
  if (p >= .985){ ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
}
function hud(t, sc, bg){
  const col = bg === PAPER ? VIO : bg === PINK ? DEEP : PAPER, s = PORT ? 20 : 20;
  const fr = Math.floor(t * 30), tc = `00:${String(Math.floor(fr / 30)).padStart(2, '0')}:${String(fr % 30).padStart(2, '0')}`;
  const top = PORT ? 64 : 58, bot = H - (PORT ? 52 : 44);
  mono(`SJK/REEL · ${String(sc.i + 1).padStart(2, '0')} ${CODE[sc.id]}`, M, top, s, col, 'left', 3, .85);
  mono('kangseongjun.com', W - M, top, s, col, 'right', 3, .85);
  mono(`H&E · 4µm · ${DUR}s`, M, bot, s, col, 'left', 3, .85);
  mono(tc, W - M, bot, s, col, 'right', 3, .85);
}
function render(t){
  t = clamp(t, 0, DUR - 1e-4);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (!NAME) nameLayout();
  const sc = SC.find(s => t < s.t0 + s.d) || SC[SC.length - 1], lt = t - sc.t0, sd = S[sc.id];
  const bg = sd.bg(lt, sc.d);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  sd.draw(lt, sc.d);
  const next = SC[sc.i + 1];
  if (next){
    const nbg = S[next.id].bg(0, next.d), left = sc.d - lt;
    if (nbg !== sd.bg(sc.d - 1e-3, sc.d) && left < .2) dotWipe(1 - left / .2, nbg, sc.i % 2 === 0);
  }
  if (sc.i > 0){
    const pbg = S[SC[sc.i - 1].id].bg(SC[sc.i - 1].d - 1e-3, SC[sc.i - 1].d);
    if (pbg === S[sc.id].bg(0, sc.d) && lt < .14){ ctx.fillStyle = PINK; const w = W * eOut3(lt / .14); ctx.fillRect(w, 0, W - w, H); }
  }
  hud(t, sc, bg);
  /* paper grain stays put, as it does on a printed sheet (and it keeps the H.264 files small) */
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .55; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.restore();
}

/* =================================================================== SOUND (synthesized; one cue sheet for live play and for the MP4 mix) */
function buildSound(ac, out, t0, T0){
  const noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const at = e => T0 + (e - t0);
  const env = (g, T, a, dec, att = .003) => { g.gain.setValueAtTime(.0001, T); g.gain.exponentialRampToValueAtTime(Math.max(.0002, a), T + att); g.gain.exponentialRampToValueAtTime(.0001, T + dec); };
  const osc = (e, type, f, a, dec, f2, fd, lp) => {
    if (e < t0 - .001) return; const T = at(e), o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, T); if (f2) o.frequency.exponentialRampToValueAtTime(f2, T + fd);
    env(g, T, a, dec); let n = o; if (lp){ const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); n = fl; }
    n.connect(g).connect(out); o.start(T); o.stop(T + dec + .05);
  };
  const nz = (e, type, f, q, a, dec, f2) => {
    if (e < t0 - .001) return; const T = at(e), s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, T); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, T + dec); fl.Q.value = q;
    env(g, T, a, dec); s.connect(fl).connect(g).connect(out); s.start(T, Math.random()); s.stop(T + dec + .05);
  };
  const swell = (e, len, a, f1, f2) => {
    if (e < t0 - .001) return; const T = at(e), s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; s.loop = true; fl.type = 'bandpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(f1, T); fl.frequency.exponentialRampToValueAtTime(f2, T + len);
    g.gain.setValueAtTime(.0001, T); g.gain.exponentialRampToValueAtTime(a, T + len * .92); g.gain.linearRampToValueAtTime(0, T + len + .01);
    s.connect(fl).connect(g).connect(out); s.start(T); s.stop(T + len + .05);
  };
  const SYN = {
    kick: (e, a = .85) => osc(e, 'sine', 150, a, .34, 44, .11),
    snare: (e, a = .3) => { nz(e, 'bandpass', 1900, .7, a, .15); osc(e, 'triangle', 200, a * .6, .07); },
    hat: (e, a = .04, dec = .03) => nz(e, 'highpass', 8500, .7, a, dec),
    bass: (e, f, a = .17) => osc(e, 'sawtooth', f, a, .19, 0, 0, 420),
    stamp: (e, a = .8) => { osc(e, 'sine', 100, a, .3, 36, .16); nz(e, 'bandpass', 900, 1, a * .55, .09); osc(e, 'square', 1500, a * .08, .012); },
    blip: (e, f = 880, a = .07) => osc(e, 'square', f, a, .07, 0, 0, 3200),
    hit: (e, a = .5) => nz(e, 'bandpass', 2600, 1.2, a * .25, .06),
    tick: (e, a = .03) => osc(e, 'square', 3200, a, .012),
    whoosh: (e, len = .3, a = .2) => nz(e, 'bandpass', 500, 1.2, a, len, 5200),
    riser: (e, len, a = .22) => { swell(e, len, a, 300, 8000); },
    drone: (e, len) => { osc(e, 'sine', 41.2, .3, len); osc(e, 'sine', 82.4, .12, len); },
    chord: (e, len) => [164.81, 196, 246.94, 293.66, 369.99, 493.88].forEach((f, k) => osc(e, 'sawtooth', f, .035, len, 0, 0, 1800 - k * 120))
  };
  /* four-on-the-floor from the second scene until the outro; bass in eighths, E – C – D – G */
  const dStart = SC[1].t0, dEnd = SC[SC.length - 1].t0, ROOT = [41.2, 65.41, 73.42, 49];
  for (let e = dStart, n = 0; e < dEnd - 1e-3; e += B / 2, n++){
    const onBeat = n % 2 === 0, beat = Math.floor(n / 2), bar = Math.floor(beat / 4) % 4;
    if (onBeat){ SYN.kick(e); if (beat % 2) SYN.snare(e); }
    else SYN.hat(e, .07, .09);
    SYN.hat(e + B / 4, .025);
    SYN.bass(e + .02, ROOT[bar] * (onBeat ? 1 : 2), onBeat ? .12 : .17);
  }
  SC.forEach((s, i) => {
    for (const [lt, name, ...args] of S[s.id].cues(s.d)){
      const e = s.t0 + lt; if (e < 0 || e > DUR) continue;
      SYN[name](e, ...args);
    }
    const nx = SC[i + 1];
    if (nx && S[nx.id].bg(0, nx.d) !== S[s.id].bg(s.d - 1e-3, s.d)) SYN.whoosh(s.t0 + s.d - .2, .22, .16);
  });
}
function masterChain(ac, dest){
  const g = ac.createGain(); g.gain.value = .62;
  const sh = ac.createWaveShaper(), curve = new Float32Array(1024);
  for (let i = 0; i < 1024; i++){ const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 1.6) / Math.tanh(1.6); }
  sh.curve = curve;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .12;
  g.connect(sh).connect(comp).connect(dest); return g;
}
function wavBase64(buf){
  const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate, dv = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); dv.setUint32(4, 36 + len * ch * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, ch, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
  ws(36, 'data'); dv.setUint32(40, len * ch * 2, true);
  const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c)); let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++){ dv.setInt16(o, clamp(chans[c][i], -1, 1) * 32767, true); o += 2; }
  const u8 = new Uint8Array(dv.buffer); let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}

/* =================================================================== PLAYER
   No controls on screen. Plays muted on load and loops; the first click or key restarts it with
   sound (browsers hold audio until a gesture). Space pause · ←/→ 0.5 s · F fullscreen · M mute.
   ?t=<seconds> opens paused on that frame. */
let actx = null, master = null, bus = null, base = null, soundOn = true;
function ensureAudio(){ if (actx) return; try { actx = new (window.AudioContext || window.webkitAudioContext)(); master = masterChain(actx, actx.destination); } catch (e){ actx = null; } }
function stopAudio(){ if (bus){ try { bus.disconnect(); } catch (e){} bus = null; } base = null; }
function schedule(t0){ if (!actx) return; stopAudio(); bus = actx.createGain(); bus.gain.value = soundOn ? 1 : 0; bus.connect(master); const T0 = actx.currentTime + .06; base = { T0, t0 }; buildSound(actx, bus, t0, T0); }
const stage = document.getElementById('stage');
const qT = parseFloat(Q.get('t')), still = Number.isFinite(qT);
let playing = false, head = still ? clamp(qT, 0, DUR) : 0, last = 0, dirty = true, armed = false, holdUntil = 0;
function play(){ if (actx && actx.state === 'suspended') actx.resume(); if (head >= DUR - .01) head = 0; schedule(head); playing = true; last = performance.now(); }
function pause(){ playing = false; stopAudio(); dirty = true; }
function seek(t){ head = clamp(t, 0, DUR); if (playing) schedule(head); dirty = true; }
function arm(){ if (armed) return; armed = true; ensureAudio(); head = 0; play(); }
function frame(now){
  if (playing){
    if (actx && actx.state === 'running' && base) head = Math.max(base.t0, base.t0 + actx.currentTime - base.T0); else head += (now - last) / 1000;
    last = now;
    if (head >= DUR){ head = DUR; playing = false; stopAudio(); holdUntil = now + 900; }
    render(head);
  } else if (holdUntil && now >= holdUntil){ holdUntil = 0; head = 0; play(); }
  else if (dirty){ render(head); dirty = false; }
  requestAnimationFrame(frame);
}
function toggleFs(){ try { if (document.fullscreenElement) document.exitFullscreen(); else (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage); } catch (e){} }
stage.addEventListener('click', () => { if (!armed) arm(); else playing ? pause() : (holdUntil = 0, play()); });
stage.addEventListener('dblclick', toggleFs);
document.addEventListener('keydown', e => {
  if (!armed){ arm(); if (e.key === ' ') e.preventDefault(); return; }
  if (e.key === ' '){ e.preventDefault(); playing ? pause() : (holdUntil = 0, play()); }
  else if (e.key === 'ArrowRight') seek(head + .5);
  else if (e.key === 'ArrowLeft') seek(head - .5);
  else if (e.key === 'f' || e.key === 'F') toggleFs();
  else if (e.key === 'm' || e.key === 'M'){ soundOn = !soundOn; if (bus) bus.gain.setTargetAtTime(soundOn ? 1 : 0, actx.currentTime, .02); }
});
let idle; document.addEventListener('mousemove', () => { stage.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => stage.classList.add('idle'), 1500); });

/* fonts: request every glyph the copy uses before the first real frame */
const ALL = JSON.stringify(T) + JSON.stringify(WORDS) + JROWS.join('') + '0123456789$+.×✱µ→·';
const FACES = [['400', F.kr, '강성준대상'], ['800', F.en, 'SEONG'], ['500', F.body, '계산 면역학자'], ['700', F.body, '편의 논문'], ['500', F.mono, 'SJK']]
  .map(([w, f, sample]) => [`${w} 64px ${f.split(',')[0]}`, sample]);
/* check() alone is true when a family is not declared at all, so also require a loaded face of that family */
const fontsOK = () => !document.fonts || FACES.every(([f, sample]) => {
  const fam = f.match(/"([^"]+)"/)[1];
  return [...document.fonts].some(ff => ff.family.replace(/["']/g, '') === fam && ff.status === 'loaded') && document.fonts.check(f, sample);
});
const ready = Promise.race([
  Promise.all(FACES.map(([f]) => document.fonts ? document.fonts.load(f, ALL) : null)),
  new Promise(r => setTimeout(r, 6000))
]).catch(() => {}).then(() => { nameLayout(); });
/* Korean faces arrive in many unicode-range slices; re-measure whenever more of them land */
if (document.fonts) document.fonts.addEventListener('loadingdone', () => { NAME = null; dirty = true; });

window.reel = {
  W, H, fps: 30, duration: DUR, ready, fontsOK,
  load: () => Promise.all(FACES.map(([f]) => document.fonts.load(f, ALL))).then(() => { NAME = null; return fontsOK(); }),
  frame: (t, q = .95) => { render(t); return cv.toDataURL('image/jpeg', q); },
  audioWav: async () => { const oac = new OfflineAudioContext(2, 44100 * DUR, 44100); buildSound(oac, masterChain(oac, oac.destination), 0, 0); return wavBase64(await oac.startRendering()); }
};
ready.then(() => { dirty = true; if (!still) play(); requestAnimationFrame(frame); });
render(head);
})();
