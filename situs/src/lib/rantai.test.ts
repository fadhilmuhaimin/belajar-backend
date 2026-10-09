import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DataRantai } from "./rantai";

const dir = path.resolve(__dirname, "../../data/diagram");
const berkas = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

describe("diagram rantai", () => {
  test.each(berkas)("%s valid dan id sama dengan nama file", (f) => {
    const d = DataRantai.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    expect(d.id).toBe(f.replace(/\.json$/, ""));
  });
  test("skema menolak baris tanpa simpul", () => {
    expect(DataRantai.safeParse({ id: "x", judul: "x", sumber: { jenis: "asumsi", teks: "x" }, baris: [{ label: "a", simpul: [] }] }).success).toBe(false);
  });
});
