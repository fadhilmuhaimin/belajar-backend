// Skema data diagram arsitektur per tahap (registry `tahap[].arsitektur`, keputusan 232).
// Satu skema dipakai tiga tempat: validasi registry, komponen DiagramArsitektur, dan widget lama `arsitektur`
// (yang membaca field yang sama tanpa skema).
import { z } from "zod";

export const Zona = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    label: z.string().min(2),
  })
  .strict();

export const Kotak = z
  .object({
    label: z.string().min(2),
    baru: z.boolean().optional(), // komponen baru di tahap ini
    berubah: z.boolean().optional(), // komponen lama yang isinya berubah
    lepas: z.boolean().optional(), // tidak ada panah ke kotak sesudahnya di baris yang sama
    catatan: z.string().optional(), // dibuka di bawah diagram saat kotak dipilih
    zona: z.string().optional(), // id zona tempat kotak berada (mis. satu VPS)
  })
  .strict()
  .refine((k) => !(k.baru && k.berubah), { message: "kotak tidak bisa baru sekaligus berubah" });

export const Arsitektur = z
  .object({
    baris: z.array(z.array(Kotak).min(1)).min(1),
    caption: z.string().optional(),
    zona: z.array(Zona).optional(),
  })
  .strict()
  .superRefine((a, ctx) => {
    const ids = new Set((a.zona ?? []).map((z) => z.id));
    if (ids.size !== (a.zona ?? []).length) ctx.addIssue({ code: "custom", message: "id zona ganda" });
    for (const k of a.baris.flat()) {
      if (k.zona && !ids.has(k.zona)) ctx.addIssue({ code: "custom", message: `${k.label}: zona ${k.zona} tidak dikenal` });
    }
    for (const z of a.zona ?? []) {
      if (!a.baris.flat().some((k) => k.zona === z.id)) ctx.addIssue({ code: "custom", message: `zona ${z.id} tanpa kotak` });
    }
  });

export type Zona = z.infer<typeof Zona>;
export type Kotak = z.infer<typeof Kotak>;
export type Arsitektur = z.infer<typeof Arsitektur>;
