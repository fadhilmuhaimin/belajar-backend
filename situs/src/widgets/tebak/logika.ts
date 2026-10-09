// Logika murni widget tebak (keputusan 208): tanpa DOM, dites Vitest.
import type { DataTebak } from "./skema";

export interface Hasil {
  benar: boolean;
  // alasan pilihan pembaca, lalu alasan jawaban benar bila pembaca belum tepat
  alasan: string[];
  jawaban: number;
}

export function nilai(data: DataTebak, dipilih: number): Hasil {
  const jawaban = data.pilihan.findIndex((p) => p.benar);
  const p = data.pilihan[dipilih];
  if (!p) throw new Error(`pilihan ${dipilih} tidak ada`);
  const alasan = p.benar ? [p.alasan] : [p.alasan, data.pilihan[jawaban]!.alasan];
  return { benar: p.benar, alasan, jawaban };
}
