// Widget tebak (keputusan 208): adegan + layar HP opsional, satu pertanyaan, pilihan dengan alasan.
// Semua teks dari data JSON; tautan lanjutan diberikan pemanggil (dari registry). Logika di logika.ts.
import { useState } from "react";
import { DataTebak } from "./skema";
import { nilai } from "./logika";

interface Tautan { label: string; href: string }

export default function Tebak({ data: mentah, tautan = [] }: { data: unknown; tautan?: Tautan[] }) {
  const data = DataTebak.parse(mentah);
  const L = data.label;
  const [dipilih, setDipilih] = useState<number | null>(null);
  const hasil = dipilih === null ? null : nilai(data, dipilih);

  return (
    <div className="bb-widget tb" role="group" aria-label={data.judul}>
      <div className="bb-widget__head">
        <p><strong>{data.judul}</strong></p>
        <span className="bb-chip is-warn">{L.sumber}</span>
      </div>

      <div className={"tb-adegan" + (data.layar ? " tb-adegan--hp" : "")}>
        {data.layar && (
          <div className="tb-hp" aria-label={`Layar HP: ${data.layar.status}`} role="img">
            <p className="tb-hp__judul">{data.layar.judul}</p>
            <p className="tb-hp__status">{data.layar.status}</p>
            <ul className="tb-hp__baris">
              {data.layar.baris.map((b, i) => (
                <li key={i}><span>{b.kiri}</span><span className={"tb-hp__nilai is-" + b.tanda}>{b.kanan}</span></li>
              ))}
            </ul>
          </div>
        )}
        <div className="tb-cerita">
          {data.adegan.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      <p className="tb-tanya"><strong>{L.tebakDulu}</strong> {data.pertanyaan}</p>
      <ol className="tb-pilihan">
        {data.pilihan.map((p, i) => {
          const kelas = hasil === null ? "" : i === hasil.jawaban ? " is-benar" : i === dipilih ? " is-salah" : " is-redup";
          return (
            <li key={i}>
              <button type="button" className={"tb-pilih" + kelas} aria-pressed={dipilih === i} disabled={hasil !== null} onClick={() => setDipilih(i)}>
                <span className="tb-huruf" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                <span>{p.teks}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div role="status" aria-live="polite">
        {hasil && (
          <div className={"tb-hasil " + (hasil.benar ? "is-benar" : "is-salah")}>
            <p className="tb-hasil__judul"><strong>{hasil.benar ? L.benar : L.belum}</strong></p>
            <p>{hasil.alasan[0]}</p>
            {!hasil.benar && <p><strong>{L.jawaban}: {String.fromCharCode(65 + hasil.jawaban)}.</strong> {hasil.alasan[1]}</p>}
            <p className="bb-muted">{data.penutup}</p>
            <p className="tb-tautan">
              {tautan.map((t) => <a key={t.href} href={t.href}>{t.label} →</a>)}
              {!hasil.benar && <button type="button" className="bb-btn bb-btn--quiet" onClick={() => setDipilih(null)}>{L.ulang}</button>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
