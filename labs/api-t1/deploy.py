"""Lab C3: deploy Tahap 1 (satu instance), deploy gagal karena konfigurasi, lalu rollback.

Selama deploy, prober mengirim GET /sehat setiap 100 ms dan menghitung yang gagal,
jadi downtime terukur, bukan ditebak. Keluaran: output/c3-deploy.txt
Jalankan: python deploy.py   (butuh: make -C ../b3-race up, Docker)
"""
import pathlib, subprocess, threading, time, urllib.request, json

HERE = pathlib.Path(__file__).parent
URL = "http://127.0.0.1:18082/sehat"
DB = "postgres://lab:lab@host.docker.internal:54333/lab?search_path=t1"
log, hasil, berhenti = [], [], threading.Event()


def sh(cmd, tampil=None, simpan=True):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if simpan:
        log.append(f"$ {tampil or cmd}\n" + (r.stdout + r.stderr).rstrip() + "\n")
    return r


def sehat():
    try:
        with urllib.request.urlopen(URL, timeout=0.5) as r:
            return r.status, json.loads(r.read())
    except Exception as e:
        return None, str(e.__class__.__name__)


def prober():
    while not berhenti.is_set():
        hasil.append((time.monotonic(), sehat()[0] == 200))
        time.sleep(0.1)


def jalankan(versi, secret=True):
    env = f"-e DATABASE_URL='{DB}'" + (" -e TOKEN_SECRET=rahasia-lab-lokal" if secret else "")
    sh(f"docker run -d --name rekeningo-api -p 18082:8080 {env} rekeningo-api:{versi}",
       f"docker run -d --name rekeningo-api -p 18082:8080 -e DATABASE_URL=... "
       + ("-e TOKEN_SECRET=... " if secret else "") + f"rekeningo-api:{versi}", simpan=True)
    log[-1] = log[-1].split("\n")[0] + "\n"   # id container tidak perlu ditampilkan


def tunggu_sehat(batas=10):
    t0 = time.monotonic()
    while time.monotonic() - t0 < batas:
        s, body = sehat()
        if s == 200:
            log.append(f"$ curl {URL}\n200 {json.dumps(body)}  (siap setelah {time.monotonic() - t0:.1f} detik)\n")
            return True
        time.sleep(0.2)
    log.append(f"$ curl {URL}\ntidak ada jawaban selama {batas} detik\n")
    return False


def ukur(judul, aksi):
    """Jalankan aksi deploy sambil prober berjalan, lalu tulis ringkasan downtime."""
    hasil.clear(); berhenti.clear()
    t = threading.Thread(target=prober); t.start()
    time.sleep(1)
    aksi()
    time.sleep(1)
    berhenti.set(); t.join()
    gagal = [w for w, ok in hasil if not ok]
    lama = (gagal[-1] - gagal[0] + 0.1) if gagal else 0
    log.append(f"# Ringkasan prober ({judul}): {len(hasil)} request, {len(gagal)} gagal, "
               f"tidak bisa dipakai sekitar {lama:.1f} detik.\n")


def ganti(versi, secret=True, batas=5):
    sh("docker rm -f rekeningo-api"); log[-1] = log[-1].split("\n")[0] + "\n"
    jalankan(versi, secret)
    ok = tunggu_sehat(batas)
    if not ok:
        sh("docker logs rekeningo-api 2>&1 | sed -E 's/^[0-9/]+ [0-9:]+ //'", "docker logs rekeningo-api")
    return ok


sh("docker rm -f rekeningo-api", simpan=False)
for v in ("v1", "v2", "v3"):
    sh(f"docker build -q --build-arg VERSI={v} -t rekeningo-api:{v} .", simpan=False)
sh("docker image ls rekeningo-api --format '{{.Repository}}:{{.Tag}}  {{.Size}}'", "docker image ls rekeningo-api")

log.append("# v1 berjalan.")
jalankan("v1")
tunggu_sehat()

log.append("# A. Deploy v2 ala Tahap 1: hentikan v1, jalankan v2. Prober: GET /sehat setiap 100 ms.\n")
ukur("deploy v2 sukses", lambda: ganti("v2"))

log.append("# B. Deploy v3, tapi konfigurasi deploy lupa TOKEN_SECRET.\n")
def gagal_lalu_rollback():
    if not ganti("v3", secret=False):
        log.append("# Rollback: kembali ke image v2, versi terakhir yang sehat.\n")
        ganti("v2")
ukur("deploy v3 gagal + rollback", gagal_lalu_rollback)

sh("docker rm -f rekeningo-api", simpan=False)
teks = "\n".join(log) + "\n"
(HERE / "output/c3-deploy.txt").write_text(teks)
print(teks)
