"""Rekam lab API Tahap 1: curl -i ke server Go (3 lapisan) + PostgreSQL 17 (skema t1).

Keluaran output/*.txt, satu file per halaman:
  b1-1-http, b1-2-error, b6-validasi, b5-1-token, b5-3-pemilik, c1-test
Header Date dihapus dari output supaya rekaman ulang mudah dibandingkan.
Jalankan: make -C labs/api-t1 run   (butuh: make -C labs/b3-race up, Go)
"""
import base64, json, os, pathlib, re, socket, subprocess, time

HERE = pathlib.Path(__file__).parent
OUT = HERE / "output"
URL = "http://127.0.0.1:18081"
DB = "postgres://lab:lab@127.0.0.1:54333/lab?search_path=t1&application_name=api-t1"
ENV = dict(os.environ, DATABASE_URL=DB, TOKEN_SECRET="rahasia-lab-lokal")
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db",
        "psql", "-U", "lab", "-d", "lab", "-q"]
BIN = HERE / "api-t1"
srv = None
log = []


def sql(q, tampil=True):
    out = subprocess.run(PSQL + ["-c", "SET search_path = t1; " + q], capture_output=True, text=True).stdout
    if tampil:
        log.append(f"$ psql -c \"{q}\"\n{out}")
    return out


def reset():
    subprocess.run(PSQL + ["-v", "ON_ERROR_STOP=1"], input=(HERE / "schema.sql").read_text(), capture_output=True, text=True, check=True)
    subprocess.run([str(BIN), "-seed"], env=ENV, check=True)


def pastikan_bebas(port):
    """Gagal keras bila port sudah dipakai: rekaman tidak boleh diam-diam diambil dari server lama."""
    try:
        socket.create_connection(("127.0.0.1", port), 0.2).close()
    except OSError:
        return
    raise SystemExit(f"GAGAL: port {port} sudah dipakai proses lain; hentikan dulu")


def mulai(*flag, env=None):
    global srv
    stop()
    pastikan_bebas(18081)
    srv = subprocess.Popen([str(BIN), *flag], env=env or ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for _ in range(100):
        try:
            socket.create_connection(("127.0.0.1", 18081), 0.2).close()
            break
        except OSError:
            time.sleep(0.05)
    log.append(f"# server: ./api-t1 {' '.join(flag)}".rstrip() + "\n")


def stop():
    global srv
    if srv:
        srv.terminate()
        keluaran = srv.communicate()[0]
        for l in keluaran.splitlines():
            log.append("server log: " + re.sub(r"^\d{4}/\d\d/\d\d \d\d:\d\d:\d\d ", "", l) + "\n")
        srv = None


def curl(method, path, body=None, token=None, label="<token Budi>", versi=None):
    cmd = ["curl", "-s", "-i", "-X", method, URL + path]
    shown = f"$ curl -i -X {method} {path}"
    if versi:
        cmd += ["-H", f"X-App-Version: {versi}"]
        shown += f" -H 'X-App-Version: {versi}'"
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
        shown += f" -H 'Authorization: Bearer {label}'"
    if body is not None:
        cmd += ["-H", "Content-Type: application/json", "-d", body]
        shown += f" -d '{body}'"
    r = subprocess.run(cmd, capture_output=True, text=True).stdout.replace("\r\n", "\n")
    r = "\n".join(l for l in r.splitlines() if not l.startswith("Date:"))
    log.append(shown + "\n" + r.rstrip() + "\n")
    m = re.search(r"\{.*\}\s*$", r, re.S)
    return json.loads(m.group(0)) if m else {}


def login(id, pin):
    return curl("POST", "/login", json.dumps({"id": id, "pin": pin})).get("token")


def simpan(nama):
    stop()
    # Signature token diganti placeholder: rekaman tidak menyimpan token yang bisa dipakai,
    # dan pemindai secret (gitleaks) tidak perlu dikecualikan. Header + payload tetap terlihat.
    teks = re.sub(r"(eyJ[\w-]+\.eyJ[\w-]+)\.[\w-]{20,}", r"\1.<signature>", "\n".join(log))
    if "<signature>" in teks:
        teks = "# Bagian signature token disensor sebagai <signature>.\n" + teks
    log[:] = [teks]
    (OUT / f"{nama}.txt").write_text(teks)
    print(f"== {nama}\n" + "\n".join(log))
    log.clear()


subprocess.run(["go", "build", "-o", str(BIN), "."], cwd=HERE, check=True)
OUT.mkdir(exist_ok=True)

# B1.1 · method, status, header
reset(); mulai()
t = login("budi", "123456")
curl("GET", "/akun/budi", token=t)
curl("POST", "/transfers", '{"ke":"ani","jumlah":70000}', token=t)
curl("POST", "/transfers", '{"ke":"ani","jumlah":70000}')
curl("POST", "/transfers", '{"ke":"ani","jumlah":"tujuh puluh ribu"}', token=t)
curl("DELETE", "/akun/budi", token=t)
curl("GET", "/akun/budi", token=t)
simpan("b1-1-http")

# B1.2 · format error
reset(); mulai()
t = login("budi", "123456")
curl("POST", "/transfers", '{"ke":"ani","jumlah":0}', token=t)
curl("POST", "/transfers", '{"ke":"cici","jumlah":10000}', token=t)
curl("POST", "/transfers", '{"ke":"ani","jumlah":150000}', token=t)
curl("GET", "/akun/cici", token=t)
simpan("b1-2-error")

# B6 · validasi berlapis
reset(); mulai()
t = login("budi", "123456")
curl("POST", "/transfers", '{"ke":"ani","jumlah":-70000}', token=t)
sql("SELECT id, saldo FROM akun ORDER BY id")
mulai("-tanpa-validasi")
curl("POST", "/transfers", '{"ke":"ani","jumlah":-70000}', token=t)
stop()
sql("ALTER TABLE transfer DROP CONSTRAINT transfer_jumlah_check")
mulai("-tanpa-validasi")
curl("POST", "/transfers", '{"ke":"ani","jumlah":-70000}', token=t)
sql("SELECT id, saldo FROM akun ORDER BY id")
simpan("b6-validasi")

# B5.1 · token
reset(); mulai()
login("budi", "000000")
t = login("budi", "123456")
h, p, s = t.split(".")
dec = lambda x: base64.urlsafe_b64decode(x + "=" * (-len(x) % 4)).decode()
log.append(f"# isi token (base64url, bisa dibaca siapa saja):\nheader : {dec(h)}\npayload: {dec(p)}\n")
curl("GET", "/akun/budi", token=t)
palsu = json.loads(dec(p)); palsu["sub"] = "ani"
p2 = base64.urlsafe_b64encode(json.dumps(palsu, separators=(",", ":")).encode()).decode().rstrip("=")
log.append(f"# payload diubah jadi {json.dumps(palsu, separators=(',', ':'))}, signature lama dipakai ulang:\n")
curl("GET", "/akun/ani", token=f"{h}.{p2}.{s}", label="<token palsu: sub=ani>")
none = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip("=")
log.append("# header diubah jadi {\"alg\":\"none\"}, tanpa signature:\n")
curl("GET", "/akun/ani", token=f"{none}.{p2}.", label="<token palsu: alg=none>")
mulai("-umur-token", "2s")
t = login("budi", "123456")
log.append("# token berumur 2 detik, ditunggu 3 detik:\n")
time.sleep(3)
curl("GET", "/akun/budi", token=t, label="<token Budi, kedaluwarsa>")
simpan("b5-1-token")

# B5.3 · ownership
reset(); mulai()
t = login("budi", "123456")
curl("GET", "/akun/budi", token=t)
curl("GET", "/akun/ani", token=t)
mulai("-tanpa-cek-pemilik")
curl("GET", "/akun/ani", token=t)
simpan("b5-3-pemilik")

# E1 · versi app
reset(); mulai(env=dict(ENV, VERSI_MINIMUM="1.5.0", VERSI_DISARANKAN="1.6.0"))
log.append("# server dijalankan dengan VERSI_MINIMUM=1.5.0 VERSI_DISARANKAN=1.6.0\n")
curl("GET", "/config", versi="1.4.2")
t = login("budi", "123456")
for v in ("1.4.2", "1.5.0", "1.5.0", "1.6.0", "1.6.0", "1.6.0"):
    subprocess.run(["curl", "-s", "-o", "/dev/null", "-H", f"X-App-Version: {v}", "-H", f"Authorization: Bearer {t}", URL + "/akun/budi"])
log.append("# 6 request GET /akun/budi dari versi 1.4.2, 1.5.0 (2x), 1.6.0 (3x), tidak ditampilkan\n")
curl("GET", "/metrics/versi-app")
simpan("e1-versi")

# C1 · test
reset()
def gotest(args, env, judul):
    r = subprocess.run(["go", "test", *args], cwd=HERE, env=env, capture_output=True, text=True)
    out = re.sub(r"\((\d+\.\d+)s\)", "(…s)", r.stdout + r.stderr)
    out = re.sub(r"(ok|FAIL)(\s+)lab/apit1\t[\d.]+s", r"\1\2lab/apit1\t…s", out)
    log.append(f"{judul}\n$ " + " ".join(["go", "test", *args]) + "\n" + out)
gotest(["-v", "-count=1", "./..."], ENV, "# Semua test, implementasi UPDATE atomik:")
simpan("c1-test")
reset()
gotest(["-count=1", "-run", "TestDuaTransferBersamaan", "-v", "./..."], ENV, "# Regression test race, implementasi UPDATE atomik:")
gotest(["-count=1", "-run", "TestDuaTransferBersamaan", "-v", "./..."], dict(ENV, DATA_NAIF="1"),
       "# Test yang sama, implementasi baca-hitung-tulis (DATA_NAIF=1):")
simpan("c1-race")
