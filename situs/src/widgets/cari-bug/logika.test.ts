import { describe, expect, test } from "vitest";
import mentah from "../../../data/widget/t1-m3-caribug.json";
import { DataCariBug } from "./skema";
import { periksa } from "./logika";

const data = DataCariBug.parse(mentah);

describe("cari-bug t1-m3 (1.19)", () => {
  test("data valid: dua baris bug, masing-masing punya alasan", () => {
    expect(data.bug).toEqual([1, 2]);
    for (const i of data.bug) expect(data.alasan[String(i)]).toBeTruthy();
  });

  test("menandai kedua baris bug: tepat", () => {
    const h = periksa(data, new Set([1, 2]));
    expect(h.tepat).toBe(true);
    expect(h.jumlahBenar).toBe(2);
    expect(h.nilai).toEqual({ 1: "benar", 2: "benar" });
  });

  test("satu bug terlewat: belum tepat", () => {
    const h = periksa(data, new Set([1]));
    expect(h.tepat).toBe(false);
    expect(h.nilai).toEqual({ 1: "benar", 2: "lewat" });
  });

  test("menandai baris biasa: dihitung salah", () => {
    const h = periksa(data, new Set([1, 2, 3]));
    expect(h.tepat).toBe(false);
    expect(h.nilai[3]).toBe("salah");
  });

  test("skema menolak baris bug tanpa alasan", () => {
    const rusak = structuredClone(mentah);
    rusak.bug.push(4);
    expect(DataCariBug.safeParse(rusak).success).toBe(false);
  });
});
