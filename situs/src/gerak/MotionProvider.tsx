// Pembungkus gerak untuk setiap island React yang memakai Motion (keputusan 231). Aturan gerak ada di token.ts.
//
// - LazyMotion + `m`: komponen memakai `m.div` dari "motion/react-m"; fitur animasi dimuat terpisah
//   (fitur.ts) setelah island di-hydrate. `strict` menolak `motion.div` yang memuat semua fitur sekaligus.
// - MotionConfig reducedMotion="user" mematikan animasi transform dan layout saat prefers-reduced-motion.
//   Menurut dokumentasi Motion, opacity dan warna tetap beranimasi, jadi durasi bawaan juga dibuat 0
//   dan `useGerak()` memberi durasi 0: semua gerak hilang, fungsi tetap.
import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, useReducedMotion } from "motion/react";
import { transisi, type NamaDurasi, type NamaEasing } from "./token";

const muatFitur = () => import("./fitur").then((m) => m.default);

export default function MotionProvider({ children }: { children: ReactNode }) {
  const kurangi = useReducedMotion() === true;
  return (
    <LazyMotion features={muatFitur} strict>
      <MotionConfig reducedMotion="user" transition={transisi("sedang", "masuk", kurangi)}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

/** Transisi dari token, sudah memperhitungkan prefers-reduced-motion. */
export function useGerak(nama: NamaDurasi, arah: NamaEasing = "masuk") {
  return transisi(nama, arah, useReducedMotion() === true);
}

/**
 * Nilai prop `initial` untuk elemen yang muncul. Saat prefers-reduced-motion hasilnya `false`:
 * elemen langsung tampil di keadaan akhirnya. Durasi 0 saja tidak cukup, karena frame pertama
 * masih menggambar keadaan `initial` (diukur ukur-gerak.mjs: opacity 0 dan geser −8 px).
 */
export function useAwal<T>(nilai: T): T | false {
  return useReducedMotion() === true ? false : nilai;
}
