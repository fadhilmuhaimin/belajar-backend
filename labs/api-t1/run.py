"""Rekam lab API Tahap 1 versi naskah (keputusan 132): curl -i ke server Go + PostgreSQL 17 (schema tahap1).

Setiap halaman Tahap 1 yang memakai lab ini mendapat satu file di output/. Database dibuat ulang dari nol
setiap kali dijalankan. Header Date dan token acak disamarkan supaya rekaman ulang mudah dibandingkan.
Lab gagal keras bila port sudah dipakai, atau bila hasilnya tidak sesuai yang diharapkan (keputusan 79, 95).

    make -C labs/api-t1 run      (butuh: Docker, Go; PostgreSQL dijalankan lewat labs/b3-race)
"""
import hashlib, json, os, pathlib, re, socket, subprocess, sys, time

HERE = pathlib.Path(__file__).parent
OUT = HERE / "output"
PORT = 18083
URL = f"http://127.0.0.1:{PORT}"
DB = "postgres://lab:lab@127.0.0.1:54333/lab?search_path=tahap1&application_name=api-t1"
ENV = dict(os.environ, DATABASE_URL=DB)
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db",
        "psql", "-U", "lab", "-d", "lab", "-q"]
BIN = HERE / "api-t1"
srv = None
log = []
samaran = {}


def gagal(pesan):
    stop()
    raise SystemExit("GAGAL: " + pesan)


def samarkan(teks):
    for asli, label in samaran.items():
        teks = teks.replace(asli, label)
    return teks


def sql(q):
    r = subprocess.run(PSQL + ["-v", "ON_ERROR_STOP=1", "-c", "SET search_path = tahap1; " + q],
                       capture_output=True, text=True)
    if r.returncode:
        gagal(r.stderr)
    log.append(f"$ psql -c \"{q}\"\n{samarkan(r.stdout)}")
    return r.stdout


def reset():
    subprocess.run(PSQL + ["-v", "ON_ERROR_STOP=1"], input=(HERE / "schema.sql").read_text(),
                   capture_output=True, text=True, check=True)
    subprocess.run([str(BIN), "-seed"], env=ENV, check=True)


def pastikan_bebas(port):
    """Rekaman tidak boleh diam-diam diambil dari server lama yang masih memegang port."""
    try:
        socket.create_connection(("127.0.0.1", port), 0.2).close()
    except OSError:
        return
    gagal(f"port {port} sudah dipakai proses lain; hentikan dulu")


def mulai(*flag):
    global srv
    stop()
    pastikan_bebas(PORT)
    srv = subprocess.Popen([str(BIN), *flag], env=ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for _ in range(100):
        try:
            socket.create_connection(("127.0.0.1", PORT), 0.2).close()
            break
        except OSError:
            time.sleep(0.05)
    else:
        gagal("server tidak mau menyala")
    log.append(f"# server: ./api-t1 {' '.join(flag)}".rstrip() + "\n")


def stop():
    global srv
    if srv:
        srv.terminate()
        for l in srv.communicate()[0].splitlines():
            if "mendengar di" not in l:
                log.append("server log: " + re.sub(r"^\d{4}/\d\d/\d\d \d\d:\d\d:\d\d ", "", l) + "\n")
        srv = None


def curl(method, path, body=None, token=None):
    cmd = ["curl", "-s", "-i", "-X", method, URL + path]
    tampil = f"$ curl -i -X {method} {path}"
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
        tampil += f" -H 'Authorization: Bearer {samarkan(token)}'"
    if body is not None:
        cmd += ["-H", "Content-Type: application/json", "-d", body]
        tampil += f" -d '{body}'"
    r = subprocess.run(cmd, capture_output=True, text=True).stdout.replace("\r\n", "\n")
    r = "\n".join(l for l in r.splitlines() if not l.startswith(("Date:", "Content-Length:")))
    status = int(r.split()[1]) if r.startswith("HTTP/") else 0
    badan = r.split("\n\n", 1)[1] if "\n\n" in r else ""
    log.append(f"{tampil}\n{samarkan(r)}\n")
    return status, badan


def harap(nyata, harus, apa):
    if nyata != harus:
        gagal(f"{apa}: dapat {nyata!r}, harus {harus!r}")


def bagian(judul):
    log.append(f"\n# --- {judul} ---\n")


def tulis(nama):
    stop()
    OUT.mkdir(exist_ok=True)
    (OUT / nama).write_text("".join(log))
    print("ditulis:", (OUT / nama).relative_to(HERE.parent.parent))
    log.clear()


def rekam_login():
    """1.7 Fitur: login karyawan."""
    reset()
    mulai()
    bagian("A. Budi login dengan email perusahaan dan password sementara")
    s, b = curl("POST", "/login", '{"email": "budi@lestari.example", "password": "sementara-419"}')
    harap(s, 200, "login Budi")
    token = json.loads(b)["token"]
    harap(len(token), 64, "panjang token (32 byte acak, hex)")
    samaran[token] = "<token sesi Budi>"
    log[-1] = samarkan(log[-1])

    bagian("B. Password salah, dan email yang tidak terdaftar: jawabannya sama")
    s1, b1 = curl("POST", "/login", '{"email": "budi@lestari.example", "password": "tebakan"}')
    s2, b2 = curl("POST", "/login", '{"email": "tidak.ada@lestari.example", "password": "tebakan"}')
    harap((s1, s2), (401, 401), "status login gagal")
    harap(b1, b2, "body login gagal harus sama")

    bagian("C. Database hanya menyimpan SHA-256 dari token, bukan token yang dipegang HP Budi")
    hash16 = hashlib.sha256(token.encode()).hexdigest()[:16]
    samaran[hash16] = "<16 karakter awal SHA-256 token Budi>"
    hasil = sql("SELECT akun_id, left(token_hash, 16) AS token_hash, kedaluwarsa - now() > interval '7 hours 59 minutes' AS masih_8_jam FROM sesi")
    if token[:16] in hasil or hash16 not in hasil:
        gagal("tabel sesi harus berisi SHA-256 token, bukan token aslinya")

    bagian("D. Request dengan sesi Budi, dan tanpa sesi")
    s, b = curl("GET", "/akun/419", token=token)
    harap((s, json.loads(b)["nama"]), (200, "Budi"), "lihat akun sendiri")
    s, _ = curl("GET", "/akun/419")
    harap(s, 401, "tanpa sesi")

    bagian("E. Logout mematikan sesi di server; token yang sama ditolak")
    s, _ = curl("POST", "/logout", token=token)
    harap(s, 204, "logout")
    s, _ = curl("GET", "/akun/419", token=token)
    harap(s, 401, "token setelah logout")
    sql("SELECT count(*) AS sesi_tersisa FROM sesi")
    tulis("login.txt")


if __name__ == "__main__":
    subprocess.run(["go", "build", "-o", str(BIN), "./cmd/api"], cwd=HERE, check=True)
    pilihan = sys.argv[1:] or ["login"]
    for p in pilihan:
        globals()["rekam_" + p.replace("-", "_")]()
