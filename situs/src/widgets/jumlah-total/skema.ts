// Skema data widget jumlah-total (keputusan 144). Data JSON divalidasi saat build dan di tes.
import { z } from "zod";

const Rupiah = z.number().int();

export const Akun = z.object({
  id: z.string().min(1),
  nama: z.string().min(1),
  saldo: Rupiah.nonnegative(),
});

export const Langkah = z.object({
  sql: z.string().min(1),
  ubah: z.array(z.object({ akun: z.string().min(1), delta: Rupiah })).default([]),
  catat: z.boolean().default(false),
});

export const DataJumlahTotal = z
  .object({
    id: z.string().min(1),
    judul: z.string().min(1),
    sumber: z.object({ jenis: z.enum(["rekaman", "ilustrasi", "asumsi"]), teks: z.string().min(1) }),
    akun: z.array(Akun).min(2),
    langkah: z.array(Langkah).min(2),
    tebak: z.object({
      q: z.string().min(1),
      pilihan: z.array(z.string().min(1)).min(2).max(4),
      jawaban: z.number().int().nonnegative(),
      alasan: z.string().min(1),
    }),
    ubah: z.object({ label: z.string().min(1), berhentiSetelah: z.number().int().positive(), alasan: z.string().min(1) }),
    label: z.object({
      sumber: z.string(),
      tebakDulu: z.string(),
      berikutnya: z.string(),
      ulang: z.string(),
      akun: z.string(),
      saldo: z.string(),
      total: z.string(),
      transaksi: z.string(),
      cekJudul: z.string(),
      cek: z.object({ lengkap: z.string(), tidakNegatif: z.string(), totalTetap: z.string() }),
      status: z.object({ ok: z.string(), proses: z.string(), gagal: z.string() }),
      mati: z.string(),
    }),
  })
  .superRefine((d, ctx) => {
    const ids = new Set(d.akun.map((a) => a.id));
    d.langkah.forEach((l, i) =>
      l.ubah.forEach((u) => {
        if (!ids.has(u.akun)) ctx.addIssue({ code: "custom", path: ["langkah", i], message: `akun tidak dikenal: ${u.akun}` });
      }),
    );
    if (d.tebak.jawaban >= d.tebak.pilihan.length) ctx.addIssue({ code: "custom", path: ["tebak", "jawaban"], message: "di luar pilihan" });
    if (d.ubah.berhentiSetelah >= d.langkah.length) ctx.addIssue({ code: "custom", path: ["ubah"], message: "harus berhenti sebelum langkah terakhir" });
  });

export type DataJumlahTotal = z.infer<typeof DataJumlahTotal>;
