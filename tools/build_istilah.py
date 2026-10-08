"""Bangun data tooltip istilah dari situs/src/content/docs/alat/glosarium.mdx (satu-satunya sumber).

Kolom "Halaman" berisi rujukan [[ID]] (mis. [[B3.1]]); plugin remark situs merendernya jadi link berjudul.
Path dan label (nomor tampilan + judul) diambil dari registry docs/widgets/data/cerita.json (tools/registri.py);
link popover hanya dibuat untuk halaman yang sudah ada.

Menghasilkan dua file:
  includes/istilah.md               definisi abbr (*[RLS]: ...), dibaca plugin
                                    situs/src/plugins/remark-abbr.mjs (keputusan 107)
  docs/javascripts/istilah-data.js  ringkasan + bab rujukan untuk popover

    python tools/build_istilah.py           # tulis ulang kedua file
    python tools/build_istilah.py --check   # gagal bila file belum sinkron dengan glosarium
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GLOS = ROOT / "situs/src/content/docs/alat/glosarium.mdx"
CERITA = ROOT / "docs/widgets/data/cerita.json"
OUT_MD = ROOT / "includes/istilah.md"
OUT_JS = ROOT / "docs/javascripts/istilah-data.js"

# Sebutan lain yang sering dipakai di teks tapi tidak tertulis di kolom istilah.
EXTRA = {
    "Authentication": ["Auth", "auth"],
    "HTTP method": ["GET", "POST", "PUT", "PATCH"],
    "PII": ["data pribadi"],
    "N+1 query": ["N+1"],
    "Span / Tracing": ["trace"],
    "Partitioning": ["partisi", "Partisi"],
}
# Kunci yang terlalu umum untuk ditandai otomatis.
SKIP = {"Index", "index", "Package", "package", "Mount", "mount", "Fake", "fake", "Mock", "mock",
        "Receiver", "receiver", "Claim", "claim", "Callback", "callback", "Metrics", "metrics",
        "Coverage", "coverage", "Scope", "scope", "Entity", "entity", "Panic", "panic"}
OK_KEY = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 ._+/\-→]*$")


def plain(md):
    return re.sub(r"\s+", " ", md.replace("**", "").replace("`", "")).strip()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def nav_paths():
    """ID halaman -> (URL relatif root situs atau None kalau belum ada, label tampilan)."""
    sys.path.insert(0, str(ROOT / "tools"))
    import registri
    return {h["id"]: (registri.url_halaman(h["path"]) if h["ada"] else None, registri.label(h, singkat=True))
            for h in registri.muat()["halaman"]}


def parse():
    paths = nav_paths()
    entries = []
    for line in GLOS.read_text().splitlines():
        m = re.match(r"^\| \*\*(.+?)\*\*(.*?) \| (.+?) \| (.+?) \|$", line)
        if not m:
            continue
        bold, rest, definition, bab = m.groups()
        term = plain(bold)
        keys = []
        for part in re.split(r" / ", re.sub(r"\s*\(.*?\)", "", term)):
            keys.append(part.strip())
        for paren in re.findall(r"\(([^)]*)\)", bold + rest):
            p = plain(paren)
            if re.fullmatch(r"[A-Za-z][A-Za-z ]{1,40}", p) and re.search(r"[A-Z]", p):
                keys.append(p)
        base = re.sub(r"\s*\(.*?\)", "", term)
        keys += EXTRA.get(base, [])
        variants = []
        for k in keys:
            variants.append(k)
            if re.search(r"[a-z]", k[1:] if len(k) > 1 else "") and k[:1].isupper() and not re.search(r"[A-Z]", k[1:]):
                variants.append(k[0].lower() + k[1:])
        keys = [k for k in dict.fromkeys(variants) if OK_KEY.match(k) and k not in SKIP and len(k) > 1]
        b = re.search(r"\[\[([^\]|]+)", bab)
        bab_no = b.group(1) if b else None
        u, n = paths.get(bab_no, (None, None))
        entries.append(dict(term=plain(bold + rest), d=plain(definition), b=bab_no, n=n, u=u,
                            s="istilah-" + slug(base), keys=keys))
    return entries


def render(entries):
    md = ["<!-- Dibuat oleh tools/build_istilah.py dari situs/src/content/docs/alat/glosarium.mdx. Jangan diedit langsung. -->"]
    data = {}
    for e in entries:
        for k in e["keys"]:
            if k in data:
                continue
            md.append(f"*[{k}]: {e['d']}")
            data[k] = {"t": e["term"], "d": e["d"], "b": e["b"], "n": e["n"], "u": e["u"], "s": e["s"]}
    js = ("// Dibuat oleh tools/build_istilah.py dari situs/src/content/docs/alat/glosarium.mdx. Jangan diedit langsung.\n"
          "window.ISTILAH = " + json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + ";\n")
    return "\n".join(md) + "\n", js


if __name__ == "__main__":
    md, js = render(parse())
    if "--check" in sys.argv:
        stale = [p for p, c in ((OUT_MD, md), (OUT_JS, js)) if not p.exists() or p.read_text() != c]
        if stale:
            sys.exit("belum sinkron, jalankan python tools/build_istilah.py: " + ", ".join(str(p.relative_to(ROOT)) for p in stale))
        print("istilah sinkron")
        sys.exit(0)
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text(md)
    OUT_JS.write_text(js)
    print(f"ok: {md.count(chr(10)) - 1} kunci istilah")
