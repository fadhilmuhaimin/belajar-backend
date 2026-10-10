"""Ukur konteks per iterasi loop otomatis dari log stream-json (keputusan 235).

Konteks satu panggilan API = input_tokens + cache_creation_input_tokens + cache_read_input_tokens dari
`message.usage` event `assistant` di thread utama (parent_tool_use_id kosong). Satu pesan bisa dipancarkan
beberapa event (satu per blok isi) dengan usage yang sama, jadi dihitung sekali per message.id.

    python3 tools/ukur_konteks.py log/otomatis-2026-10-10/*.log      # tabel Markdown, satu baris per log
    python3 tools/ukur_konteks.py --batas 150000 <log...>            # ambang kolom "> batas" (bawaan 150000)
    python3 tools/ukur_konteks.py --cek-baris plan/MEMORI.md:80 ...  # exit 1 bila file melewati batas baris
                                                                     # (dipanggil tools/cek_situs.sh)
Log bisa stream-json loop lama atau transcript JSONL sesi/subagen (~/.claude/projects/<proyek>/...).

Kolom:
  awal      konteks panggilan pertama (sebelum langkah pertama: system prompt, alat, CLAUDE.md + impor, hook)
  puncak    konteks terbesar di thread utama
  panggilan jumlah panggilan API thread utama
  diproses  jumlah konteks semua panggilan thread utama (token input yang diproses ulang tiap langkah)
  > batas   bagian `diproses` dari panggilan yang konteksnya melewati ambang
  subagen   jumlah konteks panggilan subagen (thread lain, konteksnya sendiri)
  tugas     baris "Iterasi selesai: <id> <status>" dari event result, bila ada
"""
import json
import pathlib
import re
import sys


def ukur(berkas):
    utama, sub, keluar = {}, {}, {}
    tugas = ""
    for baris in open(berkas, encoding="utf-8", errors="replace"):
        try:
            e = json.loads(baris)
        except ValueError:
            continue
        if e.get("type") == "result":
            m = re.search(r"Iterasi selesai: (\S+) (\S+)", str(e.get("result") or ""))
            tugas = f"{m.group(1)} {m.group(2)}" if m else (str(e.get("result") or "")[:40].replace("\n", " "))
        if e.get("type") != "assistant":
            continue
        pesan = e.get("message") or {}
        u = pesan.get("usage") or {}
        kunci = pesan.get("id") or id(e)
        konteks = u.get("input_tokens", 0) + u.get("cache_creation_input_tokens", 0) + u.get("cache_read_input_tokens", 0)
        (sub if e.get("parent_tool_use_id") else utama)[kunci] = konteks
        keluar[kunci] = max(keluar.get(kunci, 0), u.get("output_tokens", 0))
    nilai = list(utama.values())
    return {
        "awal": nilai[0] if nilai else 0,
        "puncak": max(nilai) if nilai else 0,
        "panggilan": len(nilai),
        "diproses": sum(nilai),
        "subagen": sum(sub.values()),
        "output": sum(keluar.values()),
        "nilai": nilai,
        "tugas": tugas,
    }


def ribu(n):
    return f"{n / 1000:.0f}k" if n >= 1000 else str(n)


def cek_baris(pasangan):
    gagal = 0
    for p in pasangan:
        berkas, batas = p.rsplit(":", 1)
        n = sum(1 for _ in open(berkas, encoding="utf-8"))
        if n > int(batas):
            print(f"GAGAL: {berkas} {n} baris, batas {batas}; pindahkan yang lama ke plan/PELAJARAN-ARSIP.md")
            gagal = 1
        else:
            print(f"{berkas}: {n}/{batas} baris")
    return gagal


def main(argv):
    if argv[:1] == ["--cek-baris"]:
        return cek_baris(argv[1:])
    batas = 150000
    if "--batas" in argv:
        i = argv.index("--batas")
        batas = int(argv[i + 1])
        del argv[i : i + 2]
    berkas = sorted(argv, key=lambda p: [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", pathlib.Path(p).name)])
    if not berkas:
        print(__doc__)
        return 1
    print(f"| log | tugas | awal | puncak | panggilan | diproses | > {ribu(batas)} | subagen |")
    print("|---|---|--:|--:|--:|--:|--:|--:|")
    total = {"diproses": 0, "lewat": 0, "subagen": 0, "panggilan": 0}
    for p in berkas:
        h = ukur(p)
        if not h["panggilan"]:
            continue
        lewat = sum(n for n in h["nilai"] if n > batas)
        total["diproses"] += h["diproses"]
        total["lewat"] += lewat
        total["subagen"] += h["subagen"]
        total["panggilan"] += h["panggilan"]
        persen = f"{100 * lewat / h['diproses']:.0f}%" if h["diproses"] else "-"
        print(f"| {pathlib.Path(p).name} | {h['tugas']} | {ribu(h['awal'])} | {ribu(h['puncak'])} | {h['panggilan']} "
              f"| {ribu(h['diproses'])} | {persen} | {ribu(h['subagen'])} |")
    if total["diproses"]:
        print(f"\nTotal: {total['panggilan']} panggilan thread utama, {total['diproses'] / 1e6:.1f} juta token diproses, "
              f"{100 * total['lewat'] / total['diproses']:.0f}% dari panggilan dengan konteks > {ribu(batas)}; "
              f"subagen {total['subagen'] / 1e6:.1f} juta.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
