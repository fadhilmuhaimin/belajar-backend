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


def curl(method, path, body=None, token=None, jenis="application/json", tampil_body=None):
    """tampil_body: teks yang ditampilkan di rekaman sebagai ganti body panjang (mis. CSV 100 baris)."""
    cmd = ["curl", "-s", "-i", "-X", method, URL + path]
    tampil = f"$ curl -i -X {method} '{path}'"
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
        tampil += f" -H 'Authorization: Bearer {samarkan(token)}'"
    if body is not None:
        cmd += ["-H", f"Content-Type: {jenis}", "--data-binary", body]
        if jenis != "application/json":
            tampil += f" -H 'Content-Type: {jenis}'"
        tampil += f" --data-binary {tampil_body}" if tampil_body else f" -d '{body}'"
    r = subprocess.run(cmd, capture_output=True, text=True).stdout.replace("\r\n", "\n")
    r = "\n".join(l for l in r.splitlines() if not l.startswith(("Date:", "Content-Length:")))
    status = int(r.split()[1]) if r.startswith("HTTP/") else 0
    badan = r.split("\n\n", 1)[1] if "\n\n" in r else ""
    log.append(f"{tampil}\n{samarkan(r)}\n")
    return status, badan


def login(email, password, label):
    s, b = curl("POST", "/login", json.dumps({"email": email, "password": password}))
    harap(s, 200, f"login {email}")
    token = json.loads(b)["token"]
    samaran[token] = label
    log[-1] = samarkan(log[-1])
    return token


def log_statement(sejak):
    """Statement yang diterima PostgreSQL dari lab ini sejak waktu tertentu (log_statement=all di labs/b3-race)."""
    r = subprocess.run(["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "logs", "--no-log-prefix",
                        "--since", sejak, "db"], capture_output=True, text=True).stdout
    out = []
    for l in r.splitlines():
        if "api-t1|" not in l:
            continue
        m = re.search(r"(?:statement|execute [^:]*): (.*)$", l)
        if m:
            out.append(m.group(1).strip())
    return out


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


def csv_minggu(nominal, ubah=None):
    """CSV top-up 100 karyawan; ubah = {nomor_baris_file: (email, nominal)} untuk baris yang sengaja salah."""
    baris = ["email,nominal"]
    for id_ in range(401, 502):
        if id_ == 418:
            continue
        email = {417: "dimas@lestari.example", 419: "budi@lestari.example"}.get(id_, f"karyawan{id_}@lestari.example")
        baris.append(f"{email},{nominal}")
    for no, (e, n) in (ubah or {}).items():
        baris[no - 1] = f"{e},{n}"
    harap(len(baris), 101, "CSV berisi header + 100 baris")
    return "\n".join(baris) + "\n"


def rekam_topup():
    """1.8 Fitur: top-up oleh admin."""
    reset()
    mulai()
    bagian("A. Admin tunjangan login")
    admin = login("admin.tunjangan@lestari.example", "sementara-400", "<token sesi admin>")

    bagian("B. Senin minggu 1: admin mengunggah CSV 100 karyawan, Rp250.000 per orang")
    csv1 = csv_minggu(250000)
    log.append("$ head -4 minggu-1.csv\n" + "\n".join(csv1.splitlines()[:4]) + "\n... (100 baris + header)\n\n")
    sejak = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 1))
    s, b = curl("POST", "/topup?keterangan=Tunjangan%20makan%20minggu%201", csv1, token=admin, jenis="text/csv",
                tampil_body="@minggu-1.csv")
    harap((s, json.loads(b)), (200, {"akun": 100, "total": 25000000}), "top-up minggu 1")

    bagian("C. Isi database sesudahnya: 100 saldo terisi, setiap perubahan punya catatan")
    hasil = sql("SELECT count(*) AS karyawan, sum(saldo) AS total_saldo FROM akun WHERE jenis = 'karyawan'")
    if "25000000" not in hasil:
        gagal("total saldo karyawan harus 25000000")
    sql("SELECT t.id, a.nama, t.nominal, t.admin_id, t.keterangan FROM topup t JOIN akun a ON a.id = t.akun_id ORDER BY t.id LIMIT 3")

    bagian("D. Yang diterima PostgreSQL dari api-t1 selama upload: satu transaction")
    st = log_statement(sejak)
    jumlah = lambda awal: sum(1 for x in st if x.lower().startswith(awal))
    ringkas = [f"begin                      : {jumlah('begin')}",
               f"UPDATE akun SET saldo ... : {jumlah('update akun')}",
               f"INSERT INTO topup ...     : {jumlah('insert into topup')}",
               f"commit                     : {jumlah('commit')}"]
    harap((jumlah("begin"), jumlah("update akun"), jumlah("insert into topup"), jumlah("commit")), (1, 100, 100, 1),
          "isi transaction top-up")
    urut = [x.split()[0].lower() for x in st
            if x.lower().startswith(("begin", "commit", "update akun", "insert into topup"))]
    harap((urut[0], urut[-1]), ("begin", "commit"), "begin di awal, commit di akhir")
    log.append("$ docker compose logs db | grep 'api-t1|'   (diringkas)\n" + "\n".join(ringkas) + "\n\n")

    bagian("E. Minggu 2: CSV dengan dua baris salah ditolak utuh")
    csv2 = csv_minggu(250000, {58: ("karyawan458@lestari.exmaple", 250000), 81: ("karyawan481@lestari.example", "250rb")})
    log.append("$ sed -n '58p;81p' minggu-2.csv\n" + "\n".join(csv2.splitlines()[57:58] + csv2.splitlines()[80:81]) + "\n\n")
    s, b = curl("POST", "/topup?keterangan=Tunjangan%20makan%20minggu%202", csv2, token=admin, jenis="text/csv",
                tampil_body="@minggu-2.csv")
    harap((s, [e["baris"] for e in json.loads(b)["errors"]]), (422, [58, 81]), "CSV minggu 2 ditolak dengan dua baris")
    hasil = sql("SELECT sum(saldo) AS total_saldo, (SELECT count(*) FROM topup) AS catatan FROM akun WHERE jenis = 'karyawan'")
    if "25000000" not in hasil or "100" not in hasil:
        gagal("CSV yang ditolak tidak boleh mengubah saldo atau menambah catatan")

    bagian("F. Budi mencoba top-up untuk dirinya sendiri")
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, _ = curl("POST", "/topup?keterangan=coba", "email,nominal\nbudi@lestari.example,1000000\n", token=budi,
                jenis="text/csv", tampil_body="'email,nominal\\nbudi@lestari.example,1000000'")
    harap(s, 403, "top-up oleh bukan admin")
    sql("SELECT saldo FROM akun WHERE id = 419")
    tulis("topup.txt")


if __name__ == "__main__":
    subprocess.run(["go", "build", "-o", str(BIN), "./cmd/api"], cwd=HERE, check=True)
    pilihan = sys.argv[1:] or ["login", "topup"]
    for p in pilihan:
        globals()["rekam_" + p.replace("-", "_")]()
