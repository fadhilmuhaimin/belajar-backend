import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { durasi, easing, transisi } from "./token";

describe("token gerak", () => {
  it("durasi dalam rentang 100–500 ms dan cepat < sedang", () => {
    for (const d of Object.values(durasi)) {
      expect(d).toBeGreaterThanOrEqual(0.1);
      expect(d).toBeLessThanOrEqual(0.5);
    }
    expect(durasi.cepat).toBeLessThan(durasi.sedang);
  });

  it("easing berupa bézier kubik dengan x di 0–1", () => {
    for (const k of Object.values(easing)) {
      expect(k).toHaveLength(4);
      for (const x of [k[0], k[2]]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
      }
    }
  });

  it("transisi memakai token, dan durasi 0 saat reduced motion", () => {
    expect(transisi("sedang")).toEqual({ duration: durasi.sedang, ease: easing.masuk });
    expect(transisi("cepat", "keluar")).toEqual({ duration: durasi.cepat, ease: easing.keluar });
    expect(transisi("sedang", "masuk", true).duration).toBe(0);
  });

  it("tidak ada angka durasi di komponen lain", () => {
    const akar = fileURLToPath(new URL("..", import.meta.url));
    const file: string[] = [];
    const jelajah = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) jelajah(p);
        else if (/\.(tsx?|astro)$/.test(n) && !n.endsWith(".test.ts")) file.push(p);
      }
    };
    jelajah(akar);
    const pelanggar = file
      .filter((p) => !p.endsWith(join("gerak", "token.ts")))
      .filter((p) => /\bduration\s*:\s*[\d.]/.test(readFileSync(p, "utf8")))
      .map((p) => relative(akar, p));
    expect(pelanggar).toEqual([]);
  });
});
