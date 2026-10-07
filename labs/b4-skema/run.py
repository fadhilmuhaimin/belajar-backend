"""Lab B4.2: expand → migrate → contract vs rename langsung, di PostgreSQL 17 + parser Dart app v1.4.

Keluaran: output/expand-contract.txt, output/rename-langsung.txt
Jalankan: make -C labs/b4-skema run   (butuh: make -C labs/b3-race up, Dart)
"""
import pathlib, subprocess, json, re

HERE = pathlib.Path(__file__).parent
OUT = HERE / "output"
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db",
        "psql", "-U", "lab", "-d", "lab", "-e", "-v", "ON_ERROR_STOP=0"]


def psql(file):
    sql = (HERE / "sql" / file).read_text()
    # Skema terpisah (b4) supaya tidak bentrok dengan tabel lab lain di database yang sama.
    r = subprocess.run(PSQL, input="SET search_path = b4;\n" + sql, text=True,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)  # urutan error = urutan statement
    out = r.stdout
    out = out.replace("SET search_path = b4;\nSET\n", "")
    return f"-- {file}\n{out}\n"


def app_v14(response):
    r = subprocess.run(["dart", "run", "app/profil_v14.dart", response], cwd=HERE, capture_output=True, text=True)
    out = (r.stdout + r.stderr).strip()
    # Ambil baris pesan error yang relevan saja (tanpa stack trace panjang).
    baris = [l for l in out.splitlines() if l.startswith("app v1.4") or "Unhandled exception" in l or "is not a subtype" in l]
    return f"$ dart run app/profil_v14.dart '{response}'\n" + "\n".join(baris) + f"\n(exit code {r.returncode})\n\n"


def json_dari(teks):
    m = re.findall(r"^\s*(\{.*\})\s*$", teks, re.M)
    return m[-1]


OUT.mkdir(exist_ok=True)
psql("00-awal.sql")
t = ""
for f in ("10-expand.sql", "20-tulis-dua.sql", "30-backfill.sql", "40-baca-baru.sql"):
    t += psql(f)
t += app_v14(json_dari(t))
t += psql("50-contract.sql")
(OUT / "expand-contract.txt").write_text(t)
print(t)

psql("00-awal.sql")
v = psql("90-rename.sql")
v += app_v14(json_dari(v))
(OUT / "rename-langsung.txt").write_text(v)
print(v)
