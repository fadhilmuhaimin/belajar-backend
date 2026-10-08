// Logika murni widget jumlah-total (keputusan 144): tanpa DOM, dites Vitest.
// Menghitung keadaan saldo setelah n langkah, dan tiga hal yang harus selalu benar.
import type { DataJumlahTotal } from "./skema";

export type Status = "ok" | "proses" | "gagal";

export interface Keadaan {
  posisi: number; // jumlah langkah yang sudah jalan
  selesai: boolean; // tidak ada langkah lagi (semua jalan, atau server mati)
  saldo: Record<string, number>;
  berubah: string[]; // akun yang saldonya berubah di langkah terakhir
  transaksi: number;
  total: number;
  totalAwal: number;
  cek: { lengkap: Status; tidakNegatif: Status; totalTetap: Status };
}

const jumlah = (saldo: Record<string, number>) => Object.values(saldo).reduce((a, b) => a + b, 0);

/** Batas langkah yang bisa dijalankan: semua langkah, atau sampai server mati. */
export function batas(data: DataJumlahTotal, mati: boolean): number {
  return mati ? data.ubah.berhentiSetelah : data.langkah.length;
}

export function keadaan(data: DataJumlahTotal, posisi: number, mati = false): Keadaan {
  const n = data.langkah.length;
  const akhir = batas(data, mati);
  const p = Math.max(0, Math.min(posisi, akhir));
  const saldo: Record<string, number> = Object.fromEntries(data.akun.map((a) => [a.id, a.saldo]));
  const totalAwal = jumlah(saldo);
  let transaksi = 0;
  let berubah: string[] = [];
  for (let i = 0; i < p; i++) {
    const l = data.langkah[i];
    for (const u of l.ubah) saldo[u.akun] += u.delta;
    if (l.catat) transaksi += 1;
    berubah = l.ubah.map((u) => u.akun);
  }
  const selesai = p === akhir;
  const total = jumlah(saldo);
  // Di tengah jalan, keadaan belum boleh dinilai; setelah selesai, "sebagian" berarti gagal.
  const tengah = p > 0 && p < n;
  const lengkap: Status = !tengah ? "ok" : selesai ? "gagal" : "proses";
  const tidakNegatif: Status = Object.values(saldo).every((s) => s >= 0) ? "ok" : "gagal";
  const totalTetap: Status = total === totalAwal ? "ok" : tengah && !selesai ? "proses" : "gagal";
  return { posisi: p, selesai, saldo, berubah, transaksi, total, totalAwal, cek: { lengkap, tidakNegatif, totalTetap } };
}

/** Rupiah tanpa desimal dengan titik ribuan, sama dengan gaya teks halaman (Rp25.000). */
export function rupiah(n: number): string {
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "−Rp" : "Rp") + s;
}
