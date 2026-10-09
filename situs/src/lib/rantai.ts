// Diagram rantai (keputusan 212): satu atau beberapa baris langkah berpanah, tiap baris berlabel. Dipakai untuk
// sebelum/sesudah, membandingkan opsi, dan mekanisme konsep. Data JSON di data/diagram/, divalidasi di sini.
import { z } from "zod";

const Teks = z.string().min(1);
export const Nada = z.enum(["biasa", "system", "good", "warn", "old"]);

export const DataRantai = z
  .object({
    id: Teks,
    judul: Teks,
    sumber: z.object({ jenis: z.enum(["rekaman", "ilustrasi", "asumsi"]), teks: Teks }),
    baris: z
      .array(
        z
          .object({
            label: Teks,
            sub: Teks.optional(),
            simpul: z.array(z.object({ teks: Teks, sub: Teks.optional(), nada: Nada.default("biasa"), kode: z.boolean().default(false) }).strict()).min(1).max(6),
          })
          .strict(),
      )
      .min(1)
      .max(4),
    catatan: Teks.optional(),
  })
  .strict();

export type DataRantai = z.infer<typeof DataRantai>;
