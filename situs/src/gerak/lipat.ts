// Gerak buka/tutup blok lipat (I5a, keputusan 238) untuk skrip Blok.astro, tanpa React.
//
// Saat dibuka, isi blok tumbuh dari kepalanya ke bawah dan muncul perlahan; saat ditutup, isi kembali ke kepala.
// Blok sesudahnya ikut bergeser bersama tinggi itu, jadi pembaca melihat ke mana isi datang dan pergi.
// Durasi dan easing dari token.ts (buka: sedang + masuk, tutup: cepat + keluar), lewat `animate` mini Motion
// (Web Animations API; animasi baru di elemen yang sama menghentikan yang lama di nilai sekarangnya).
// Dengan prefers-reduced-motion tidak ada gerak sama sekali: blok langsung terbuka atau tertutup, fungsi tetap.
// Tanpa JavaScript <details> tetap bisa dibuka dan ditutup seperti biasa.
import { animate } from "motion/mini";
import { durasi, easing } from "./token";

/**
 * Rentang tinggi isi (px) yang digerakkan. Hanya bagian yang bisa terlihat yang digerakkan: batasnya tinggi layar
 * ditambah bagian isi yang sudah di atas layar. Sisa isi di bawah batas tidak terlihat dan dilepas sekaligus saat
 * gerak selesai, jadi blok 2.500 px tidak menyapu ribuan piksel dalam seperempat detik.
 * @param kini tinggi isi sekarang (0 bila tertutup, nilai tengah bila gerak sebelumnya disela)
 * @param penuh tinggi isi bila terbuka penuh
 * @param layar tinggi viewport
 * @param atas jarak tepi atas isi ke tepi atas viewport (negatif bila sudah di atas layar)
 */
export function rentangTinggi(buka: boolean, kini: number, penuh: number, layar: number, atas: number) {
  const batas = Math.max(0, Math.min(penuh, layar + Math.max(0, -atas)));
  return { dari: Math.min(Math.max(0, kini), batas), ke: buka ? batas : 0 };
}

export const kurangiGerak = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Gerak = { buka: boolean; henti: () => void };
const berjalan = new WeakMap<HTMLDetailsElement, Gerak>();

const isiDari = (el: HTMLDetailsElement) => el.querySelector<HTMLElement>(":scope > .blok__isi");

function bersihkan(isi: HTMLElement) {
  for (const p of ["height", "padding-bottom", "opacity", "overflow"]) isi.style.removeProperty(p);
  if (!isi.getAttribute("style")) isi.removeAttribute("style");
}

/** Hentikan gerak yang sedang berjalan dan buang gaya sementaranya; dipakai sebelum `open` diubah langsung. */
export function hentikan(el: HTMLDetailsElement) {
  const g = berjalan.get(el);
  if (!g) return;
  berjalan.delete(el);
  g.henti();
  const isi = isiDari(el);
  if (isi) bersihkan(isi);
}

/** Keadaan yang sedang dituju: blok yang sedang menutup dihitung tertutup, jadi klik berikutnya membukanya lagi. */
export const akanTerbuka = (el: HTMLDetailsElement) => berjalan.get(el)?.buka ?? el.open;

/** Buka atau tutup satu blok dengan gerak (tanpa gerak bila reduced motion). */
export function lipat(el: HTMLDetailsElement, buka: boolean) {
  const isi = isiDari(el);
  if (!isi || kurangiGerak()) {
    hentikan(el);
    el.open = buka;
    return;
  }
  // Ukur keadaan sekarang (termasuk nilai tengah gerak yang disela) sebelum apa pun diubah.
  const disela = berjalan.has(el);
  const terbuka = el.open;
  const kini = disela || terbuka ? isi.getBoundingClientRect().height : 0;
  const s = getComputedStyle(isi);
  const opKini = disela ? Number(s.opacity) : terbuka ? 1 : 0;
  const pbKini = disela || terbuka ? parseFloat(s.paddingBottom) : 0;
  hentikan(el);
  if (buka) el.open = true;
  const r = isi.getBoundingClientRect();
  const pbPenuh = parseFloat(getComputedStyle(isi).paddingBottom);
  const { dari, ke } = rentangTinggi(buka, kini, r.height, innerHeight, r.top);
  // Tetapkan keadaan awal sebelum frame berikutnya digambar, supaya isi penuh tidak sempat berkedip.
  isi.style.overflow = "clip";
  isi.style.height = `${dari}px`;
  isi.style.paddingBottom = `${pbKini}px`;
  isi.style.opacity = String(opKini);
  const a = animate(
    isi,
    { height: [`${dari}px`, `${ke}px`], paddingBottom: [`${pbKini}px`, `${buka ? pbPenuh : 0}px`], opacity: [opKini, buka ? 1 : 0] },
    { duration: buka ? durasi.sedang : durasi.cepat, ease: [...(buka ? easing.masuk : easing.keluar)] },
  );
  const g: Gerak = { buka, henti: () => a.stop() };
  berjalan.set(el, g);
  a.then(() => {
    if (berjalan.get(el) !== g) return; // disela gerak lain; yang baru yang membereskan
    berjalan.delete(el);
    if (!buka) el.open = false;
    bersihkan(isi);
  });
}

/** Klik kepala blok: balik keadaan yang sedang dituju. */
export const alihkan = (el: HTMLDetailsElement) => lipat(el, !akanTerbuka(el));
