"""Hitung rasio kontras WCAG semua kombinasi warna yang DIPAKAI situs dan gambar.
Gagal (exit 1) kalau ada yang di bawah ambang.

    python tools/contrast.py [--md]
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from palette import (BG, BG_BLOCK, BG_BLOCK_2, FIG_LINE, FIG_PANEL, KINDS, LINK, MODE, NAVY,  # noqa: E402
                         PRIMARY, TEXT, TEXT_2)


def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4  # noqa: E731
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


TXT, BIG = 4.5, 3.0
SEKUNDER = 8.0  # redesain (keputusan 201): teks sekunder minimal 8:1 di latar halaman, kotak, dan header tabel
rows = [
    ("Teks utama di halaman", TEXT, BG, TXT),
    ("Teks utama di blok kode / admonition", TEXT, BG_BLOCK, TXT),
    ("Teks utama di inline code / header tabel", TEXT, BG_BLOCK_2, TXT),
    ("Teks sekunder (caption, meta) di halaman", TEXT_2, BG, TXT),
    ("Teks sekunder di blok", TEXT_2, BG_BLOCK, TXT),
    ("Link", LINK, BG, TXT),
    ("Link di admonition", LINK, BG_BLOCK, TXT),
    ("Teks header putih di navy", "#FFFFFF", NAVY, TXT),
    ("Tab navigasi (putih 78%) di navy", "#CACDD3", NAVY, TXT),
    ("Primary (garis, elemen besar) di halaman", PRIMARY, BG, BIG),
    ("Sintaks: komentar", "#51565E", BG_BLOCK, TXT),
    ("Sintaks: keyword", "#0041C2", BG_BLOCK, TXT),
    ("Sintaks: string", "#0F766E", BG_BLOCK, TXT),
    ("Sintaks: angka/konstanta", "#9A4C00", BG_BLOCK, TXT),
    ("Gambar: panah & garis", FIG_LINE, BG, BIG),
    ("Gambar: garis panel putus-putus", FIG_PANEL, BG, BIG),
    ("Gambar: label abu di latar putih", TEXT_2, BG, TXT),
]
for k, (fill, edge, ink) in KINDS.items():
    rows += [
        (f"[{k}] judul kotak di isi", TEXT, fill, TXT),
        (f"[{k}] subjudul di isi", TEXT_2, fill, TXT),
        (f"[{k}] teks berwarna (ink) di isi", ink, fill, TXT),
        (f"[{k}] teks berwarna (ink) di putih", ink, BG, TXT),
        (f"[{k}] garis tepi vs isi", edge, fill, BIG),
        (f"[{k}] garis tepi vs putih", edge, BG, BIG),
        (f"[{k}] garis kiri admonition vs blok", edge, BG_BLOCK, BIG),
        (f"[{k}] angka putih di lingkaran ink", "#FFFFFF", ink, TXT),
    ]

# Situs baru: kombinasi yang dipakai tema.css, diperiksa untuk mode gelap dan terang.
for nama, m in MODE.items():
    bg, bg2, bg3 = m["bg"], m["bg_2"], m["bg_3"]
    rows += [
        (f"[{nama}] teks isi di halaman", m["teks"], bg, TXT),
        (f"[{nama}] teks isi di kotak/kode", m["teks"], bg2, TXT),
        (f"[{nama}] teks isi di inline code / header tabel", m["teks"], bg3, TXT),
        (f"[{nama}] judul di halaman", m["judul"], bg, TXT),
        (f"[{nama}] teks sekunder di halaman", m["teks_2"], bg, SEKUNDER),
        (f"[{nama}] teks sekunder di kotak", m["teks_2"], bg2, SEKUNDER),
        (f"[{nama}] teks sekunder di inline code / header tabel", m["teks_2"], bg3, SEKUNDER),
        (f"[{nama}] link (aksen) di halaman", m["aksen"], bg, TXT),
        (f"[{nama}] link (aksen) di kotak", m["aksen"], bg2, TXT),
        (f"[{nama}] teks di atas blok aksen (tombol, aktor)", m["ink_di_aksen"], m["aksen"], TXT),
        (f"[{nama}] garis pembatas kedua vs halaman", m["garis_2"], bg, 1.0),
        (f"[{nama}] sintaks: keyword (aksen) di kotak kode", m["aksen"], bg2, TXT),
        (f"[{nama}] sintaks: string (good ink) di kotak kode", m["kinds"]["good"][2], bg2, TXT),
        (f"[{nama}] sintaks: angka (warn ink) di kotak kode", m["kinds"]["warn"][2], bg2, TXT),
        (f"[{nama}] sintaks: komentar (sekunder) di kotak kode", m["teks_2"], bg2, TXT),
    ]
    for k, (fill, edge, ink) in m["kinds"].items():
        rows += [
            (f"[{nama}][{k}] teks isi di fill", m["teks"], fill, TXT),
            (f"[{nama}][{k}] ink di fill", ink, fill, TXT),
            (f"[{nama}][{k}] ink di halaman", ink, bg, TXT),
            (f"[{nama}][{k}] edge vs fill", edge, fill, BIG),
            (f"[{nama}][{k}] edge vs halaman", edge, bg, BIG),
            (f"[{nama}][{k}] edge vs kotak", edge, bg2, BIG),
        ]

md = "--md" in sys.argv
fail = 0
if md:
    print("| Kombinasi | Teks | Latar | Rasio | Minimum | Hasil |\n|---|---|---|---|---|---|")
for name, fg, bg, need in rows:
    r = ratio(fg, bg)
    ok = r >= need
    fail += not ok
    if md:
        print(f"| {name} | `{fg}` | `{bg}` | {r:.2f}:1 | {need}:1 | {'Lolos' if ok else 'GAGAL'} |")
    else:
        print(f"{'OK  ' if ok else 'FAIL'} {r:5.2f} (≥{need}) {name}: {fg} on {bg}")
print(f"\n{len(rows) - fail}/{len(rows)} lolos")
sys.exit(1 if fail else 0)
