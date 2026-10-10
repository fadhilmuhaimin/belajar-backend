// Gerak masuk singkat untuk isi yang berganti atau muncul karena pilihan pembaca (I5b, keputusan 248):
// diagram tahap di beranda sesudah tab dipilih, jawaban teka-teki sesudah satu pilihan ditekan.
// Isi baru datang dari sedikit di bawah posisinya dan menjadi terlihat, jadi mata tahu bagian mana yang berubah.
// Durasi dan easing dari token.ts; `animate` mini Motion (Web Animations API), tanpa React dan tanpa domMax,
// sama dengan blok lipat (keputusan 238), supaya beranda tidak memuat fitur Motion untuk satu gerak.
// Dipanggil hanya dari handler pilihan, tidak pernah saat halaman dimuat.
// Dengan prefers-reduced-motion tidak ada gerak sama sekali: isi langsung tampil di keadaan akhirnya.
import { animate } from "motion/mini";
import { durasi, easing, type NamaDurasi } from "./token";

/** Jarak geser awal (px): cukup untuk terlihat datang, tidak cukup untuk terasa melompat. */
export const GESER = 8;

/** Keyframe opacity dan transform untuk isi yang muncul. */
export function kerangkaMuncul(geser = GESER) {
  return { opacity: [0, 1], transform: [`translateY(${geser}px)`, "translateY(0px)"] };
}

export function muncul(el: Element | null, nama: NamaDurasi = "sedang") {
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  return animate(el, kerangkaMuncul(), { duration: durasi[nama], ease: easing.masuk });
}
