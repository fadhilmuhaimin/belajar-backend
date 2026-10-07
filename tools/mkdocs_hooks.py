"""Hook build MkDocs.

1. Validasi skenario widget alur sebelum build. Skenario yang tidak valid (id komponen tidak dikenal, langkah tanpa
   narasi atau data, jalur terlalu panjang, file rekaman hilang) menggagalkan build, bukan baru error di browser.
   Logika validasi ada di docs/widgets/alur-core.js, dijalankan lewat tools/validasi_skenario.mjs.
2. Rujukan antar halaman [[ID]] / [[ID|teks]] / [[berikutnya]] (halaman sesudahnya di urutan baca) diubah jadi link berjudul + nomor tampilan (tools/registri.py).
   ID halaman tidak pernah tampil ke pembaca.
3. Tautan "Sebelumnya" dan "Berikutnya" di akhir halaman, mengikuti urutan baca registry.
4. Sesudah build: token [[ID]] di data widget (site/widgets/data/**/*.json) diganti teks polos.
"""
import json
import pathlib
import shutil
import subprocess
import sys

from mkdocs.exceptions import PluginError

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import registri  # noqa: E402

REG = {}


def on_pre_build(config, **kwargs):
    node = shutil.which("node")
    if not node:
        raise PluginError("Validasi skenario butuh Node.js >= 22 (node tidak ditemukan di PATH).")
    r = subprocess.run([node, str(ROOT / "tools/validasi_skenario.mjs")], capture_output=True, text=True)
    if r.returncode != 0:
        raise PluginError("Skenario widget alur tidak valid:\n" + r.stderr + r.stdout)
    REG.clear()
    REG.update(registri.muat())


def lanjut(src):
    urut = registri.urutan_baca(REG)
    i = next((i for i, h in enumerate(urut) if h["path"] == src), None)
    if i is None:
        return ""
    out = []
    if i > 0:
        h = urut[i - 1]
        out.append(f'[<span>← Sebelumnya</span> {registri.label(h)}]({registri.rel(src, h["path"])}){{ .bb-lanjut__prev }}')
    if i + 1 < len(urut):
        h = urut[i + 1]
        out.append(f'[<span>Berikutnya →</span> {registri.label(h)}]({registri.rel(src, h["path"])}){{ .bb-lanjut__next }}')
    return '\n\n<nav class="bb-lanjut" aria-label="Urutan baca" markdown>\n' + "\n".join(out) + "\n</nav>\n"


def on_page_markdown(markdown, page, config, files, **kwargs):
    src = page.file.src_uri
    if "[[berikutnya]]" in markdown:
        urut = registri.urutan_baca(REG)
        i = next((i for i, h in enumerate(urut) if h["path"] == src), None)
        if i is None or i + 1 >= len(urut):
            raise PluginError(f"{src}: [[berikutnya]] dipakai, tapi halaman ini tidak punya halaman berikutnya")
        markdown = markdown.replace("[[berikutnya]]", f"[[{urut[i + 1]['id']}]]")
    try:
        markdown = registri.ganti_token(markdown, REG, dari=src)
    except ValueError as e:
        raise PluginError(f"{src}: {e}")
    return markdown + lanjut(src)


def on_post_build(config, **kwargs):
    data = pathlib.Path(config["site_dir"]) / "widgets/data"
    for p in data.rglob("*.json"):
        s = p.read_text()
        if "[[" not in s:
            continue
        # Ganti di setiap nilai string, lalu serialisasi ulang: aman untuk tanda kutip di judul.
        def ganti(o):
            if isinstance(o, str):
                return registri.ganti_token(o, REG)
            if isinstance(o, list):
                return [ganti(x) for x in o]
            if isinstance(o, dict):
                return {k: ganti(v) for k, v in o.items()}
            return o
        p.write_text(json.dumps(ganti(json.loads(s)), ensure_ascii=False))
