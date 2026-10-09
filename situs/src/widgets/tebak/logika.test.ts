import { describe, expect, test } from "vitest";
import mentah from "../../../data/widget/beranda-m4-tebak.json";
import { DataTebak } from "./skema";
import { nilai } from "./logika";

const data = DataTebak.parse(mentah);

describe("tebak beranda M4", () => {
  test("data valid: tiga pilihan, satu benar", () => {
    expect(data.pilihan).toHaveLength(3);
    expect(data.pilihan.filter((p) => p.benar)).toHaveLength(1);
  });

  test("pilihan benar: satu alasan", () => {
    const j = data.pilihan.findIndex((p) => p.benar);
    const h = nilai(data, j);
    expect(h.benar).toBe(true);
    expect(h.alasan).toHaveLength(1);
  });

  test("pilihan salah: alasannya lalu alasan jawaban benar", () => {
    const j = data.pilihan.findIndex((p) => p.benar);
    const salah = data.pilihan.findIndex((p) => !p.benar);
    const h = nilai(data, salah);
    expect(h.benar).toBe(false);
    expect(h.jawaban).toBe(j);
    expect(h.alasan).toEqual([data.pilihan[salah]!.alasan, data.pilihan[j]!.alasan]);
  });

  test("skema menolak dua pilihan benar", () => {
    const rusak = structuredClone(mentah);
    rusak.pilihan.forEach((p: { benar: boolean }) => (p.benar = true));
    expect(DataTebak.safeParse(rusak).success).toBe(false);
  });
});
