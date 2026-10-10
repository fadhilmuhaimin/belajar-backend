"""Rekam lab API Tahap 1 versi naskah (keputusan 132): curl -i ke server Go + PostgreSQL 17 (schema tahap1).

Setiap halaman Tahap 1 yang memakai lab ini mendapat satu file di output/. Database dibuat ulang dari nol
setiap kali dijalankan. Header Date dan token acak disamarkan supaya rekaman ulang mudah dibandingkan.
Lab gagal keras bila port sudah dipakai, atau bila hasilnya tidak sesuai yang diharapkan (keputusan 79, 95).

    make -C labs/api-t1 run      (butuh: Docker, Go; PostgreSQL dijalankan lewat labs/b3-race)
"""
import filecmp, hashlib, json, os, pathlib, re, shutil, socket, subprocess, sys, tempfile, time

HERE = pathlib.Path(__file__).parent
OUT = HERE / "output"
PORT = 18083
URL = f"http://127.0.0.1:{PORT}"
DB = "postgres://lab:lab@127.0.0.1:54333/lab?search_path=tahap1&application_name=api-t1"
ENV = dict(os.environ, DATABASE_URL=DB, TZ="Asia/Jakarta")   # waktu di response sama di mesin mana pun
PSQL = ["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "exec", "-T", "db",
        "psql", "-U", "lab", "-d", "lab", "-q"]
BIN = HERE / "api-t1"
srv = None
log = []
samaran = {}


def gagal(pesan):
    stop()
    raise SystemExit("GAGAL: " + pesan)


WAKTU = re.compile(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)")


def samarkan(teks):
    # Stempel waktu dulu: tanggalnya diganti label hari (bila ada), jamnya disamarkan.
    teks = WAKTU.sub(lambda m: f"{samaran.get(m.group(0)[:10], m.group(0)[:10])}T<jam>{m.group(0)[-6:] if m.group(0)[-6] in '+-' else 'Z'}", teks)
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


def sql_gagal(q, harus):
    """Perintah yang memang harus ditolak PostgreSQL; pesan error-nya masuk rekaman."""
    r = subprocess.run(PSQL + ["-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=terse", "-c", "SET search_path = tahap1; " + q],
                       capture_output=True, text=True)   # terse: tanpa DETAIL yang memuat seluruh baris
    if r.returncode == 0 or harus not in r.stderr:
        gagal(f"harus ditolak dengan '{harus}': {q}\n{r.stdout}{r.stderr}")
    log.append(f"$ psql -c \"{q}\"\n{samarkan(r.stderr)}\n")


def samarkan_hari_ini():
    """Tanggal Jakarta hari ini di response diganti <hari ini>, supaya rekaman ulang besok sama."""
    hari_ini = subprocess.run(PSQL + ["-At", "-c", "SELECT to_char((now() AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM-DD')"],
                              capture_output=True, text=True).stdout.strip()
    samaran[hari_ini] = "<hari ini>"


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


def mulai(*flag, bin=BIN, tampil=None):
    """bin: binary lain (M6 menjalankan v1 dan v2 dari folder VPS tiruan). tampil: baris rekaman pengganti."""
    global srv
    stop()
    pastikan_bebas(PORT)
    srv = subprocess.Popen([str(bin), *flag], env=ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for _ in range(100):
        try:
            socket.create_connection(("127.0.0.1", PORT), 0.2).close()
            break
        except OSError:
            time.sleep(0.05)
    else:
        gagal("server tidak mau menyala")
    log.append((tampil or f"# server: ./api-t1 {' '.join(flag)}".rstrip()) + "\n")


def stop():
    global srv
    if srv:
        srv.terminate()
        for l in srv.communicate()[0].splitlines():
            if "mendengar di" not in l:
                log.append("server log: " + re.sub(r"^\d{4}/\d\d/\d\d \d\d:\d\d:\d\d ", "", l) + "\n")
        srv = None


def curl(method, path, body=None, token=None, jenis="application/json", tampil_body=None, tampil_path=None, resp_tampil=None):
    """tampil_body: teks pengganti body panjang di rekaman. tampil_path: path yang ditampilkan (path asli boleh ter-encode)."""
    cmd = ["curl", "-s", "-i", "-X", method, URL + path]
    tampil = f"$ curl -i -X {method} '{tampil_path or path}'"
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
    r_log = r if resp_tampil is None else r.replace(badan, resp_tampil)
    log.append(f"{samarkan(tampil)}\n{samarkan(r_log)}\n")
    return status, badan


def login(email, password, label):
    s, b = curl("POST", "/login", json.dumps({"email": email, "password": password}))
    harap(s, 200, f"login {email}")
    token = json.loads(b)["token"]
    samaran[token] = label
    log[-1] = samarkan(log[-1])
    return token


def _log_db():
    return subprocess.run(["docker", "compose", "-f", str(HERE / "../b3-race/docker-compose.yml"), "logs",
                           "--no-log-prefix", "db"], capture_output=True, text=True).stdout.splitlines()


def posisi_log():
    """Jumlah baris log PostgreSQL saat ini; dipakai sebagai penanda awal sebelum request yang diamati."""
    return len(_log_db())


def log_statement(posisi):
    """Statement yang diterima PostgreSQL dari lab ini sesudah penanda posisi (log_statement=all di labs/b3-race)."""
    out = []
    for l in _log_db()[posisi:]:
        if "api-t1|" not in l:
            continue
        m = re.search(r"(?:statement|execute [^:]*): (.*)$", l)
        if m:
            out.append(m.group(1).strip())
    return out


def harap(nyata, harus, apa):
    if nyata != harus:
        gagal(f"{apa}: dapat {nyata!r}, harus {harus!r}")


def header(nama):
    """Nilai header nama dari response terakhir di log (nama tidak peka huruf besar-kecil)."""
    for l in log[-1].splitlines():
        if l.lower().startswith(nama.lower() + ":"):
            return l.split(":", 1)[1].strip()
    return None


TANPA_TOKEN = "Bearer"  # RFC 6750 §3.1: tanpa informasi authentication, tanpa kode error
TOKEN_DITOLAK = 'Bearer error="invalid_token"'


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
    harap((s, header("WWW-Authenticate")), (401, TANPA_TOKEN), "tanpa sesi")

    bagian("E. Logout mematikan sesi di server; token yang sama ditolak")
    s, _ = curl("POST", "/logout", token=token)
    harap(s, 204, "logout")
    s, _ = curl("GET", "/akun/419", token=token)
    harap((s, header("WWW-Authenticate")), (401, TOKEN_DITOLAK), "token setelah logout")
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
    sejak = posisi_log()
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

    bagian("G. Admin tidak sengaja mengunggah file minggu 1 sekali lagi")
    s, b = curl("POST", "/topup?keterangan=Tunjangan%20makan%20minggu%201", csv1, token=admin, jenis="text/csv",
                tampil_body="@minggu-1.csv")
    harap(s, 200, "unggahan ulang diterima (belum ada pengaman)")
    hasil = sql("SELECT sum(saldo) AS total_saldo, (SELECT count(*) FROM topup) AS catatan FROM akun WHERE jenis = 'karyawan'")
    if "50000000" not in hasil:
        gagal("unggahan ulang harus menggandakan total (risiko yang direkam)")
    tulis("topup.txt")


def topup_awal():
    """Top-up minggu 1 tanpa menulis detailnya ke rekaman (rinciannya ada di topup.txt)."""
    n = len(log)
    admin = login("admin.tunjangan@lestari.example", "sementara-400", "<token sesi admin>")
    s, _ = curl("POST", "/topup?keterangan=Tunjangan%20makan%20minggu%201", csv_minggu(250000), token=admin,
                jenis="text/csv", tampil_body="@minggu-1.csv")
    harap(s, 200, "top-up awal")
    del log[n:]
    log.append("# persiapan: admin top-up minggu 1, 100 karyawan x Rp250.000 (rinciannya di topup.txt)\n")


def rekam_bayar():
    """1.9 Fitur: bayar ke warung."""
    reset()
    mulai()
    bagian("A. Persiapan")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")

    bagian("B. Budi membayar Rp25.000 ke Warung Ani (akun 418)")
    sejak = posisi_log()
    s, b = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap((s, json.loads(b)), (201, {"id": 1, "saldo": 225000}), "bayar Rp25.000")

    bagian("C. Dua saldo berubah, satu catatan transaksi ditulis")
    hasil = sql("SELECT id, nama, saldo FROM akun WHERE id IN (418, 419) ORDER BY id")
    if "225000" not in hasil or "25000" not in hasil:
        gagal("saldo Budi 225000 dan Warung Ani 25000")
    sql("SELECT id, dari, ke, jumlah FROM transaksi")

    bagian("D. Yang diterima PostgreSQL selama pembayaran: satu transaction")
    st = [x for x in log_statement(sejak) if x.lower().startswith(("begin", "commit", "update akun", "insert into transaksi"))]
    harap([x.split()[0].lower() for x in st], ["begin", "update", "update", "insert", "commit"], "urutan transaction bayar")
    log.append("$ docker compose logs db | grep 'api-t1|'   (hanya statement pembayaran)\n" + "\n".join(st) + "\n\n")

    bagian("E. Budi membayar Rp200.000 ke Warung Sari (502)")
    s, b = curl("POST", "/transfers", '{"ke": 502, "jumlah": 200000}', token=budi)
    harap((s, json.loads(b)["saldo"]), (201, 25000), "bayar Rp200.000")

    bagian("F. Sisa saldo Rp25.000; Budi mencoba membayar Rp30.000")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 30000}', token=budi)
    harap(s, 422, "saldo kurang")
    sql("SELECT saldo FROM akun WHERE id = 419")

    bagian("G. Budi mencoba membayar ke Dimas (karyawan, bukan warung)")
    s, b = curl("POST", "/transfers", '{"ke": 417, "jumlah": 10000}', token=budi)
    harap((s, json.loads(b)["errors"][0]["field"]), (422, "ke"), "ke akun karyawan")

    bagian("H. Ani membuka akun warungnya")
    ani = login("warung.ani@lestari.example", "sementara-418", "<token sesi Warung Ani>")
    s, b = curl("GET", "/akun/418", token=ani)
    harap((s, json.loads(b)["saldo"]), (200, 25000), "saldo Warung Ani")
    tulis("bayar.txt")


def rekam_riwayat():
    """1.10 Fitur: saldo, riwayat, laporan warung."""
    reset()
    mulai()
    bagian("A. Persiapan")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")
    k420 = login("karyawan420@lestari.example", "sementara-420", "<token sesi Karyawan 420>")
    ani = login("warung.ani@lestari.example", "sementara-418", "<token sesi Warung Ani>")

    bagian("B. Empat pembayaran")
    for token, ke, jumlah in [(budi, 418, 25000), (dimas, 418, 30000), (k420, 418, 40000), (budi, 502, 15000)]:
        s, _ = curl("POST", "/transfers", json.dumps({"ke": ke, "jumlah": jumlah}), token=token)
        harap(s, 201, f"bayar {jumlah} ke {ke}")

    bagian("C. Lab menggeser waktu dua transaksi, supaya laporan berisi tiga hari")
    sql("UPDATE transaksi SET dibuat = dibuat - interval '2 days' WHERE id = 1")
    sql("UPDATE transaksi SET dibuat = dibuat - interval '1 day' WHERE id = 2")
    hari = subprocess.run(PSQL + ["-At", "-c", "SELECT to_char((now() AT TIME ZONE 'Asia/Jakarta')::date - n, 'YYYY-MM-DD') "
                                  "FROM generate_series(2, 0, -1) n"], capture_output=True, text=True).stdout.split()
    harap(len(hari), 3, "tiga tanggal Jakarta")
    for tgl, label in zip(hari, ["<2 hari lalu>", "<kemarin>", "<hari ini>"]):
        samaran[tgl] = label

    bagian("D. Budi membuka riwayatnya: terbaru dulu")
    s, b = curl("GET", "/akun/419/riwayat", token=budi)
    r = json.loads(b)["riwayat"]
    harap((s, [(x["arah"], x["lawan"], x["jumlah"]) for x in r]),
          (200, [("keluar", "Warung Sari", 15000), ("keluar", "Warung Ani", 25000)]), "riwayat Budi")

    bagian("E. Budi mencoba membuka riwayat Warung Ani")
    s, _ = curl("GET", "/akun/418/riwayat", token=budi)
    harap(s, 404, "riwayat milik orang lain")

    bagian("F. Ani membuka laporan tiga hari terakhir")
    s, b = curl("GET", f"/warung/418/laporan?dari={hari[0]}&sampai={hari[2]}", token=ani)
    harap((s, [(x["transaksi"], x["total"]) for x in json.loads(b)["per_hari"]]),
          (200, [(1, 25000), (1, 30000), (1, 40000)]), "laporan per hari")
    sql("SELECT count(*) AS transaksi, sum(jumlah) AS total FROM transaksi WHERE ke = 418")

    bagian("G. Dimas mencoba membuka laporan Warung Ani")
    s, _ = curl("GET", f"/warung/418/laporan?dari={hari[0]}&sampai={hari[2]}", token=dimas)
    harap(s, 404, "laporan milik warung lain")
    tulis("riwayat.txt")


def total():
    """Baris hasil TOTAL sebagai daftar nilai: [total_saldo, total_topup, transaksi]."""
    return [x.strip() for x in sql(TOTAL).split("\n")[2].split("|")]


TOTAL = "SELECT (SELECT sum(saldo) FROM akun) AS total_saldo, (SELECT sum(nominal) FROM topup) AS total_topup, (SELECT count(*) FROM transaksi) AS transaksi"


def rekam_pertukaran():
    """1.11 Pertukaran saldo: tiga hal yang harus selalu benar."""
    reset()
    mulai()
    bagian("A. Persiapan")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")

    bagian("B. Sebelum bayar: semua saldo dijumlah, dan sama dengan semua top-up")
    harap(total(), ["25000000", "25000000", "0"], "total sebelum")
    sql("SELECT id, nama, saldo FROM akun WHERE id IN (418, 419) ORDER BY id")

    bagian("C. Budi membayar Rp25.000 ke Warung Ani")
    s, b = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap((s, json.loads(b)["saldo"]), (201, 225000), "bayar Rp25.000")

    bagian("D. Sesudah bayar: dua saldo berubah, totalnya tidak")
    sql("SELECT id, nama, saldo FROM akun WHERE id IN (418, 419) ORDER BY id")
    harap(total(), ["25000000", "25000000", "1"], "total sesudah")

    bagian("E. Budi membayar Rp200.000 ke Warung Sari; sisa saldonya Rp25.000")
    s, b = curl("POST", "/transfers", '{"ke": 502, "jumlah": 200000}', token=budi)
    harap((s, json.loads(b)["saldo"]), (201, 25000), "bayar Rp200.000")

    bagian("F. Budi mencoba membayar Rp30.000: ditolak, tidak ada yang berubah")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 30000}', token=budi)
    harap(s, 422, "saldo kurang")
    harap(total(), ["25000000", "25000000", "2"], "tidak ada yang berubah")

    bagian("G. Pagar terakhir: UPDATE langsung yang membuat saldo negatif ditolak database")
    sql_gagal("UPDATE akun SET saldo = saldo - 30000 WHERE id = 419", "saldo_tidak_negatif")
    sql("SELECT saldo FROM akun WHERE id = 419")
    tulis("pertukaran.txt")


def rekam_relasi():
    """1.12 Data modeling dan relasi."""
    reset()
    mulai()
    bagian("A. Persiapan: top-up minggu 1, lalu Budi membayar Rp25.000 ke Warung Ani")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap(s, 201, "bayar Rp25.000")

    bagian("B. Relasi di skema minggu 1 (tabel koreksi baru ada sejak minggu 3): setiap foreign key menunjuk ke akun")
    fk = sql("SELECT conrelid::regclass AS tabel, conname AS nama, pg_get_constraintdef(oid) AS aturan "
             "FROM pg_constraint WHERE contype = 'f' AND connamespace = 'tahap1'::regnamespace "
             "AND conrelid <> 'koreksi'::regclass ORDER BY 1, 2")
    harap(fk.count("REFERENCES akun(id)"), 5, "lima foreign key ke akun")

    bagian("C. Transaksi ke akun yang tidak ada ditolak database")
    sql_gagal("INSERT INTO transaksi (dari, ke, jumlah) VALUES (419, 999, 1000)", "transaksi_ke_fkey")

    bagian("D. Warung Ani punya transaksi, jadi akunnya tidak bisa dihapus")
    sql_gagal("DELETE FROM akun WHERE id = 418", "transaksi_ke_fkey")

    bagian("E. Ani mengganti nama warungnya; riwayat Budi menampilkan nama baru, jumlahnya tetap")
    sql("UPDATE akun SET nama = 'Warung Bu Ani' WHERE id = 418")
    samarkan_hari_ini()
    s, b = curl("GET", "/akun/419/riwayat", token=budi)
    r = json.loads(b)["riwayat"]
    harap((s, [(x["lawan"], x["jumlah"]) for x in r]), (200, [("Warung Bu Ani", 25000)]), "riwayat dengan nama baru")
    tulis("relasi.txt")


def rekam_m1():
    """1.14 M1: Nominal minus lolos (mode rentan m1, keputusan 148)."""
    SALDO = "SELECT id, nama, saldo FROM akun WHERE id IN (418, 419) ORDER BY id"
    reset()
    bagian("A. Minggu 1: service belum memeriksa jumlah, skema belum punya constraint uang")
    sql("ALTER TABLE akun DROP CONSTRAINT saldo_tidak_negatif")
    sql("ALTER TABLE transaksi DROP CONSTRAINT jumlah_positif")
    mulai("-rentan", "m1")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")

    bagian("B. Raka menguji sendiri: bayar minus Rp5.000 ke Warung Ani")
    s, b = curl("POST", "/transfers", '{"ke": 418, "jumlah": -5000}', token=budi)
    harap((s, json.loads(b)["saldo"]), (201, 255000), "minus lolos")
    hasil = sql(SALDO)
    if "-5000" not in hasil or "255000" not in hasil:
        gagal("saldo Ani -5000 dan Budi 255000")
    harap(total(), ["25000000", "25000000", "1"], "total tetap walau saldo negatif")
    stop()

    bagian("C. Constraint ada di skema, service masih tanpa pemeriksaan")
    reset()
    mulai("-rentan", "m1")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": -5000}', token=budi)
    harap(s, 500, "constraint menolak, tapi app dapat 500")
    sql(SALDO)
    stop()

    bagian("D. Versi benar: service memeriksa jumlah sebelum uang disentuh")
    reset()
    mulai()
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, b = curl("POST", "/transfers", '{"ke": 418, "jumlah": -5000}', token=budi)
    harap((s, json.loads(b)["errors"][0]["field"]), (422, "jumlah"), "jumlah minus ditolak 422")
    sql(SALDO)
    tulis("m1.txt")


def rekam_http():
    """1.16 HTTP: method, status, header."""
    reset()
    mulai()
    bagian("A. Persiapan")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")

    bagian("B. GET membaca, tidak mengubah apa pun")
    s, _ = curl("GET", "/akun/419", token=budi)
    harap(s, 200, "GET akun sendiri")

    bagian("C. POST membuat satu transaksi: 201 dan header Location")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap(s, 201, "POST transfers")

    bagian("D. Alamat di Location bisa dibuka")
    samarkan_hari_ini()
    s, b = curl("GET", "/transfers/1", token=budi)
    harap((s, json.loads(b)["jumlah"]), (200, 25000), "GET transfers/1")

    bagian("E. Method yang tidak didaftarkan untuk path ini: 405 dan header Allow")
    s, _ = curl("GET", "/transfers", token=budi)
    harap(s, 405, "GET transfers")
    s, _ = curl("DELETE", "/transfers/1", token=budi)
    harap(s, 405, "DELETE transfers/1")

    bagian("F. Tanpa token: 401 dan header WWW-Authenticate")
    s, _ = curl("GET", "/transfers/1")
    harap((s, header("WWW-Authenticate")), (401, TANPA_TOKEN), "tanpa token")

    bagian("G. Dimas membuka transaksi milik Budi: 404, sama dengan transaksi yang tidak ada")
    s, _ = curl("GET", "/transfers/1", token=dimas)
    harap(s, 404, "transaksi orang lain")
    s, _ = curl("GET", "/transfers/999", token=budi)
    harap(s, 404, "transaksi tidak ada")
    tulis("http.txt")


def rekam_m2():
    """1.17 M2: amount lawan jumlah (kontrak yang belum tertulis); E: sesudah ADR 3 (1.18)."""
    reset()
    mulai("-rentan", "m2")
    bagian("A. Persiapan")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")

    bagian("B. App mengirim field amount; server membaca jumlah")
    s, b = curl("POST", "/transfers", '{"ke": 418, "amount": 25000}', token=budi)
    harap((s, json.loads(b)["errors"][0]["field"]), (422, "jumlah"), "amount diabaikan, jumlah 0")
    harap(sql("SELECT saldo FROM akun WHERE id = 419").split()[2], "250000", "saldo Budi tetap")

    bagian("C. App mengirim ke sebagai teks; server mengharapkan angka")
    s, _ = curl("POST", "/transfers", '{"ke": "418", "jumlah": 25000}', token=budi)
    harap(s, 400, "tipe ke salah")
    harap(sql("SELECT saldo FROM akun WHERE id = 419").split()[2], "250000", "saldo Budi tetap")

    bagian("D. Bentuk yang dibaca server")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap(s, 201, "bentuk benar")
    sql("SELECT count(*) AS transaksi FROM transaksi")
    stop()

    bagian("E. Sesudah kontrak (ADR 3): field wajib dan tipe yang salah dijawab 400 dengan namanya")
    mulai()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, b = curl("POST", "/transfers", '{"ke": 418, "amount": 25000}', token=budi)
    harap((s, json.loads(b)["errors"]), (400, [{"field": "jumlah", "pesan": "wajib diisi"}]), "jumlah wajib")
    s, b = curl("POST", "/transfers", '{"ke": "418", "jumlah": 25000}', token=budi)
    harap((s, json.loads(b)["errors"][0]["field"]), (400, "ke"), "tipe ke")
    tulis("m2.txt")


def rekam_m3():
    """1.19 M3: Tanda kutip di pencarian (mode rentan m3, keputusan 157)."""
    reset()
    mulai("-rentan", "m3")
    bagian("A. Persiapan")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")

    bagian("B. Budi mencari warung bernama Ani")
    s, b = curl("GET", "/warung?cari=Ani", token=budi)
    harap((s, [(w["nama"], w.get("saldo")) for w in json.loads(b)["warung"]]),
          (200, [("Warung Ani", 0)]), "cari Ani: saldo ikut terkirim")

    bagian("C. Budi mencari nama dengan tanda kutip")
    s, _ = curl("GET", "/warung?cari=%27%20nasi", token=budi, tampil_path="/warung?cari=' nasi")
    harap(s, 500, "tanda kutip: 500")

    bagian("D. Dimas mencoba ' OR 1=1 -- dan melihat semua akun beserta saldo")
    bocor = ('{"warung":[{"id":400,"jenis":"admin","nama":"Admin Tunjangan","saldo":0},'
             '{"id":418,"jenis":"warung","nama":"Warung Ani","saldo":0},'
             '{"id":419,"jenis":"karyawan","nama":"Budi","saldo":250000},'
             ' ... 99 akun lain, semuanya dengan saldo]}')
    s, b = curl("GET", "/warung?cari=%27%20OR%201%3D1%20--", token=dimas, tampil_path="/warung?cari=' OR 1=1 --", resp_tampil=bocor)
    hasil = json.loads(b)["warung"]
    harap((s, len(hasil) > 100, any(w["jenis"] == "karyawan" for w in hasil)),
          (200, True, True), "injection: semua akun bocor")
    stop()

    reset()
    mulai()
    bagian("E. Versi benar: pencarian memakai parameter query")
    topup_awal()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")
    s, b = curl("GET", "/warung?cari=Ani", token=budi)
    harap((s, json.loads(b)["warung"]), (200, [{"id": 418, "nama": "Warung Ani"}]), "cari Ani: hanya id dan nama")

    bagian("F. Tanda kutip dan ' OR 1=1 -- jadi teks biasa, bukan perintah")
    s, b = curl("GET", "/warung?cari=%27%20nasi", token=budi, tampil_path="/warung?cari=' nasi")
    harap((s, json.loads(b)["warung"]), (200, []), "tanda kutip: 0 hasil, bukan 500")
    s, b = curl("GET", "/warung?cari=%27%20OR%201%3D1%20--", token=dimas, tampil_path="/warung?cari=' OR 1=1 --")
    harap((s, json.loads(b)["warung"]), (200, []), "injection jadi teks: 0 hasil")
    tulis("m3.txt")


def diterima_db(posisi):
    """Query pencarian warung yang diterima PostgreSQL sesudah penanda posisi, beserta baris parameternya."""
    time.sleep(0.3)   # log container ditulis asinkron
    out = []
    for l in _log_db()[posisi:]:
        if not l.startswith("api-t1|"):
            continue
        isi = l.split("|", 2)[2]
        if "FROM akun WHERE" in isi or (out and isi.startswith("DETAIL:")):
            out.append(re.sub(r"stmtcache_[0-9a-f]+", "stmtcache_…", isi))
        elif out:
            break
    if not out:
        gagal("query pencarian tidak ada di log PostgreSQL")
    log.append("# yang diterima PostgreSQL (log_statement=all):\n" + "\n".join(out) + "\n\n")
    return out


GOSEC = "github.com/securego/gosec/v2/cmd/gosec@v2.29.0"


def rekam_injection():
    """1.20 Keamanan 1: SQL injection (keputusan 160). Teks SQL vs parameter di log PostgreSQL, lalu gosec."""
    reset()
    mulai("-rentan", "m3")
    bagian("A. Mode rentan: isi pencarian masuk ke teks SQL")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")
    p = posisi_log()
    s, _ = curl("GET", "/warung?cari=%27%20OR%201%3D1%20--", token=dimas, tampil_path="/warung?cari=' OR 1=1 --",
                resp_tampil="{\"warung\":[ ... semua akun, beserta saldo]}")
    harap(s, 200, "rentan: 200")
    st = diterima_db(p)
    harap(any("LIKE '%' OR 1=1 --%'" in x for x in st) and not any(x.startswith("DETAIL:") for x in st), True,
          "rentan: OR 1=1 ada di teks SQL, tanpa parameter")
    stop()

    reset()
    mulai()
    bagian("B. Versi benar: teks SQL tetap, isi pencarian dikirim terpisah sebagai $1")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")
    p = posisi_log()
    s, b = curl("GET", "/warung?cari=%27%20OR%201%3D1%20--", token=dimas, tampil_path="/warung?cari=' OR 1=1 --")
    harap((s, json.loads(b)["warung"]), (200, []), "benar: 0 hasil")
    st = diterima_db(p)
    harap(any("|| $1 ||" in x for x in st) and any(x.startswith("DETAIL:  Parameters: $1 = ") for x in st), True,
          "benar: SQL memakai $1, parameter di baris terpisah")
    stop()

    bagian("C. Linter: gosec aturan G201 dan G202 (SQL dibangun dari string)")
    r = subprocess.run(["go", "run", GOSEC, "-fmt=text", "-include=G201,G202", "./..."], cwd=HERE,
                       capture_output=True, text=True)
    # gosec mewarnai keluarannya bila lingkungan terlihat mendukung warna, juga tanpa terminal; kode warna dibuang.
    hasil = re.sub(r"\x1b\[[0-9;]*m", "", r.stdout).replace(str(HERE) + "/", "").replace("\n\n\n", "\n\n").strip()
    harap(("G202" in hasil, "Issues : 1" in hasil, r.returncode != 0), (True, True, True),
          "gosec: tepat satu temuan, di fungsi rentan")
    hasil = "\n".join(l.rstrip() for l in hasil.splitlines())
    log.append(f"$ go run {GOSEC} -include=G201,G202 ./...\n{hasil}\n# exit status {r.returncode}\n")

    bagian("D. Batas parameter: nama kolom tidak bisa jadi $1")
    log.append("# $1 selalu nilai. ORDER BY $1 memberi semua baris nilai yang sama, jadi teks nama DESC tidak berpengaruh.\n")
    a = sql("PREPARE urut(text) AS SELECT id, nama FROM akun WHERE jenis = 'warung' ORDER BY $1; EXECUTE urut('nama DESC');")
    b = sql("SELECT id, nama FROM akun WHERE jenis = 'warung' ORDER BY nama DESC;")
    harap((a.split().index("418") < a.split().index("502"), b.split().index("502") < b.split().index("418")),
          (True, True), "ORDER BY $1 tidak mengurutkan; ORDER BY nama DESC mengurutkan")

    bagian("E. Latihan: draf AI laporan warung (latihan/laporan.go), dites ke database lalu di-lint")
    reset()
    t = subprocess.run(["go", "test", "-v", "-count=1", "./..."], cwd=HERE / "latihan", env=ENV,
                       capture_output=True, text=True)
    keluaran = re.sub(r" \(\d+\.\d+s\)", "", t.stdout)
    keluaran = re.sub(r"(ok\s+lab/latihan)\s+\d+\.\d+s", r"\1", keluaran).strip()
    harap((t.returncode, "division by zero" in keluaran, "urut tidak dikenal" in keluaran), (0, True, True),
          "latihan: draf menjalankan urut sebagai SQL, versi benar menolaknya")
    log.append(f"$ cd latihan && go test -v ./...\n{keluaran}\n")
    r = subprocess.run(["go", "run", GOSEC, "-fmt=text", "-include=G201,G202", "./..."], cwd=HERE / "latihan",
                       capture_output=True, text=True)
    ringkas = "\n".join(l.rstrip() for l in re.sub(r"\x1b\[[0-9;]*m", "", r.stdout).splitlines() if l.strip() and not l.startswith("Results"))
    harap(("Issues : 0" in ringkas, r.returncode), (True, 0), "gosec tidak menandai draf (query di return)")
    log.append(f"$ cd latihan && go run {GOSEC} -include=G201,G202 ./...\n{ringkas}\n")
    log.append("# Draf menjalankan urut sebagai SQL (tes pertama), tapi gosec tidak menandainya:\n"
               "# aturan G202 memeriksa query di assignment (rows, err := ...), bukan yang langsung di return.\n")
    tulis("injection.txt")


PINTAS = """package handler

import (
	"database/sql"
	"net/http"
)

// cariLangsung: pintas buatan AI. Handler menjalankan SQL sendiri, melewati service dan repo.
func cariLangsung(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	rows, err := db.QueryContext(r.Context(),
		`SELECT id, nama FROM akun WHERE jenis = 'warung' AND nama ILIKE '%' || $1 || '%'`, r.URL.Query().Get("cari"))
	if err == nil {
		rows.Close()
	}
}
"""


def rekam_lapisan():
    """1.21 Lapisan dasar (keputusan 165): arah import antar lapisan, diperiksa cek_arah.py."""
    bagian("A. Import tiap lapisan, menurut go list")
    r = subprocess.run(["go", "list", "-f", "{{.ImportPath}}: {{join .Imports \" \"}}", "./internal/..."],
                       cwd=HERE, capture_output=True, text=True, check=True)
    log.append("$ go list -f '{{.ImportPath}}: {{join .Imports \" \"}}' ./internal/...\n" + r.stdout.replace("lab/apit1/", "") + "\n")

    bagian("B. Aturan arah: handler tidak tahu SQL, service tidak tahu HTTP, repo tidak tahu aturan uang")
    c = subprocess.run([sys.executable, "cek_arah.py"], cwd=HERE, capture_output=True, text=True)
    harap((c.returncode, c.stdout.count("lolos")), (0, 3), "cek_arah: tiga lapisan lolos")
    log.append(f"$ python3 cek_arah.py\n{c.stdout}# exit status {c.returncode}\n")

    bagian("C. Pintas AI: handler menjalankan SQL sendiri (file sementara internal/handler/pintas_ai.go)")
    f = HERE / "internal/handler/pintas_ai.go"
    try:
        f.write_text(PINTAS)
        log.append("$ cat internal/handler/pintas_ai.go\n" + PINTAS + "\n")
        b = subprocess.run(["go", "build", "./..."], cwd=HERE, capture_output=True, text=True)
        harap(b.returncode, 0, "pintas tetap lolos compile")
        log.append(f"$ go build ./...\n# exit status {b.returncode}: compiler Go tidak tahu soal lapisan\n")
        c = subprocess.run([sys.executable, "cek_arah.py"], cwd=HERE, capture_output=True, text=True)
        harap((c.returncode, "handler: mengimpor database/sql (dilarang)" in c.stdout), (1, True), "cek_arah menolak pintas")
        log.append(f"$ python3 cek_arah.py\n{c.stdout}# exit status {c.returncode}\n")
    finally:
        f.unlink(missing_ok=True)
    tulis("lapisan.txt")


def bayar_banyak(n, jumlah):
    """Persiapan: n karyawan (selain Budi dan Dimas) membayar ke Warung Ani. Rinciannya tidak ditulis ke rekaman."""
    k = len(log)
    ids = [i for i in range(401, 520) if i not in (417, 418, 419)][:n]
    for i in ids:
        t = login(f"karyawan{i}@lestari.example", f"sementara-{i}", f"<token {i}>")
        s, _ = curl("POST", "/transfers", json.dumps({"ke": 418, "jumlah": jumlah}), token=t)
        harap(s, 201, f"bayar karyawan {i}")
    del log[k:]
    log.append(f"# persiapan: {n} karyawan lain masing-masing membayar Rp{jumlah:,} ke Warung Ani\n".replace(",", "."))


BATAS_WARUNG = "ALTER TABLE akun ADD CONSTRAINT batas_saldo_warung CHECK (jenis <> 'warung' OR saldo <= 1500000)"
SALDO_M4 = "SELECT id, nama, saldo FROM akun WHERE id IN (418, 419) ORDER BY id"


def rekam_m4():
    """1.22 M4: Rp70.000 yang hilang (mode rentan m4, keputusan 167)."""
    reset()
    bagian("A. Minggu 2: Raka menambah batas saldo warung langsung di server, lewat psql (tidak ada di schema.sql)")
    sql(BATAS_WARUNG)
    mulai("-rentan", "m4")
    topup_awal()
    bagian("B. Minggu 3, Jumat siang: Warung Ani ramai")
    bayar_banyak(29, 50000)
    harap("1450000" in sql(SALDO_M4), True, "Ani 1.450.000 sebelum Budi")
    harap(total(), ["25000000", "25000000", "29"], "total sebelum Budi")

    bagian("C. Budi membayar Rp70.000; app menampilkan gagal")
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    p = posisi_log()
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 70000}', token=budi)
    harap(s, 500, "UPDATE kedua ditolak batas warung")
    time.sleep(0.3)
    st = [x for x in log_statement(p) if x.lower().startswith(("begin", "commit", "rollback", "update akun", "insert into transaksi"))]
    harap([x.split()[0].upper() for x in st], ["UPDATE", "UPDATE"], "tanpa transaction: dua UPDATE, tanpa BEGIN/ROLLBACK")
    log.append("# yang diterima PostgreSQL (log_statement=all):\n" + "\n".join(st) + "\n\n")
    hasil = sql(SALDO_M4)
    harap(("180000" in hasil, "1450000" in hasil), (True, True), "Budi berkurang, Ani tetap")
    sql("SELECT count(*) AS transaksi_budi FROM transaksi WHERE dari = 419")
    harap(total(), ["24930000", "25000000", "29"], "Rp70.000 hilang dari total")
    stop()

    bagian("D. Versi benar: tiga perubahan dalam satu transaction, batas warung yang sama")
    reset()
    sql(BATAS_WARUNG)
    mulai()
    topup_awal()
    bayar_banyak(29, 50000)
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    p = posisi_log()
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 70000}', token=budi)
    harap(s, 500, "versi benar: tetap gagal")
    time.sleep(0.3)
    st = [x for x in log_statement(p) if x.lower().startswith(("begin", "commit", "rollback", "update akun", "insert into transaksi"))]
    harap([x.split()[0].upper() for x in st], ["BEGIN", "UPDATE", "UPDATE", "ROLLBACK"], "transaction dibatalkan")
    log.append("# yang diterima PostgreSQL (log_statement=all):\n" + "\n".join(st) + "\n\n")
    hasil = sql(SALDO_M4)
    harap(("250000" in hasil, "1450000" in hasil), (True, True), "Budi utuh, Ani tetap")
    harap(total(), ["25000000", "25000000", "29"], "total utuh")
    tulis("m4.txt")


KOREKSI_BUDI = ("SELECT a.saldo, t.topup, k.keluar, m.masuk, x.koreksi, t.topup - k.keluar + m.masuk + x.koreksi AS dari_catatan "
                "FROM akun a, (SELECT coalesce(sum(nominal), 0) AS topup FROM topup WHERE akun_id = 419) t, "
                "(SELECT coalesce(sum(jumlah), 0) AS keluar FROM transaksi WHERE dari = 419) k, "
                "(SELECT coalesce(sum(jumlah), 0) AS masuk FROM transaksi WHERE ke = 419) m, "
                "(SELECT coalesce(sum(jumlah), 0) AS koreksi FROM koreksi WHERE akun_id = 419) x WHERE a.id = 419")


def rekam_koreksi():
    """1.24 ADR 6: tabel koreksi (keputusan 170). Insiden M4, lalu koreksi Rp70.000 yang tercatat."""
    reset()
    bagian("A. Insiden M4 diulang: server minggu 3 (mode rentan m4), batas saldo warung, 29 pembayaran, Budi Rp70.000")
    sql(BATAS_WARUNG)
    mulai("-rentan", "m4")
    topup_awal()
    bayar_banyak(29, 50000)
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    n = len(log)
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 70000}', token=budi)
    harap(s, 500, "insiden M4")
    del log[n:]
    log.append("# Budi membayar Rp70.000: 500, saldo terpotong tanpa baris transaksi (rinciannya di m4.txt)\n")
    harap(total(), ["24930000", "25000000", "29"], "selisih Rp70.000")
    stop()

    bagian("B. Versi benar di-deploy (data tetap). Hanya admin yang boleh mengoreksi, dan alasan wajib")
    mulai()
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    admin = login("admin.tunjangan@lestari.example", "sementara-400", "<token sesi admin>")
    s, _ = curl("POST", "/koreksi", '{"akun": 419, "jumlah": 70000, "alasan": "saldo saya hilang, tolong kembalikan"}', token=budi)
    harap(s, 403, "karyawan tidak boleh koreksi")
    s, b = curl("POST", "/koreksi", '{"akun": 419, "jumlah": 70000, "alasan": "salah sistem"}', token=admin)
    harap((s, json.loads(b)["errors"][0]["field"]), (422, "alasan"), "alasan terlalu pendek")

    bagian("C. Admin mengoreksi saldo Budi, dengan alasan yang bisa dibaca Keuangan")
    p = posisi_log()
    alasan = "Pembayaran Budi ke Warung Ani, Jumat minggu 3 pukul 12.15, gagal di tengah; saldo terpotong tanpa baris transaksi (M4)"
    s, b = curl("POST", "/koreksi", json.dumps({"akun": 419, "jumlah": 70000, "alasan": alasan}, ensure_ascii=False), token=admin)
    harap((s, json.loads(b)["saldo"]), (201, 250000), "koreksi tercatat")
    time.sleep(0.3)
    st = [x for x in log_statement(p) if x.lower().startswith(("begin", "commit", "rollback", "update akun", "insert into koreksi"))]
    harap([x.split()[0].upper() for x in st], ["BEGIN", "UPDATE", "INSERT", "COMMIT"], "koreksi dalam satu transaction")
    log.append("# yang diterima PostgreSQL (log_statement=all):\n" + "\n".join(st) + "\n\n")
    sql("SELECT akun_id, jumlah, admin_id, alasan FROM koreksi")
    harap(total(), ["25000000", "25000000", "29"], "total kembali")

    bagian("D. Rekonsiliasi akun Budi dari catatan: top-up - keluar + masuk + koreksi")
    hasil = sql(KOREKSI_BUDI)
    harap([x.strip() for x in hasil.split("\n")[2].split("|")], ["250000", "250000", "0", "0", "70000", "320000"],
          "pemotongan M4 tanpa baris: catatan menghitung 320000")
    log.append("# Saldo Rp250.000, catatan menghitung Rp320.000. Pemotongan Rp70.000 di M4 tidak punya baris di tabel mana pun.\n")
    tulis("koreksi.txt")


def persiapan_m5():
    """Top-up minggu 1, lalu Budi membayar Rp25.000 ke Warung Ani supaya saldo Ani tidak nol."""
    topup_awal()
    k = len(log)
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap(s, 201, "Budi bayar Ani")
    del log[k:]
    log.append("# persiapan: Budi membayar Rp25.000 ke Warung Ani (rinciannya di bayar.txt)\n")
    return login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")


def enumerasi(token):
    """Dimas mencoba akun 401 sampai 503 satu per satu. Hanya ringkasannya yang ditulis ke rekaman."""
    status, baris = {}, []
    for i in range(401, 504):
        r = subprocess.run(["curl", "-s", "-w", "\n%{http_code}", "-H", f"Authorization: Bearer {token}",
                            f"{URL}/akun/{i}"], capture_output=True, text=True).stdout
        badan, kode = r.rsplit("\n", 1)
        status[kode] = status.get(kode, 0) + 1
        if kode == "200":
            a = json.loads(badan)
            baris.append(f"{a['id']},{a['nama']},{a['saldo']}")
    log.append("$ for id in $(seq 401 503); do curl -s -H 'Authorization: Bearer <token sesi Dimas>' '/akun/'$id; done\n")
    log.append("# status: " + ", ".join(f"{k} x {v}" for k, v in sorted(status.items())) + "\n")
    # Yang ditampilkan hanya baris 416-420 (Dimas, Warung Ani, Budi dan tetangganya); sisanya dihitung.
    tampil = [x for x in baris if 416 <= int(x.split(",")[0]) <= 420]
    log.append(f"# yang terbaca, disimpan ke saldo.csv (id,nama,saldo), {len(baris)} baris:\n" + "\n".join(tampil) +
               (f"\n... {len(baris) - len(tampil)} baris lain" if len(baris) > len(tampil) else "") + "\n\n")
    return status, baris


def rekam_m5():
    """1.26 M5: Angka di URL (mode rentan m5, keputusan 233)."""
    reset()
    mulai("-rentan", "m5")
    bagian("A. Persiapan: server minggu 4, login dicek, kepemilikan tidak")
    dimas = persiapan_m5()

    bagian("B. Dimas membuka akunnya sendiri, 417")
    s, b = curl("GET", "/akun/417", token=dimas)
    harap((s, json.loads(b)["nama"]), (200, "Dimas"), "akun sendiri")

    bagian("C. Dimas mengganti 417 jadi 418 di URL")
    s, b = curl("GET", "/akun/418", token=dimas)
    harap((s, json.loads(b)["nama"], json.loads(b)["saldo"]), (200, "Warung Ani", 25000), "rentan: saldo Ani terbaca")

    bagian("D. Dimas mencoba semua nomor dari 401 sampai 503")
    status, baris = enumerasi(dimas)
    harap((status, len(baris)), ({"200": 103}, 103), "rentan: 103 akun terbaca")
    harap(any(x.startswith("419,Budi,225000") for x in baris), True, "saldo Budi ikut terbaca")
    stop()

    reset()
    mulai()
    bagian("E. Versi benar: service bertanya apakah yang login pemilik akun itu")
    dimas = persiapan_m5()
    s, _ = curl("GET", "/akun/417", token=dimas)
    harap(s, 200, "benar: akun sendiri")
    s1, b1 = curl("GET", "/akun/418", token=dimas)
    s2, b2 = curl("GET", "/akun/9999", token=dimas)
    harap((s1, s2), (404, 404), "akun orang lain dan akun yang tidak ada: 404")
    harap(b1, b2, "body 418 dan 9999 harus sama")
    log.append("# Jawaban untuk 418 (ada, milik Ani) dan 9999 (tidak ada) sama persis: Dimas tidak bisa membedakannya.\n\n")

    bagian("F. Enumerasi yang sama di versi benar")
    status, baris = enumerasi(dimas)
    harap((status, baris), ({"200": 1, "404": 102}, ["417,Dimas,250000"]), "benar: hanya akun sendiri")
    tulis("m5.txt")


def status_saja(method, path, token=None):
    cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", method, URL + path]
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
    return int(subprocess.run(cmd, capture_output=True, text=True).stdout)


def rekam_authz():
    """1.28 Authorization (keputusan 237): sesudah login, setiap request ditanya pemilik atau peran."""
    reset()
    mulai()
    samarkan_hari_ini()
    bagian("A. Persiapan: versi benar, Budi membayar Rp25.000 ke Warung Ani (transaksi 1)")
    topup_awal()
    k = len(log)
    admin = login("admin.tunjangan@lestari.example", "sementara-400", "<token sesi admin>")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")
    ani = login("warung.ani@lestari.example", "sementara-418", "<token sesi Warung Ani>")
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    s, _ = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    harap(s, 201, "Budi bayar Ani")
    del log[k:]
    log.append("# persiapan: login admin tunjangan (400), Dimas (417), Warung Ani (418), Budi (419)\n"
               "# persiapan: Budi membayar Rp25.000 ke Warung Ani, transaksi 1 (rinciannya di bayar.txt)\n")

    bagian("B. Satu transaksi, tiga peminta: pembayar, penerima, orang lain")
    s1, b1 = curl("GET", "/transfers/1", token=budi)
    s2, b2 = curl("GET", "/transfers/1", token=ani)
    s3, _ = curl("GET", "/transfers/1", token=dimas)
    harap((s1, s2, s3, b1 == b2), (200, 200, 404, True), "pembayar dan penerima 200, orang lain 404")

    bagian("C. Peran: hanya admin tunjangan yang boleh top-up")
    isi = "email,nominal\nbudi@lestari.example,10000"
    s1, _ = curl("POST", "/topup?keterangan=Uji%20peran", isi, token=budi, jenis="text/csv",
                 tampil_body="'email,nominal\\nbudi@lestari.example,10000'")
    s2, _ = curl("POST", "/topup?keterangan=Uji%20peran", isi, token=admin, jenis="text/csv",
                 tampil_body="'email,nominal\\nbudi@lestari.example,10000'")
    harap((s1, s2), (403, 200), "karyawan 403, admin 200")
    sql("SELECT akun_id, nominal, admin_id, keterangan FROM topup WHERE akun_id = 419 ORDER BY id")
    sql("SELECT saldo FROM akun WHERE id = 419")

    bagian("D. Urutan: login diperiksa sebelum izin")
    s, _ = curl("POST", "/topup?keterangan=Uji%20peran", isi, jenis="text/csv",
                tampil_body="'email,nominal\\nbudi@lestari.example,10000'")
    harap((s, header("WWW-Authenticate")), (401, TANPA_TOKEN), "tanpa token: 401, bukan 403")

    bagian("E. Ringkasan: empat request yang sama dari lima peminta, status saja")
    hari_ini = next(k for k, v in samaran.items() if v == "<hari ini>")
    peminta = [("Budi", budi), ("Ani", ani), ("Dimas", dimas), ("admin", admin), ("tanpa-token", None)]
    request = [("/akun/419", "/akun/419"), ("/akun/419/riwayat", "/akun/419/riwayat"), ("/transfers/1", "/transfers/1"),
               (f"/warung/418/laporan?dari={hari_ini}&sampai={hari_ini}", "/warung/418/laporan")]
    harus = {"/akun/419": [200, 404, 404, 404, 401], "/akun/419/riwayat": [200, 404, 404, 404, 401],
             "/transfers/1": [200, 200, 404, 404, 401], "/warung/418/laporan": [404, 200, 404, 404, 401]}
    log.append("$ for p in Budi Ani Dimas admin tanpa; do curl -s -o /dev/null -w '%{http_code}' ...; done\n"
               "# tanpa = tanpa header Authorization; laporan memakai ?dari=<hari ini>&sampai=<hari ini>\n")
    log.append(f"{'GET':<22}" + "".join(f"{n:>7}" for n in ["Budi", "Ani", "Dimas", "admin", "tanpa"]) + "\n")
    for asli, tampil in request:
        hasil = [status_saja("GET", asli, t) for _, t in peminta]
        harap(hasil, harus[tampil], f"matriks {tampil}")
        log.append(f"{tampil:<22}" + "".join(f"{h:>7}" for h in hasil) + "\n")
    tulis("authz.txt")


# Commit v2 Raka di minggu 5: kolom transaksi.jumlah diganti nominal, supaya sama dengan topup.nominal dan label
# layar. Field JSON ikut berganti. Lab membangun v2 dari salinan kode v1 dengan penggantian di bawah. Setiap
# penggantian harus ditemukan tepat n kali; kalau kode v1 berubah, lab berhenti dengan error.
V2_UBAH = [  # (file, teks v1, teks v2, n)
    ("internal/handler/handler.go", 'Ke     *int64 `json:"ke"`\n\t\tJumlah *int64 `json:"jumlah"`',
     'Ke     *int64 `json:"ke"`\n\t\tJumlah *int64 `json:"nominal"`', 1),
    ("internal/handler/handler.go", '[]string{"ke", "jumlah"}', '[]string{"ke", "nominal"}', 1),
    ("internal/service/bayar.go", 'ErrValidasi{"jumlah", ', 'ErrValidasi{"nominal", ', 1),
    ("internal/repo/transaksi.go", "INSERT INTO transaksi (dari, ke, jumlah)", "INSERT INTO transaksi (dari, ke, nominal)", 2),
    ("internal/repo/transaksi.go", "SELECT id, dari, ke, jumlah, dibuat", "SELECT id, dari, ke, nominal, dibuat", 1),
    ("internal/repo/transaksi.go", 'Jumlah int64     `json:"jumlah"`', 'Jumlah int64     `json:"nominal"`', 1),
    ("internal/repo/riwayat.go", 'Jumlah int64     `json:"jumlah"`', 'Jumlah int64     `json:"nominal"`', 1),
    ("internal/repo/riwayat.go", "a.nama, t.jumlah, t.dibuat", "a.nama, t.nominal, t.dibuat", 1),
    ("internal/repo/riwayat.go", "sum(jumlah)", "sum(nominal)", 1),
]


def bangun_v2(tmp):
    src = tmp / "src-v2"
    src.mkdir()
    for nama in ("go.mod", "go.sum"):
        shutil.copy2(HERE / nama, src / nama)
    for nama in ("cmd", "internal"):
        shutil.copytree(HERE / nama, src / nama)
    for f, lama, baru, n in V2_UBAH:
        teks = (src / f).read_text()
        harap(teks.count(lama), n, f"v2: '{lama}' di {f}")
        (src / f).write_text(teks.replace(lama, baru))
    bin_v2 = tmp / "laptop" / "api-t1"
    subprocess.run(["go", "build", "-o", str(bin_v2), "./cmd/api"], cwd=src, check=True)
    for f, lama, baru, _ in V2_UBAH:
        log.append(f"#   {f:<28} {lama.splitlines()[-1].strip()}  ->  {baru.splitlines()[-1].strip()}\n")
    log.append("$ go build -o laptop:api-t1 ./cmd/api   # di laptop Raka, kode v2\n")
    return bin_v2


def baca_riwayat(token, akun, versi):
    """Satu request app: GET riwayat, lalu membaca transaksi teratas seperti app versi itu membacanya."""
    r = subprocess.run(["curl", "-s", "-m", "2", "-w", "\n%{http_code}", "-H", f"Authorization: Bearer {token}",
                        f"{URL}/akun/{akun}/riwayat"], capture_output=True, text=True).stdout
    badan, kode = r.rsplit("\n", 1)
    if kode == "000":
        return "tidak ada jawaban"
    if kode != "200":
        return kode
    field = "jumlah" if versi == "1.0" else "nominal"   # app 1.0 membaca "jumlah", app 1.1 membaca "nominal"
    item = json.loads(badan)["riwayat"][0]
    return f"200 · {field} {item[field]}" if field in item else f"200 · field {field} tidak ada"


class Prober:
    """Satu putaran per detik: setiap HP membaca riwayatnya sekali. Perintah deploy dijalankan di antara dua putaran,
    jadi rekaman sama di mesin mana pun. Jumlah putaran yang gagal = jumlah perintah, bukan lama perintah itu di VPS."""

    def __init__(self, hp):
        self.hp, self.hasil, self.jam = hp, [], None   # hp: [[nama, token, akun, versi app]]

    def putaran(self, kali=1):
        for _ in range(kali):
            if self.jam is not None:
                time.sleep(max(0.0, self.jam + 1 - time.monotonic()))
            self.jam = time.monotonic()
            hasil = [baca_riwayat(t, a, v) for _, t, a, v in self.hp]
            self.hasil.append(hasil)
            log.append(f"{len(self.hasil):<7}" + "".join(f"{'app ' + h[3] + ' · ' + x:<41}" for h, x in zip(self.hp, hasil)).rstrip() + "\n")

    def ringkasan(self):
        for i, h in enumerate(self.hp):
            hitung = {}
            for baris in self.hasil:
                x = baris[i]
                jenis = "berhasil" if re.fullmatch(r"200 · (jumlah|nominal) \d+", x) else x.replace("200 · ", "")
                hitung[jenis] = hitung.get(jenis, 0) + 1
            log.append(f"# HP {h[0]}: " + ", ".join(f"{v} {k}" for k, v in hitung.items()) + "\n")


def rekam_m6():
    """1.30 M6: Deploy hari Senin (keputusan 241). Deploy v1 ke v2 ala minggu 5 sambil prober memanggil API tiap detik."""
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="api-t1-m6-"))
    try:
        _rekam_m6(tmp)
    finally:
        stop()
        shutil.rmtree(tmp, ignore_errors=True)


def _rekam_m6(tmp):
    reset()
    samarkan_hari_ini()
    log.append("# laptop: adalah folder build di laptop Raka, vps: adalah /opt/rekeningo di VPS. Di lab, keduanya folder sementara.\n")
    bagian("A. Kode v2: kolom transaksi.jumlah diganti nominal, field JSON ikut berganti")
    bin_v2 = bangun_v2(tmp)
    vps = tmp / "vps"
    vps.mkdir()
    shutil.copy2(BIN, vps / "api-t1")

    bagian("B. Persiapan: v1 berjalan, Budi dan Dimas memakai app 1.0")
    mulai(bin=vps / "api-t1", tampil="# server: vps:/opt/rekeningo/api-t1 (v1)")
    topup_awal()
    k = len(log)
    budi = login("budi@lestari.example", "sementara-419", "<token sesi Budi>")
    dimas = login("dimas@lestari.example", "sementara-417", "<token sesi Dimas>")
    for token, n in ((budi, 25000), (dimas, 20000)):
        s, _ = curl("POST", "/transfers", json.dumps({"ke": 418, "jumlah": n}), token=token)
        harap(s, 201, "bayar ke Warung Ani di v1")
    del log[k:]
    log.append("# persiapan: login Budi (419) dan Dimas (417); Budi membayar Rp25.000 dan Dimas Rp20.000 ke Warung Ani\n")
    s, b = curl("GET", "/akun/419/riwayat", token=budi)
    harap((s, "jumlah" in json.loads(b)["riwayat"][0]), (200, True), "v1: riwayat memakai field jumlah")

    bagian("C. Deploy: prober memanggil API tiap detik, perintah Raka dijalankan di antara dua putaran")
    log.append("# prober: GET /akun/419/riwayat dari HP Budi dan GET /akun/417/riwayat dari HP Dimas\n"
               "# app 1.0 membaca field \"jumlah\" di riwayat; app 1.1 membaca \"nominal\"\n")
    log.append(f"{'detik':<7}{'HP Budi':<41}HP Dimas\n")
    p = Prober([["Budi", budi, 419, "1.0"], ["Dimas", dimas, 417, "1.0"]])
    p.putaran(2)
    log.append("$ kill -TERM <pid v1>   # v1 berhenti\n")
    stop()
    p.putaran()
    # Naskah: Raka memakai migrate up sejak minggu 3 (1.25). Lab memakai psql supaya mode lock terbaca: satu psql -c
    # adalah satu transaction (dokumentasi psql 17), jadi pg_locks masih melihat lock milik ALTER TABLE.
    log.append("# di cerita: migrate up, file 000006_transaksi_nominal.up.sql berisi ALTER TABLE ini\n"
               "# lab: mode lock dibaca dari pg_locks di transaction yang sama; SELECT ini bukan bagian dari deploy Raka\n")
    kunci = sql("ALTER TABLE transaksi RENAME COLUMN jumlah TO nominal; "
                "SELECT mode FROM pg_locks WHERE relation = 'transaksi'::regclass AND pid = pg_backend_pid()")
    harap("AccessExclusiveLock" in kunci, True, "RENAME COLUMN memegang ACCESS EXCLUSIVE lock")
    p.putaran()
    shutil.copy2(bin_v2, vps / "api-t1")
    log.append("$ cp laptop:api-t1 vps:/opt/rekeningo/api-t1   # di cerita: scp; binary v1 tertimpa\n")
    p.putaran()
    mulai(bin=vps / "api-t1", tampil="$ vps:/opt/rekeningo/api-t1 &   # v2 menyala")
    p.putaran()
    log.append("# Dimas memperbarui app ke 1.1. Budi belum.\n")
    p.hp[1][3] = "1.1"
    p.putaran(2)
    jalan = ["200 · jumlah 25000", "200 · jumlah 20000"]
    mati = ["tidak ada jawaban"] * 2
    harap(p.hasil, [jalan, jalan, mati, mati, mati, ["200 · field jumlah tidak ada"] * 2]
          + [["200 · field jumlah tidak ada", "200 · nominal 20000"]] * 2, "hasil prober per putaran")
    log.append(f"# Ringkasan {len(p.hasil)} putaran:\n")
    p.ringkasan()

    bagian("D. Sesudah deploy: Budi (app 1.0) dan Dimas (app 1.1) membayar Warung Ani")
    s1, b1 = curl("POST", "/transfers", '{"ke": 418, "jumlah": 25000}', token=budi)
    s2, _ = curl("POST", "/transfers", '{"ke": 418, "nominal": 20000}', token=dimas)
    harap((s1, json.loads(b1)["errors"][0]["field"], s2), (400, "nominal", 201), "v2: app 1.0 ditolak, app 1.1 diterima")
    saldo = sql("SELECT id, nama, saldo FROM akun WHERE id IN (417, 418, 419) ORDER BY id")
    harap(re.findall(r"\|\s*(\d+)\s*$", saldo, re.M), ["210000", "65000", "225000"], "saldo sesudah dua pembayaran")

    bagian("E. Raka ingin kembali ke v1")
    for label, folder in (("vps:/opt/rekeningo/", vps), ("laptop:", tmp / "laptop")):
        isi = sorted(x.name for x in folder.iterdir())
        harap(isi, ["api-t1"], f"isi {label}")
        log.append(f"$ ls {label}\n" + "\n".join(isi) + "\n")
    harap((filecmp.cmp(vps / "api-t1", bin_v2, shallow=False), filecmp.cmp(vps / "api-t1", BIN, shallow=False)),
          (True, False), "binary di VPS adalah v2, bukan v1")
    log.append("$ cmp vps:/opt/rekeningo/api-t1 laptop:api-t1 && echo sama\nsama\n")
    log.append("# Satu-satunya binary di VPS dan di laptop adalah v2. Binary v1 tertimpa oleh cp (di cerita: scp) ke path yang sama.\n")

    bagian("F. Kalaupun v1 dibangun ulang dari kode v1, kolomnya sudah bernama nominal")
    log.append("$ kill -TERM <pid v2>\n")
    stop()
    mulai(tampil="$ go build -o api-t1 ./cmd/api && ./api-t1 &   # binary v1 dibangun ulang dari kode v1")
    s, _ = curl("GET", "/akun/419/riwayat", token=budi)
    harap(s, 500, "v1 di skema baru: 500")
    log.append("$ kill -TERM <pid v1>\n")
    k = len(log)
    stop()
    harap(any("column t.jumlah does not exist" in x for x in log[k:]), True, "log v1 menyebut kolom t.jumlah")

    bagian("G. Kembali ke v1: kolom dikembalikan ke jumlah, v1 yang dibangun ulang dijalankan")
    log.append("# di cerita: migrate up, file baru 000007_transaksi_jumlah.up.sql berisi ALTER TABLE ini (di server, mundur lewat migration baru)\n")
    sql("ALTER TABLE transaksi RENAME COLUMN nominal TO jumlah")
    mulai(tampil="$ ./api-t1 &   # v1 yang dibangun ulang di bagian F")
    log.append("# prober yang sama, detik dihitung dari v1 menyala. Budi masih app 1.0, Dimas sudah app 1.1.\n")
    log.append(f"{'detik':<7}{'HP Budi':<41}HP Dimas\n")
    p = Prober([["Budi", budi, 419, "1.0"], ["Dimas", dimas, 417, "1.1"]])
    p.putaran(2)
    harap(p.hasil, [["200 · jumlah 25000", "200 · field nominal tidak ada"]] * 2, "v1 sesudah kolom kembali: app 1.0 jalan, app 1.1 tidak")
    log.append("# v2 melayani app 1.1, tidak app 1.0 (bagian C). v1 melayani app 1.0, tidak app 1.1. Dari dua versi yang ada, tidak satu pun melayani keduanya.\n"
               "# Rekaman halaman sesudah 1.30 mulai dari keadaan ini: kolom jumlah, kode v1.\n")
    tulis("m6.txt")


if __name__ == "__main__":
    subprocess.run(["go", "build", "-o", str(BIN), "./cmd/api"], cwd=HERE, check=True)
    pilihan = sys.argv[1:] or ["login", "topup", "bayar", "riwayat", "pertukaran", "relasi", "m1", "http", "m2", "m3", "injection", "lapisan", "m4", "koreksi", "m5", "authz", "m6"]
    for p in pilihan:
        globals()["rekam_" + p.replace("-", "_")]()
