// Skema data widget tebak (keputusan 208): satu adegan, satu pertanyaan, 2–4 pilihan dengan alasan per pilihan.
// Dipakai beranda (teka-teki M4) dan nanti halaman 1.42 (pratinjau PRD v2).
import { z } from "zod";

const Teks = z.string().min(1);

export const DataTebak = z
  .object({
    id: Teks,
    judul: Teks,
    sumber: z.object({ jenis: z.enum(["rekaman", "ilustrasi", "asumsi"]), teks: Teks }),
    adegan: z.array(Teks).min(1).max(3),
    // Layar HP yang dilihat tokoh (opsional). Label adalah elemen DOM, bukan teks di dalam gambar.
    layar: z
      .object({
        judul: Teks,
        status: Teks,
        baris: z.array(z.object({ kiri: Teks, kanan: Teks, tanda: z.enum(["minus", "plus", "biasa"]).default("biasa") })).min(1).max(4),
      })
      .optional(),
    pertanyaan: Teks,
    pilihan: z.array(z.object({ teks: Teks, benar: z.boolean(), alasan: Teks })).min(2).max(4),
    penutup: Teks,
    label: z.object({ sumber: Teks, tebakDulu: Teks, benar: Teks, belum: Teks, jawaban: Teks, ulang: Teks }),
  })
  .strict()
  .superRefine((d, ctx) => {
    const n = d.pilihan.filter((p) => p.benar).length;
    if (n !== 1) ctx.addIssue({ code: "custom", path: ["pilihan"], message: `harus tepat satu pilihan benar, ada ${n}` });
  });

export type DataTebak = z.infer<typeof DataTebak>;
