"""Build the standalone HTML and complete offline ZIP without third-party tools."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NAME = 'Shadow-Rift-Last-Eclipse'


def build(output):
    output.mkdir(parents=True, exist_ok=True)
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'style.css').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')
    def inline(match):
        relative = match.group(1)
        source = (ROOT / relative).read_text(encoding='utf-8')
        if re.search(r'</script', source, re.I):
            raise ValueError('Script closing tag needs escaping in ' + relative)
        return '<script>\n// Source: ' + relative + '\n' + source + '\n</script>'
    html = re.sub(r'<script src="(js/[^"<>]+\.js)"></script>', inline, html)
    html = html.replace('href="./index.html"', 'href="./' + NAME + '.html"')
    if '<script src=' in html or 'rel="stylesheet"' in html:
        raise ValueError('Unbundled runtime dependency')
    standalone = ROOT / (NAME + '.html')
    standalone.write_text(html, encoding='utf-8')
    (output / standalone.name).write_bytes(standalone.read_bytes())
    paths = [ROOT / p for p in ['index.html', 'style.css', 'README.md', 'RUN-GAME.bat', 'serve.py', '.gitignore', '.gitattributes', standalone.name]]
    for folder in ['js', 'tests', 'tools']:
        paths.extend(p for p in sorted((ROOT / folder).rglob('*')) if p.is_file() and '__pycache__' not in p.parts)
    contents = {p.relative_to(ROOT).as_posix(): p.read_bytes() for p in paths}
    manifest = {'version': '2.0 / World and Arsenal', 'assets': 'Procedural Canvas graphics and Web Audio; no external assets.',
                'sha256': {name: hashlib.sha256(data).hexdigest() for name, data in contents.items()}}
    contents['MANIFEST.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
    archive = output / (NAME + '.zip')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in contents.items():
            z.writestr(NAME + '/' + name, data)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert len(z.namelist()) == len(contents)
        for name, data in contents.items():
            assert z.read(NAME + '/' + name) == data
    checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
    (output / (NAME + '.zip.sha256')).write_text(checksum + '  ' + archive.name + '\n')
    print(json.dumps({'zip': str(archive), 'bytes': archive.stat().st_size,
                      'files': len(contents), 'sha256': checksum}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT.parent / 'exports')
    build(parser.parse_args().output.resolve())
