// Diagram di peta tahap beranda (I5b, keputusan 248). Satu DiagramArsitektur untuk semua tahap:
// tab di Beranda.astro (skrip tanpa React) mengirim event "rtj:peta-tahap" berisi nomor tahap, dan diagram berganti
// ke data tahap itu dengan gerak masuk singkat (gerak/muncul.ts). Tanpa gerak saat dimuat; reduced motion tanpa gerak.
// Tahap tanpa data `arsitektur` di registry (proyeksi) tidak digambar: bentuknya belum ada di naskah.
// Tab yang dipilih sebelum island di-hydrate dibaca dari data-tahap di .peta__tab.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DiagramArsitektur from "./DiagramArsitektur";
import type { Arsitektur } from "./skema";
import { muncul } from "../gerak/muncul";

export type DiagramTahap = { no: number; data: Arsitektur | null; lama: boolean };

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
      {t.data ? (
        <>
          <DiagramArsitektur id="diagram-peta" kunci={String(t.no)} judul={`Arsitektur Tahap ${t.no}`} data={t.data} />
          {t.lama && <p className="peta__catatan">Diagram dari versi lama.</p>}
        </>
      ) : (
        <p className="peta__catatan">Tahap {t.no} masih proyeksi: bentuk sistemnya belum digambar.</p>
      )}
    </div>
  );
}
