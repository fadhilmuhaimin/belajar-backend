import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import mentah from "../../data/widget/t1-peta-bayar.json";
import { DataPetaFitur, kolom, baris } from "./peta-fitur";

const d = DataPetaFitur.parse(mentah);

describe("peta fitur 1.9 bayar", () => {
  test("empat jalur, langkah melewati semuanya", () => {
    expect(d.jalur.map((j) => j.jenis)).toEqual(["app", "backend", "db", "app"]);
    expect(new Set(d.langkah.map((l) => l.jalur)).size).toBe(4);
  });
  test("kolom mengikuti urutan jalur", () => {
    expect(kolom(d, d.langkah[0]!)).toBe(1);
    expect(d.langkah.map((l) => kolom(d, l)).every((k) => k >= 1 && k <= 4)).toBe(true);
  });
  test("langkah di jalur yang sama ditumpuk", () => {
    // App Budi: langkah 1 dan 5; Backend: 2 dan 3; PostgreSQL: 4; App Ani: 6
    expect(d.langkah.map((_, i) => baris(d, i))).toEqual([2, 2, 3, 2, 3, 2]);
  });
  test("skema menolak jalur yang tidak dikenal", () => {
    const rusak = structuredClone(mentah);
    rusak.langkah[0].jalur = "server";
    expect(DataPetaFitur.safeParse(rusak).success).toBe(false);
  });
});

const dir = path.resolve(__dirname, "../../data/widget");
describe("semua peta fitur", () => {
  test.each(fs.readdirSync(dir).filter((f) => /^t1-peta-.*\.json$/.test(f)))("%s valid", (f) => {
    const x = DataPetaFitur.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    expect(x.id).toBe(f.replace(/\.json$/, ""));
  });
});
