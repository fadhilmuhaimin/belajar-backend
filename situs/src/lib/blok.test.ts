import { describe, expect, it } from "vitest";
import { cekTemplat, daftarBlok, menitBlok, slugBlok } from "./blok";

const konsep = `
<Blok nama="Mulai" buka>a</Blok>
<Blok nama="Coba" buka aman="Kalau berhenti di sini, kamu sudah tahu X.">b</Blok>
<Blok nama="Paham" menit={6}>c</Blok>
<Blok nama="Putuskan">d</Blok>
<Blok nama="Kunci">e</Blok>`;

describe("blok", () => {
  it("membaca nama, buka, dan menit dari MDX", () => {
    const b = daftarBlok(konsep);
    expect(b.map((x) => x.nama)).toEqual(["Mulai", "Coba", "Paham", "Putuskan", "Kunci"]);
    expect(b.map((x) => x.buka)).toEqual([true, true, false, false, false]);
    expect(menitBlok("konsep", b[2]!)).toBe(6);
    expect(menitBlok("konsep", b[0]!)).toBe(1);
  });

  it("slug stabil", () => {
    expect(slugBlok("Yang Raka kira")).toBe("blok-yang-raka-kira");
    expect(slugBlok("Kapan keputusan ini salah")).toBe("blok-kapan-keputusan-ini-salah");
  });

  it("konsep lima blok dengan dua terbuka lolos templat", () => {
    expect(cekTemplat("konsep", daftarBlok(konsep))).toEqual([]);
  });

  it("menolak urutan salah, blok terbuka yang salah, dan jumlah kurang", () => {
    const tukar = konsep.replace('"Putuskan"', '"Kunci2"');
    expect(cekTemplat("konsep", daftarBlok(tukar))[0]).toContain("urutan blok");
    const semuaTerbuka = konsep.replace('nama="Paham" menit={6}', 'nama="Paham" buka');
    expect(cekTemplat("konsep", daftarBlok(semuaTerbuka))).toContain('blok "Paham" harus tertutup saat dimuat');
    expect(cekTemplat("prd", daftarBlok('<Blok nama="A" buka>x</Blok>'))).toContain("1 blok, minimal 3");
    expect(cekTemplat("tidak-ada", [])).toEqual(['jenis "tidak-ada" tidak punya templat']);
  });

  it("blok tanpa nama ditolak", () => {
    expect(() => daftarBlok("<Blok buka>x</Blok>")).toThrow("Blok tanpa nama");
  });
});
