// Contoh pemakaian fondasi gerak, hanya di halaman uji /uji/gerak/ (keputusan 231).
// Pola yang ditiru komponen lain: bungkus dengan MotionProvider, pakai `m.*`, ambil transisi dari useGerak()
// dan `initial` dari useAwal().
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import MotionProvider, { useAwal, useGerak } from "./MotionProvider";

function Isi() {
  const [buka, setBuka] = useState(false);
  const masuk = useGerak("sedang", "masuk");
  const keluar = useGerak("cepat", "keluar");
  const awal = useAwal({ opacity: 0, y: -8 });
  return (
    <div className="bb-widget">
      <button type="button" className="bb-btn contoh-gerak__tombol" aria-expanded={buka} aria-controls="contoh-gerak-catatan" onClick={() => setBuka(!buka)}>
        {buka ? "Tutup catatan" : "Buka catatan"}
      </button>
      <AnimatePresence initial={false}>
        {buka && (
          <m.div
            key="catatan"
            id="contoh-gerak-catatan"
            data-gerak="catatan"
            initial={awal}
            animate={{ opacity: 1, y: 0, transition: masuk }}
            exit={{ opacity: 0, y: -8, transition: keluar }}
          >
            <p>Bayar Rp25.000 ke warung Ani: saldo Budi berkurang Rp25.000, saldo Ani bertambah Rp25.000.</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContohGerak() {
  return (
    <MotionProvider>
      <Isi />
    </MotionProvider>
  );
}
