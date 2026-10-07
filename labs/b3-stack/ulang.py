"""Ulang skenario tarik B3.2 sepuluh kali per stack: tepat satu penarikan harus sukses setiap run.

Memakai fungsi rekam.py (reset skema, jalankan stack, validasi hasil). Keluaran: output/ulang-10.txt
Jalankan: make ulang   (butuh: make -C ../b3-race up)
"""
import collections
import rekam

STACK = ("go", "node", "laravel", "django")
N = 10


def main():
    baris = [f"# Skenario tarik (Rp70.000 dan Rp50.000 bersamaan, saldo Rp100.000), {N} run per stack",
             "# Setiap run: skema dibuat ulang, lalu hasil divalidasi (tepat satu sukses, saldo akhir Rp30.000 atau Rp50.000)."]
    for stack in STACK:
        menang = collections.Counter()
        for _ in range(N):
            rekam.reset()
            _, stdout, _ = rekam.run(stack, "tarik")
            salah = rekam.periksa(stack, "tarik", stdout)
            if salah:
                raise SystemExit(f"GAGAL {stack}: {salah}\n{stdout}")
            sukses = [l.split(":")[0].replace("tarik ", "") for l in stdout.splitlines() if l.endswith(": sukses")]
            menang[sukses[0]] += 1
        rinci = ", ".join(f"{jumlah} menang {menang[jumlah]}×" for jumlah in ("70000", "50000"))
        baris.append(f"{stack:8} {N}/{N} run tepat satu sukses · {rinci}")
        print(baris[-1])
    (rekam.OUT / "ulang-10.txt").write_text("\n".join(baris) + "\n")


if __name__ == "__main__":
    main()
