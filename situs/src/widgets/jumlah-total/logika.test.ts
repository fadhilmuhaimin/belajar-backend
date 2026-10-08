import { describe, expect, test } from "vitest";
import mentah from "../../../data/widget/t1-pertukaran.json";
import { DataJumlahTotal } from "./skema";
import { keadaan, rupiah } from "./logika";

const data = DataJumlahTotal.parse(mentah);

describe("jumlah-total t1-pertukaran (1.11)", () => {
  test("total awal sama dengan rekaman lab: Rp25.000.000", () => {
    expect(keadaan(data, 0).total).toBe(25_000_000);
    expect(Object.values(keadaan(data, 0).cek)).toEqual(["ok", "ok", "ok"]);
  });

  test("setelah tiga perintah: saldo seperti rekaman, total tetap, satu transaksi", () => {
    const k = keadaan(data, 3);
    expect(k.saldo).toEqual({ budi: 225_000, ani: 25_000, lain: 24_750_000 });
    expect(k.transaksi).toBe(1);
    expect(k.total).toBe(k.totalAwal);
    expect(k.selesai).toBe(true);
    expect(k.cek).toEqual({ lengkap: "ok", tidakNegatif: "ok", totalTetap: "ok" });
  });

  test("di tengah jalan: belum dinilai gagal", () => {
    const k = keadaan(data, 1);
    expect(k.total).toBe(24_975_000);
    expect(k.cek.lengkap).toBe("proses");
    expect(k.cek.totalTetap).toBe("proses");
    expect(k.berubah).toEqual(["budi"]);
  });

  test("ubah satu hal: server mati setelah perintah 1, invarian 1 dan 3 dilanggar", () => {
    const k = keadaan(data, 3, true);
    expect(k.posisi).toBe(1);
    expect(k.selesai).toBe(true);
    expect(k.total).toBe(24_975_000);
    expect(k.transaksi).toBe(0);
    expect(k.cek).toEqual({ lengkap: "gagal", tidakNegatif: "ok", totalTetap: "gagal" });
  });

  test("jawaban tebakan cocok dengan hasil", () => {
    expect(data.tebak.pilihan[data.tebak.jawaban]).toBe(rupiah(keadaan(data, 3).total));
  });

  test("skema menolak akun yang tidak dikenal", () => {
    const rusak = structuredClone(mentah);
    rusak.langkah[0]!.ubah![0]!.akun = "dimas";
    expect(DataJumlahTotal.safeParse(rusak).success).toBe(false);
  });

  test("rupiah memakai titik ribuan", () => {
    expect(rupiah(24_975_000)).toBe("Rp24.975.000");
    expect(rupiah(-5000)).toBe("−Rp5.000");
  });
});
