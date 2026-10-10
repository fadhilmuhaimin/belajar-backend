// Tata letak diagram arsitektur tanpa DOM dan tanpa React Flow (keputusan 232): dari data registry ke posisi kotak,
// zona, dan panah. Dites Vitest; komponen hanya menerjemahkan hasilnya ke node dan edge React Flow.
import type { Arsitektur, Kotak } from "./skema";

export type Arah = "mendatar" | "tegak";
export type Status = "baru" | "berubah" | "lama";

export const UKURAN = {
  lebar: 168, // lebar kotak
  tinggi: 64, // tinggi kotak (label + status)
  jarakAlur: 56, // jarak antarkotak searah panah; cukup untuk panah dan dua padding zona
  jarakBaris: 40, // jarak antarbaris
  padZona: 14, // padding zona di sekeliling kotak
  labelZona: 26, // ruang label di atas zona
  bantalan: 24, // ruang fitView di atas dan bawah tata, ditambahkan ke tinggi wadah
} as const;

export type TataKotak = { id: string; kotak: Kotak; status: Status; x: number; y: number };
export type TataZona = { id: string; label: string; x: number; y: number; lebar: number; tinggi: number };
export type TataPanah = { id: string; dari: string; ke: string };
export type Tata = { kotak: TataKotak[]; zona: TataZona[]; panah: TataPanah[]; lebar: number; tinggi: number };

export const statusKotak = (k: Kotak): Status => (k.baru ? "baru" : k.berubah ? "berubah" : "lama");

export const LABEL_STATUS: Record<Status, string> = { baru: "baru", berubah: "berubah", lama: "sudah ada" };

// Lebar minimum wadah (px) supaya tata mendatar muat pada zoom 1; di bawahnya diagram dipasang tegak.
export function lebarMendatar(a: Arsitektur): number {
  const n = Math.max(...a.baris.map((b) => b.length));
  return n * UKURAN.lebar + (n - 1) * UKURAN.jarakAlur + 2 * UKURAN.padZona;
}

export function tata(a: Arsitektur, arah: Arah): Tata {
  const { lebar, tinggi, jarakAlur, jarakBaris, padZona, labelZona } = UKURAN;
  const adaZona = (a.zona?.length ?? 0) > 0;
  // Ruang di atas (dan kiri) untuk zona supaya label zona tidak terpotong.
  const atas = adaZona ? padZona + labelZona : 0;
  const kiri = adaZona ? padZona : 0;
  // Jarak antarbaris diperlebar bila zona ada, supaya zona dari dua baris tidak saling menimpa.
  const sela = adaZona ? jarakBaris + 2 * padZona + labelZona : jarakBaris;
  const kotak: TataKotak[] = [];
  const panah: TataPanah[] = [];
  // Tata tegak: label zona ada di atas kotak, searah alur. Saat zona berganti di antara dua kotak, jaraknya diperlebar
  // supaya bawah zona pertama, celah 12 px, label, dan padding zona kedua muat di antara keduanya.
  const jarakGantiZona = Math.max(jarakAlur, 2 * padZona + labelZona + 12);
  a.baris.forEach((baris, r) => {
    let alur = 0;
    baris.forEach((k, i) => {
      if (i > 0) {
        const ganti = adaZona && arah === "tegak" && k.zona !== baris[i - 1].zona;
        alur += (arah === "mendatar" ? lebar : tinggi) + (ganti ? jarakGantiZona : jarakAlur);
      }
      const x = arah === "mendatar" ? alur : r * (lebar + sela);
      const y = arah === "mendatar" ? r * (tinggi + sela) : alur;
      kotak.push({ id: `k-${r}-${i}`, kotak: k, status: statusKotak(k), x: x + kiri, y: y + atas });
      if (i < baris.length - 1 && !k.lepas) panah.push({ id: `p-${r}-${i}`, dari: `k-${r}-${i}`, ke: `k-${r}-${i + 1}` });
    });
  });
  const zona: TataZona[] = (a.zona ?? []).map((z) => {
    const isi = kotak.filter((t) => t.kotak.zona === z.id);
    const x0 = Math.min(...isi.map((t) => t.x)) - padZona;
    const y0 = Math.min(...isi.map((t) => t.y)) - padZona - labelZona;
    const x1 = Math.max(...isi.map((t) => t.x + lebar)) + padZona;
    const y1 = Math.max(...isi.map((t) => t.y + tinggi)) + padZona;
    return { id: `z-${z.id}`, label: z.label, x: x0, y: y0, lebar: x1 - x0, tinggi: y1 - y0 };
  });
  const semuaX = [...kotak.map((t) => t.x + lebar), ...zona.map((z) => z.x + z.lebar)];
  const semuaY = [...kotak.map((t) => t.y + tinggi), ...zona.map((z) => z.y + z.tinggi)];
  return { kotak, zona, panah, lebar: Math.max(...semuaX), tinggi: Math.max(...semuaY) };
}

// Tinggi wadah yang dipesan sejak SSR (review PR #161, keputusan 248), supaya versi statis berganti ke React Flow
// tanpa layout shift. Server belum tahu lebar wadah, jadi kedua tinggi dikirim sebagai variabel CSS dan diagram.css
// memilih salah satunya dari lebar container dengan ambang yang sama dengan komponen (lebarMendatar).
export function varPesan(a: Arsitektur): Record<`--${string}`, string> {
  const tegak = tata(a, "tegak").tinggi + UKURAN.bantalan;
  const mendatar = tata(a, "mendatar").tinggi + UKURAN.bantalan;
  return { "--diagram-mendatar": `${mendatar}px`, "--diagram-selisih": String(tegak - mendatar), "--diagram-ambang": `${lebarMendatar(a)}px` };
}

// Teks alternatif untuk versi statis (role="img"): urutan per baris, panah sebagai "ke", status dan zona disebut.
export function deskripsi(a: Arsitektur, judul: string): string {
  const zonaLabel = new Map((a.zona ?? []).map((z) => [z.id, z.label]));
  const baris = a.baris.map((b) =>
    b
      .map((k, i) => {
        const s = statusKotak(k);
        const tambahan = [s === "lama" ? "" : s, k.zona ? `di ${zonaLabel.get(k.zona)}` : ""].filter(Boolean).join(", ");
        const nama = tambahan ? `${k.label} (${tambahan})` : k.label;
        return i < b.length - 1 ? nama + (k.lepas ? ";" : " ke") : nama;
      })
      .join(" "),
  );
  return `${judul}. ${baris.join(". ")}.`;
}
