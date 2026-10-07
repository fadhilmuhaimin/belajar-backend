"""Satu-satunya sumber warna untuk gambar DAN situs (docs/stylesheets/extra.css
memakai nilai yang sama). Cek kontras: python tools/contrast.py

Setiap warna bermakna punya tiga peran:
  fill = isi kotak / latar
  edge = garis tepi (≥ 3:1 terhadap fill dan putih)
  ink  = teks berwarna di atas fill atau putih (≥ 4.5:1)
"""
KINDS = {
    #          fill       edge       ink
    "system": ("#E4F0FF", "#0075EB", "#0041C2"),  # biru: sistem / konsep / komponen
    "good":   ("#DEFFF8", "#0F766E", "#0F766E"),  # mint: cara benar / sesudah
    "warn":   ("#FFF4E6", "#D26B00", "#9A4C00"),  # oranye: perhatian / bahaya produksi
    "old":    ("#F3F4F7", "#6B7280", "#51565E"),  # abu: sebelum / lama / netral
}
# Nama lama (sebelum design system minimalis) tetap diterima
ALIASES = {"focus": "warn", "danger": "warn", "wait": "old"}

TEXT = "#111827"       # teks utama
TEXT_2 = "#51565E"     # teks sekunder, caption, label
LINE_UI = "#E4E4E4"    # garis dekoratif (kartu, tabel)
LINE_UI_2 = "#CBD5E1"  # garis dekoratif kedua
FIG_LINE = "#6B7280"   # panah dan garis bermakna di gambar (≥ 3:1)
FIG_PANEL = "#7C8594"  # garis putus-putus pengelompokan di gambar (≥ 3:1)
BG = "#FFFFFF"
BG_BLOCK = "#F8FAFC"
BG_BLOCK_2 = "#F3F4F7"
PRIMARY = "#0075EB"    # aksen, garis tepi, elemen besar (bukan teks kecil)
LINK = "#0041C2"       # teks link
NAVY = "#051027"       # header situs
ACCENT_ORANGE = "#FF9010"  # dekoratif saja, TIDAK untuk teks/garis bermakna
