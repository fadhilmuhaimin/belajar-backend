"""Registry halaman dari docs/widgets/data/cerita.json, dipakai sinkron_cerita.py, build_istilah.py, dan hook MkDocs.

ID halaman (A1, B3.1, ...) hanya kunci internal. Yang tampil ke pembaca:
  - nomor tampilan "T.N" = urutan baca di dalam Tahap T (dihitung dari urutan registry, termasuk halaman yang belum ada,
    supaya nomor tidak bergeser saat halaman baru ditulis)
  - judul

Rujukan antar halaman di Markdown ditulis [[B3.1]] atau [[B3.1|teks sendiri]]; hook MkDocs mengubahnya jadi link.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
CERITA = DOCS / "widgets/data/cerita.json"
TOKEN = re.compile(r"\[\[([A-Za-z0-9.\-]+)(?:\|([^\]]+))?\]\]")
URUT_BACA = ("pembuka", 1, 2, 3, 4, 5, "sampingan")   # "alat" di luar urutan baca


def muat():
    d = json.loads(CERITA.read_text())
    lengkapi(d)
    return d


def lengkapi(d):
    """Isi field turunan: ada, nomor."""
    hitung = {}
    for h in d["halaman"]:
        h["ada"] = (DOCS / h["path"]).exists()
        h.pop("nomor", None)
        t = h["tahap"]
        if isinstance(t, int) and not re.fullmatch(r"T\d", h["id"]):
            hitung[t] = hitung.get(t, 0) + 1
            h["nomor"] = f"{t}.{hitung[t]}"
    return d


def pendek(h):
    """Judul untuk rujukan di dalam kalimat: bagian sebelum titik dua, kecuali ada field 'pendek'."""
    return h.get("pendek") or h["judul"].split(":")[0]


def label(h, singkat=False):
    j = pendek(h) if singkat else h["judul"]
    return f"{h['nomor']} {j}" if h.get("nomor") else j


def url_halaman(path):
    """docs path -> URL MkDocs: a/b.md -> a/b/, a/index.md -> a/, index.md -> ''."""
    if path == "index.md" or path.endswith("/index.md"):
        return path[: -len("index.md")]
    return path[:-3] + "/"


def rel(dari, ke):
    """Link Markdown relatif dari file docs/<dari> ke docs/<ke>."""
    up = len(pathlib.PurePosixPath(dari).parent.parts)
    return "../" * up + ke


def urutan_baca(d):
    """Halaman yang ada, dalam urutan baca (pembuka, Tahap 1–5, sampingan)."""
    return [h for k in URUT_BACA for h in d["halaman"] if h["tahap"] == k and h["ada"]]


def ganti_token(teks, d, dari=None):
    """[[ID]] -> link Markdown (dari = path halaman) atau teks polos (dari=None). ID tak dikenal -> ValueError."""
    by = {h["id"]: h for h in d["halaman"]}

    def f(m):
        h = by.get(m.group(1))
        if not h:
            raise ValueError(f"rujukan [[{m.group(1)}]] tidak ada di cerita.json")
        teks_link = m.group(2) or label(h, singkat=True)
        if dari is None:
            return teks_link
        if not h["ada"]:
            return f"{teks_link} *(menyusul)*"
        return f"[{teks_link}]({rel(dari, h['path'])})"
    return TOKEN.sub(f, teks)
