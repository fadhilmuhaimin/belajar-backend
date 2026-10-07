"""Lab B7.2: batas modul di satu codebase dan satu database. Keluaran: output/batas.txt

A. Struktur yang sesuai batas: go build lolos.
B. Modul katalog mengimpor detail internal modul pembayaran.
C. Modul pembayaran mengimpor modul pesanan, padahal pesanan sudah mengimpor pembayaran.
D. Modul pesanan membaca tabel milik modul pembayaran langsung (role database per modul).
E. Modul pesanan membaca tabelnya sendiri.
Jalankan: make -C labs/b3-race up && python run.py
"""
import pathlib, subprocess

HERE = pathlib.Path(__file__).parent
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db", "psql", "-q"]
out = []


def jalankan(judul, cmd, **kw):
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, **kw)
    teks = (r.stdout + r.stderr).strip() or "(tidak ada output: lolos)"
    out.append(f"== {judul}\n$ {' '.join(cmd) if isinstance(cmd, list) else cmd}\n{teks}\nexit {r.returncode}\n")


def tulis_sementara(path, isi):
    p = HERE / path
    p.write_text(isi)
    return p


jalankan("A. Semua modul memakai API publik", ["go", "build", "./..."])

p = tulis_sementara("modul/katalog/promo.go", 'package katalog\n\nimport "rekeningo/modul/pembayaran/internal/gateway"\n\n'
                    '// Diskon langsung ditagih lewat gateway, melewati modul pembayaran.\n'
                    'func TagihDiskon() { gateway.Tagih("promo", 1000) }\n')
jalankan("B. katalog mengimpor rekeningo/modul/pembayaran/internal/gateway", ["go", "build", "./..."])
p.unlink()

p = tulis_sementara("modul/pembayaran/status.go", 'package pembayaran\n\nimport "rekeningo/modul/pesanan"\n\n'
                    '// Pembayaran ingin menandai pesanan lunas dengan memanggil modul pesanan langsung.\n'
                    'var _ = pesanan.Checkout\n')
jalankan("C. pembayaran mengimpor pesanan (pesanan sudah mengimpor pembayaran)", ["go", "build", "./..."])
p.unlink()

subprocess.run(PSQL + ["-U", "lab", "-d", "lab"], input=(HERE / "schema.sql").read_text(), text=True, check=True, capture_output=True)
q = "SELECT p.id, t.id AS transaksi FROM pesanan.pesanan p JOIN pembayaran.transaksi t ON t.pesanan_id = p.id;"
jalankan("D. modul pesanan (role modul_pesanan) membaca tabel pembayaran.transaksi", PSQL + ["-U", "modul_pesanan", "-d", "lab", "-c", q])
jalankan("E. modul pesanan membaca tabel miliknya sendiri", PSQL + ["-U", "modul_pesanan", "-d", "lab", "-c", "SELECT id, total FROM pesanan.pesanan;"])

teks = "\n".join(out).replace(" ".join(PSQL), "psql")
(HERE / "output/batas.txt").write_text(teks)
print(teks)
