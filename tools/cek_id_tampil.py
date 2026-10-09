"""Pastikan ID internal halaman (A1, B3.1, C2, ...) tidak tampil ke pembaca.

Memeriksa teks yang terlihat di situs/dist hasil build: isi artikel, sidebar, judul tab, dan string di data widget
(dist/widgets/data/**/*.json, yang dirender JavaScript). Kode aturan gosec (G101, G104, ...) bukan ID halaman dan dilewati.

    bun run --cwd situs build && python3 tools/cek_id_tampil.py
"""
import html.parser
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "situs/dist"
POLA = re.compile(r"(?<![\w./#-])[A-G]\d+(?:\.\d+)?(?![\w])")
LEWAT_HAL = ()
LEWAT_TOKEN = re.compile(r"^G\d{3}$")          # aturan gosec


class Teks(html.parser.HTMLParser):
    """Kumpulkan teks terlihat; lewati script/style dan atribut."""
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "svg"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "svg") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)


def temuan(teks):
    return [m.group(0) for m in POLA.finditer(teks) if not LEWAT_TOKEN.match(m.group(0))]


def strings(o):
    if isinstance(o, str):
        yield o
    elif isinstance(o, list):
        for x in o:
            yield from strings(x)
    elif isinstance(o, dict):
        for k, v in o.items():
            if k not in ("id", "halaman", "src", "file", "fileVarian", "s", "b"):   # kunci internal, tidak ditampilkan
                yield from strings(v)


def main():
    if not (SITE / "index.html").exists():
        sys.exit("situs/dist belum ada. Jalankan: bun run --cwd situs build")
    salah = []
    for p in sorted(SITE.rglob("*.html")):
        rel = str(p.relative_to(SITE))
        if any(x in rel for x in LEWAT_HAL) or rel.startswith(("assets/", "vendor/", "_astro/", "pagefind/")) or rel == "404.html":
            continue
        t = Teks()
        t.feed(p.read_text())
        for i, baris in enumerate("".join(t.out).splitlines()):
            for x in temuan(baris):
                salah.append(f"{rel}: '{x}' di \"{baris.strip()[:90]}\"")
    for p in sorted((SITE / "widgets/data").rglob("*.json")):
        if p.name == "cerita.json":
            continue
        for s in strings(json.loads(p.read_text())):
            for x in temuan(s):
                salah.append(f"{p.relative_to(SITE)}: '{x}' di \"{s[:90]}\"")
    js = (SITE / "javascripts/istilah-data.js").read_text()
    for m in re.finditer(r'"(?:t|d|n)": "([^"]*)"', js):
        for x in temuan(m.group(1)):
            salah.append(f"javascripts/istilah-data.js: '{x}' di \"{m.group(1)[:90]}\"")
    if salah:
        print("\n".join(salah))
        print(f"\nGAGAL: {len(salah)} ID internal tampil ke pembaca.")
        sys.exit(1)
    print("ID internal tidak tampil di teks halaman, sidebar, dan data widget.")


if __name__ == "__main__":
    main()
