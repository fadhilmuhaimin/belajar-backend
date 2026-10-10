// Fitur Motion yang dimuat lazy oleh LazyMotion (keputusan 231).
// domMax, bukan domAnimation: layout animation untuk island React (tidak ada di domAnimation). Blok lipat (I5a)
// tidak memakai ini: gerak tingginya lewat `animate` mini Motion tanpa React (lipat.ts, keputusan 238).
import { domMax } from "motion/react";

export default domMax;
