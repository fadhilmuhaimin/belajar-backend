// Token gerak situs (keputusan 231). Satu-satunya tempat angka durasi dan easing untuk komponen React.
//
// Aturan gerak:
// 1. Setiap gerak dipicu pembaca: klik, scroll, atau pilihan. Tidak ada animasi yang berjalan sendiri
//    (tanpa autoplay, tanpa loop, tanpa gerak saat halaman dimuat).
// 2. Gerak hanya untuk menjelaskan perubahan: apa yang muncul, pindah, atau hilang. Tidak ada gerak dekoratif.
// 3. Komponen tidak menulis angka durasi sendiri; ambil dari sini lewat `useGerak()` di MotionProvider.
//    Tes token.test.ts memindai src/ dan gagal bila ada `duration: <angka>` di file lain.
// 4. Dengan prefers-reduced-motion semua durasi jadi 0 dan `initial` jadi false (`useAwal()`):
//    fungsi tetap, gerak hilang. Diperiksa situs/tools/ukur-gerak.mjs di gerbang --layar.
//
// Angka mengikuti NN/g "Executing UX Animations: Duration and Motion Characteristics":
// sebagian besar animasi UI 100–500 ms, umpan balik sederhana ±100 ms, perubahan besar 200–300 ms;
// ease-out untuk yang masuk, ease-in untuk yang keluar.
// https://www.nngroup.com/articles/animation-duration/

export const durasi = {
  /** Umpan balik kecil: tombol, pilihan, chip. */
  cepat: 0.15,
  /** Panel muncul atau tertutup, blok dibuka. */
  sedang: 0.25,
} as const;

export type NamaDurasi = keyof typeof durasi;

/** Kurva bézier kubik [x1, y1, x2, y2]. */
type Kurva = readonly [number, number, number, number];

export const easing = {
  /** Masuk: mulai cepat lalu melambat sebelum berhenti (ease-out). */
  masuk: [0, 0, 0.2, 1],
  /** Keluar: mulai pelan lalu mempercepat (ease-in). */
  keluar: [0.4, 0, 1, 1],
} as const satisfies Record<string, Kurva>;

export type NamaEasing = keyof typeof easing;

export interface Transisi {
  duration: number;
  ease: Kurva;
}

/** Transisi siap pakai untuk prop `transition` Motion. `kurangi` true = prefers-reduced-motion. */
export function transisi(nama: NamaDurasi, arah: NamaEasing = "masuk", kurangi = false): Transisi {
  return { duration: kurangi ? 0 : durasi[nama], ease: easing[arah] };
}
