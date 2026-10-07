"""Rekam lab Tahap 3. Keluaran:
  output/pool-dalam-tx.txt   17 RPS, notifikasi 2 detik di dalam transaction, pool 10
  output/pool-outbox.txt     beban sama, notifikasi lewat outbox + worker
  output/worker-retry.txt    layanan notifikasi gagal 7 kali pertama: retry, backoff, dead-letter
Jalankan: make -C labs/t3-bayar run   (butuh: make -C labs/b3-race up, Go)
"""
import json, os, pathlib, re, socket, subprocess, time, urllib.request

HERE = pathlib.Path(__file__).parent
OUT = HERE / "output"
ENV = dict(os.environ, DATABASE_URL="postgres://lab:lab@127.0.0.1:54333/lab?search_path=t3&application_name=t3")
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db", "psql", "-U", "lab", "-d", "lab", "-q"]
proses = []


def build():
    for p in ("api", "notif", "beban"):
        subprocess.run(["go", "build", "-o", str(HERE / f"bin/{p}"), f"./{p}"], cwd=HERE, check=True)


def jalan(nama, *args):
    p = subprocess.Popen([str(HERE / f"bin/{nama}"), *args], env=ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    proses.append(p)
    return p


def tunggu(port):
    for _ in range(100):
        try:
            socket.create_connection(("127.0.0.1", port), 0.2).close(); return
        except OSError:
            time.sleep(0.05)


def henti(p):
    p.terminate(); out = p.communicate()[0]; proses.remove(p); return out


def sql(q):
    return subprocess.run(PSQL + ["-c", "SET search_path = t3; " + q], capture_output=True, text=True).stdout


def reset():
    subprocess.run(PSQL, input=(HERE / "skema.sql").read_text(), capture_output=True, text=True, check=True)


def pool():
    return urllib.request.urlopen("http://127.0.0.1:18083/debug/pool").read().decode().strip()


def contoh_log(teks, kata, n=1):
    baris = [l for l in teks.splitlines() if kata in l]
    return "\n".join(baris[:n])


build(); OUT.mkdir(exist_ok=True)

for mode in ("dalam-tx", "outbox"):
    reset()
    nt = jalan("notif", "-jeda", "2s"); tunggu(18090)
    api = jalan("api", "-mode", mode); tunggu(18083)
    wk = jalan("api", "-worker") if mode == "outbox" else None
    t0 = time.monotonic()
    beban = subprocess.run([str(HERE / "bin/beban"), "-rps", "17", "-durasi", "10s"], capture_output=True, text=True).stdout
    st = pool()
    log = [f"# mode {mode} · pool 10 koneksi · layanan notifikasi 2 detik per kiriman",
           f"$ beban -rps 17 -durasi 10s", beban.strip(), "", "$ curl /debug/pool", st]
    if wk:
        for _ in range(60):
            if "menunggu" not in sql("SELECT status, count(*) FROM outbox GROUP BY 1"):
                break
            time.sleep(0.5)
        log += ["", f"# worker selesai mengirim semua notifikasi ±{time.monotonic() - t0:.0f} detik setelah beban dimulai",
                "$ psql -c \"SELECT status, count(*) FROM outbox GROUP BY 1\"", sql("SELECT status, count(*) FROM outbox GROUP BY 1").rstrip()]
        henti(wk)
    keluaran = henti(api)
    henti(nt)
    lambat = [l for l in keluaran.splitlines() if '"msg":"bayar"' in l]
    lambat.sort(key=lambda l: -json.loads(l)["durasi_ms"])
    log += ["", "# contoh log terstruktur dari API (request paling lambat yang berhasil):", lambat[0] if lambat else "(tidak ada)"]
    gagal = contoh_log(keluaran, "bayar gagal")
    if gagal:
        log += ["# contoh log request yang gagal:", gagal]
    teks = "\n".join(log) + "\n"
    (OUT / f"pool-{mode}.txt").write_text(teks)
    print(teks)

# Worker: retry, backoff, dead-letter
reset()
nt = jalan("notif", "-jeda", "200ms", "-gagal-dulu", "7"); tunggu(18090)
sql("""INSERT INTO outbox (jenis, data) SELECT 'pembayaran_berhasil', jsonb_build_object('pembayaran_id', g) FROM generate_series(1, 3) g""")
wk = jalan("api", "-worker")
for _ in range(80):
    if "menunggu" not in sql("SELECT status FROM outbox"):
        break
    time.sleep(0.5)
keluaran = henti(wk); henti(nt)
log = ["# layanan notifikasi menjawab 503 untuk 7 kiriman pertama · 3 pesan di outbox · maks 3 percobaan",
       "# log worker (JSON, waktu dihapus):"]
for l in keluaran.splitlines():
    if l.startswith("{"):
        d = json.loads(l); d.pop("time", None); log.append(json.dumps(d, ensure_ascii=False))
log += ["", "$ psql -c \"SELECT id, status, percobaan, error_akhir FROM outbox ORDER BY id\"",
        sql("SELECT id, status, percobaan, error_akhir FROM outbox ORDER BY id").rstrip()]
teks = "\n".join(log) + "\n"
(OUT / "worker-retry.txt").write_text(teks)
print(teks)
