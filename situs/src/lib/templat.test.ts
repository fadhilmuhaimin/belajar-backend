// Setiap halaman versi baru (punya jenis, bukan versi lama) dan setiap kerangka di templat/ harus mengikuti
// urutan blok jenisnya (keputusan 118).
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cekTemplat, daftarBlok, TEMPLAT } from "./blok";

const ROOT = path.resolve(__dirname, "../..");
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data/cerita.json"), "utf8"));
const file = (p: string) => {
  const mdx = path.join(ROOT, "src/content/docs", p.replace(/\.md$/, ".mdx"));
  return fs.existsSync(mdx) ? mdx : path.join(ROOT, "src/content/docs", p);
};

describe("templat halaman", () => {
  it("kerangka di templat/ sesuai jenisnya", () => {
    for (const jenis of Object.keys(TEMPLAT)) {
      const isi = fs.readFileSync(path.join(ROOT, "templat", `${jenis}.mdx`), "utf8");
      expect(cekTemplat(jenis, daftarBlok(isi)), jenis).toEqual([]);
    }
  });

  it("halaman versi baru mengikuti templat jenisnya", () => {
    const salah: string[] = [];
    for (const h of d.halaman) {
      if (!h.jenis || h.lama || h.lebur_ke || h.diganti_oleh || !h.ada) continue;
      const err = cekTemplat(h.jenis, daftarBlok(fs.readFileSync(file(h.path), "utf8")));
      salah.push(...err.map((e) => `${h.id} (${h.jenis}): ${e}`));
    }
    expect(salah).toEqual([]);
  });
});
