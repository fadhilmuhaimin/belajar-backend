// Diagram di peta tahap beranda (I5b, keputusan 248). Satu DiagramArsitektur untuk semua tahap:
// tab di Beranda.astro (skrip tanpa React) mengirim event "rtj:peta-tahap" berisi nomor tahap, dan diagram berganti
// ke data tahap itu dengan gerak masuk singkat (gerak/muncul.ts). Tanpa gerak saat dimuat; reduced motion tanpa gerak.
// Tahap tanpa data `arsitektur` di registry (proyeksi) tidak digambar: bentuknya belum ada di naskah.
// Tab yang dipilih sebelum island di-hydrate dibaca dari data-tahap di .peta__tab; sampai data-peta-diagram sama
// dengan data-tahap, CSS di Beranda.astro menyembunyikan diagram (tanpa frame berisi Tahap 1 dari SSR).
// Kaki diagram (caption dan catatan "Diagram dari versi lama.") berbeda tinggi antartahap; di 375 px caption Tahap 2
// dan 3 dua baris. Supaya hydrate sesudah tab dipilih tidak menggeser isi di bawahnya (K1xa), kaki setiap tahap ikut
// dirender di .peta__pesan dengan markup yang sama dengan kaki aslinya (figure.diagram > figcaption, supaya aturan CSS
// yang sama berlaku; alat ukur mengecualikan .peta__pesan saat mencari diagram). Biasanya display: none; selama
// diagram belum mengikuti tab, CSS di Beranda.astro menyembunyikan kaki asli Tahap 1 dan menampilkan kaki tahap
// terpilih di sini, di dalam diagram yang masih tersembunyi. Sesudah hydrate kaki asli menggantikannya dengan teks,
// lebar, dan margin yang sama, jadi tingginya tetap.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DiagramArsitektur from "./DiagramArsitektur";
import type { Arsitektur } from "./skema";
import { muncul } from "../gerak/muncul";

export type DiagramTahap = { no: number; data: Arsitektur | null; lama: boolean };

function Kaki({ t }: { t: DiagramTahap }) {
  if (!t.data) return <p className="peta__catatan">Tahap {t.no} masih proyeksi: bentuk sistemnya belum digambar.</p>;
  return t.lama ? <p className="peta__catatan">Diagram dari versi lama.</p> : null;
}

export default function PetaDiagram({ tahap }: { tahap: DiagramTahap[] }) {
  const [no, setNo] = useState(tahap[0]!.no);
  const isi = useRef<HTMLDivElement>(null);
  const dipilih = useRef(false);

  useEffect(() => {
    const awal = Number(document.querySelector<HTMLElement>(".peta__tab")?.dataset.tahap);
    if (awal) setNo(awal);
    const dengar = (e: Event) => {
      dipilih.current = true;
      setNo((e as CustomEvent<number>).detail);
    };
    document.addEventListener("rtj:peta-tahap", dengar);
    return () => document.removeEventListener("rtj:peta-tahap", dengar);
  }, []);

  // Sebelum browser menggambar: isi baru langsung mulai dari keadaan awal gerak, tanpa satu frame di posisi akhir.
  useLayoutEffect(() => {
    if (dipilih.current) muncul(isi.current);
  }, [no]);

  const t = tahap.find((x) => x.no === no) ?? tahap[0]!;
  return (
    <div ref={isi} className="peta__diagram" data-peta-diagram={t.no}>
      {t.data && <DiagramArsitektur id="diagram-peta" kunci={String(t.no)} judul={`Arsitektur Tahap ${t.no}`} data={t.data} />}
      <Kaki t={t} />
      <div className="peta__pesan" aria-hidden="true" data-pagefind-ignore="all">
        {tahap.map((x) => (
          <div key={x.no} data-pesan-kaki={x.no}>
            {x.data?.caption && (
              <figure className="diagram">
                <figcaption>{x.data.caption}</figcaption>
              </figure>
            )}
            <Kaki t={x} />
          </div>
        ))}
      </div>
    </div>
  );
}
