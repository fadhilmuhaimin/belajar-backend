// Label kejujuran untuk setiap widget (CLAUDE.md: Rekaman lab, Ilustrasi, Asumsi; skill visualisasi: chip sumber wajib).
// Logika murni tanpa DOM: skema Zod + label, dites Vitest (keputusan 116).
import { z } from "zod";

export const LABEL_SUMBER = {
  rekaman: "Rekaman lab",
  ilustrasi: "Ilustrasi",
  asumsi: "Asumsi",
} as const;

export const Sumber = z
  .object({
    jenis: z.enum(["rekaman", "ilustrasi", "asumsi"]),
    /** File output lab di repo, mis. labs/b3-stack/output/go-transfer.txt. Wajib untuk rekaman. */
    file: z.string().regex(/^labs\/[\w.\-/]+$/).optional(),
    catatan: z.string().min(1).optional(),
  })
  .strict()
  .refine((s) => s.jenis !== "rekaman" || s.file !== undefined, {
    message: "Rekaman lab wajib menyebut file output lab",
    path: ["file"],
  });

export type Sumber = z.infer<typeof Sumber>;

export function labelSumber(s: Sumber): string {
  return LABEL_SUMBER[s.jenis];
}

/** Teks title chip: catatan bila ada, kalau tidak file rekaman. */
export function keteranganSumber(s: Sumber): string {
  return s.catatan ?? s.file ?? "";
}
