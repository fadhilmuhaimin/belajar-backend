// Peta fitur (keputusan 211): satu fitur diikuti langkah demi langkah melintasi app, backend, dan database.
// Data JSON divalidasi di sini; komponen PetaFitur.astro hanya merender.
import { z } from "zod";

const Teks = z.string().min(1);

export const DataPetaFitur = z
  .object({
    id: Teks,
    judul: Teks,
    sumber: z.object({ jenis: z.enum(["rekaman", "ilustrasi", "asumsi"]), teks: Teks }),
    jalur: z.array(z.object({ id: Teks, nama: Teks, jenis: z.enum(["app", "backend", "db"]) }).strict()).min(2).max(5),
    langkah: z
      .array(z.object({ jalur: Teks, judul: Teks, rinci: z.array(Teks).max(5).default([]), kode: z.array(Teks).max(6).default([]) }).strict())
      .min(2)
      .max(10),
    catatan: Teks.optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const ids = new Set(d.jalur.map((j) => j.id));
    d.langkah.forEach((l, i) => {
      if (!ids.has(l.jalur)) ctx.addIssue({ code: "custom", path: ["langkah", i, "jalur"], message: `jalur "${l.jalur}" tidak dikenal` });
    });
  });

export type DataPetaFitur = z.infer<typeof DataPetaFitur>;

// Kolom tiap langkah (1-based) untuk grid; langkah berurutan jadi baris.
export const kolom = (d: DataPetaFitur, l: { jalur: string }) => d.jalur.findIndex((j) => j.id === l.jalur) + 1;

// Baris tiap langkah di jalurnya (2-based, baris 1 = nama jalur): langkah di jalur yang sama ditumpuk, jadi tinggi
// diagram = jalur terpanjang, bukan jumlah langkah. Urutan waktu dibaca dari nomor langkah.
export const baris = (d: DataPetaFitur, i: number) => 2 + d.langkah.slice(0, i).filter((l) => l.jalur === d.langkah[i]!.jalur).length;
