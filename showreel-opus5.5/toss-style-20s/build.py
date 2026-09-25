"""Build the four standalone pages (ko/en x landscape/portrait) from src/."""
import json, pathlib
root = pathlib.Path(__file__).parent
shell = (root / 'src/shell.html').read_text(encoding='utf-8')
js = (root / 'src/reel.js').read_text(encoding='utf-8')
V = {
    ('ko', 'landscape'): ('강성준 쇼릴 · 20초 가로', '강성준 20초 모션그래픽 쇼릴, 가로형'),
    ('ko', 'portrait'): ('강성준 쇼릴 · 20초 세로', '강성준 20초 모션그래픽 쇼릴, 세로형'),
    ('en', 'landscape'): ('Seong-Jun Kang Showreel · 20s landscape', 'Seong-Jun Kang 20-second showreel, landscape'),
    ('en', 'portrait'): ('Seong-Jun Kang Showreel · 20s portrait', 'Seong-Jun Kang 20-second showreel, portrait'),
}
for (lang, orient), (title, aria) in V.items():
    html = (shell.replace('{{lang}}', lang).replace('{{title}}', title).replace('{{aria}}', aria)
                 .replace('{{ratio}}', '16 / 9' if orient == 'landscape' else '9 / 16')
                 .replace('{{cfg}}', json.dumps({'lang': lang, 'orient': orient}))
                 .replace('{{js}}', js))
    out = root / f'{lang}-{orient}.html'
    out.write_text(html, encoding='utf-8')
    print(out.name, len(html))
