// Chip label kejujuran di pojok widget. Gaya dari tema.css (.bb-chip), warna lewat token.
import { type Sumber, keteranganSumber, labelSumber } from "./sumber";

export default function ChipSumber({ sumber }: { sumber: Sumber }) {
  const kelas = "bb-chip bb-sumber" + (sumber.jenis === "rekaman" ? " is-system" : "");
  return (
    <span className={kelas} title={keteranganSumber(sumber)}>
      {labelSumber(sumber)}
    </span>
  );
}
