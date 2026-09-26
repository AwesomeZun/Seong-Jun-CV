"""Build the eight standalone pages: {ko,en} x {landscape,portrait} x {15,30} seconds.

Fonts are embedded. Every character that appears in src/reel.js is sent to Google Fonts as a
`text=` subset request, and the returned WOFF2 files are inlined as data URIs, so each page runs
offline and the MP4 renderer never waits on the network. Subsets are cached in src/fonts/ and
reused when the network is unavailable.
"""
import base64, hashlib, json, pathlib, re, subprocess, urllib.parse

root = pathlib.Path(__file__).parent
shell = (root / 'src/shell.html').read_text(encoding='utf-8')
js = (root / 'src/reel.js').read_text(encoding='utf-8')

FACES = [  # (css family, google spec, weight)
    ('Gasoek One', 'Gasoek+One', 400),
    ('Bricolage Grotesque', 'Bricolage+Grotesque:wght@800', 800),
    ('IBM Plex Sans KR', 'IBM+Plex+Sans+KR:wght@500', 500),
    ('IBM Plex Sans KR', 'IBM+Plex+Sans+KR:wght@700', 700),
    ('DM Mono', 'DM+Mono:wght@500', 500),
]
chars = set(chr(c) for c in range(32, 127)) | {ch for ch in js if ord(ch) > 126}
text = ''.join(sorted(chars))
tag = hashlib.sha1(text.encode()).hexdigest()[:10]
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0 Safari/537.36'
cache = root / 'src/fonts'; cache.mkdir(exist_ok=True)

def get(url):
    # curl over HTTP/1.1 with retries (the Google Fonts API resets flaky HTTP/2 connections). Output goes
    # to a file, which curl truncates on each retry; retries on stdout would concatenate partial bodies.
    tmp = cache / '.download'
    subprocess.run(['curl', '-sSfL', '--http1.1', '--retry', '6', '--retry-all-errors', '--max-time', '60', '-A', UA, '-o', str(tmp), url], check=True)
    data = tmp.read_bytes(); tmp.unlink()
    return data

css_rules = []
for fam, spec, weight in FACES:
    stem = f"{fam.replace(' ', '')}-{weight}"
    path = cache / f'{stem}-{tag}.woff2'
    if not path.exists():
        try:
            css = get(f'https://fonts.googleapis.com/css2?family={spec}&text={urllib.parse.quote(text)}').decode()
            url = re.search(r"url\((https://[^)]+)\)", css).group(1)
            data = get(url)
            for old in cache.glob(f'{stem}-*.woff2'): old.unlink()
            path.write_bytes(data)
        except Exception as e:
            olds = sorted(cache.glob(f'{stem}-*.woff2'))
            if not olds: raise SystemExit(f'cannot fetch {fam} {weight} and no cached subset: {e}')
            print(f'offline: using cached {olds[-1].name} (may miss new characters)')
            path = olds[-1]
    b64 = base64.b64encode(path.read_bytes()).decode()
    css_rules.append(f"@font-face{{font-family:'{fam}';font-weight:{weight};font-style:normal;font-display:block;"
                     f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
fonts_css = '\n'.join(css_rules)

NAME = {'ko': '강성준 쇼릴', 'en': 'Seong-Jun Kang Showreel'}
ORI = {'ko': {'landscape': '가로', 'portrait': '세로'}, 'en': {'landscape': 'landscape', 'portrait': 'portrait'}}
for lang in ('ko', 'en'):
    for orient in ('landscape', 'portrait'):
        for dur in (15, 30):
            sec = f'{dur}초' if lang == 'ko' else f'{dur}s'
            title = f'{NAME[lang]} · {sec} {ORI[lang][orient]}'
            html = (shell.replace('{{lang}}', lang).replace('{{title}}', title).replace('{{aria}}', title)
                         .replace('{{ratio}}', '16 / 9' if orient == 'landscape' else '9 / 16')
                         .replace('{{fonts}}', fonts_css)
                         .replace('{{cfg}}', json.dumps({'lang': lang, 'orient': orient, 'dur': dur}))
                         .replace('{{js}}', js))
            out = root / f'{lang}-{orient}-{dur}.html'
            out.write_text(html, encoding='utf-8')
            print(f'{out.name}  {len(html) // 1024} KB')
