"""Lab E3: rekam client Dart (retry) → server Go → PostgreSQL 17, dua mode.

Keluaran: output/kunci-sama.txt, output/kunci-baru.txt
Jalankan: make -C labs/e3-idempotency run   (butuh: make -C labs/b3-race up, Go, Dart)
"""
import pathlib, socket, subprocess, time, os

HERE = pathlib.Path(__file__).parent
OUT = HERE / "output"
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db",
        "psql", "-U", "lab", "-d", "lab", "-q"]
ENV = dict(os.environ, DATABASE_URL="postgres://lab:lab@127.0.0.1:54333/lab?application_name=e3")


def psql(sql):
    return subprocess.run(PSQL + ["-c", sql], capture_output=True, text=True, check=True).stdout


def tunggu_port():
    for _ in range(100):
        try:
            socket.create_connection(("127.0.0.1", 18080), 0.2).close()
            return
        except OSError:
            time.sleep(0.1)
    raise SystemExit("server tidak jalan")


subprocess.run(["go", "build", "-o", str(HERE / "server/e3-server"), "."], cwd=HERE / "server", check=True)
OUT.mkdir(exist_ok=True)
for mode in ("kunci-sama", "kunci-baru"):
    subprocess.run(PSQL, input=(HERE / "schema.sql").read_text(), text=True, check=True, capture_output=True)
    srv = subprocess.Popen([str(HERE / "server/e3-server"), "-lambat-pertama"], env=ENV,
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    tunggu_port()
    cl = subprocess.run(["dart", "run", "client/bayar.dart", mode], cwd=HERE, capture_output=True, text=True)
    time.sleep(1.8)  # biarkan server selesai menulis log response yang ditahan
    srv.terminate()
    log_srv = srv.communicate()[0]
    baris = sorted([l for l in (cl.stdout + log_srv).splitlines() if l.strip()], key=lambda l: 0)
    db = psql("SELECT id, saldo FROM akun ORDER BY id; SELECT id, akun, toko, jumlah FROM pembayaran ORDER BY id;"
              "SELECT key, status_code, body FROM idempotency_key ORDER BY dibuat;")
    teks = (f"$ dart run client/bayar.dart {mode}    # server: e3-server -lambat-pertama\n\n"
            "-- client (Dart 3, timeout 1 detik)\n" + cl.stdout +
            "\n-- server (Go, log per request)\n" + log_srv +
            "\n-- PostgreSQL 17 sesudahnya\n" + db)
    (OUT / f"{mode}.txt").write_text(teks)
    print(teks)
