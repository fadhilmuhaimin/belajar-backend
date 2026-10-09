"""Periksa arah import antar lapisan lab api-t1 (keputusan 165). Pustaka standar saja.

    python3 cek_arah.py        keluar 1 bila ada lapisan yang mengimpor paket terlarang

Daftar import dibaca dari `go list`, jadi yang diperiksa adalah kode yang benar-benar dikompilasi.
"""
import json, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).parent
MODUL = "lab/apit1/internal/"

# --8<-- [start:aturan]
# Lapisan -> import yang dilarang. Handler tidak tahu SQL, service tidak tahu HTTP, repo tidak tahu aturan uang.
DILARANG = {
    "handler": ["database/sql", MODUL + "repo"],
    "service": ["net/http", "encoding/json", "database/sql"],
    "repo":    ["net/http", "encoding/json", MODUL + "service", MODUL + "handler"],
}
# --8<-- [end:aturan]


def main():
    r = subprocess.run(["go", "list", "-json", "./internal/..."], cwd=HERE, capture_output=True, text=True, check=True)
    paket = json.loads("[" + r.stdout.replace("}\n{", "},\n{") + "]")
    salah = 0
    for p in paket:
        lapisan = p["ImportPath"].removeprefix(MODUL)
        langgar = [i for i in p.get("Imports", []) if i in DILARANG.get(lapisan, [])]
        for i in langgar:
            print(f"{lapisan}: mengimpor {i.removeprefix(MODUL)} (dilarang)")
        salah += len(langgar)
        if not langgar:
            print(f"{lapisan}: lolos")
    return 1 if salah else 0


if __name__ == "__main__":
    sys.exit(main())
