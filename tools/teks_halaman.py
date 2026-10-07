"""Teks artikel dari site/ hasil build, untuk dibaca ulang sebagai pembaca (tanpa kode, SVG, script).
    python tools/teks_halaman.py c-operasional/c4-security-dasar
"""
import html.parser
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parents[1] / "site"


class T(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.o, self.skip, self.art = [], 0, False

    def handle_starttag(self, t, a):
        if t == "article":
            self.art = True
        if t in ("script", "style", "svg", "pre"):
            self.skip += 1
            if t == "pre":
                self.o.append("\n[blok kode]")
        if t in ("p", "li", "h1", "h2", "h3", "tr", "div", "summary"):
            self.o.append("\n")
        if t in ("td", "th"):
            self.o.append(" | ")

    def handle_endtag(self, t):
        if t in ("script", "style", "svg", "pre") and self.skip:
            self.skip -= 1

    def handle_data(self, d):
        if self.art and not self.skip:
            self.o.append(d)


t = T()
t.feed((SITE / sys.argv[1].strip("/") / "index.html").read_text())
print(re.sub(r"\n\s*\n+", "\n", "".join(t.o)).replace("¶", ""))
