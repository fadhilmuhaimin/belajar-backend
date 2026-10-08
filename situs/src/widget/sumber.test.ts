import { describe, expect, it } from "vitest";
import { Sumber, keteranganSumber, labelSumber } from "./sumber";

describe("Sumber", () => {
  it("menerima rekaman dengan file lab", () => {
    const s = Sumber.parse({ jenis: "rekaman", file: "labs/b3-stack/output/go-transfer.txt" });
    expect(labelSumber(s)).toBe("Rekaman lab");
    expect(keteranganSumber(s)).toBe("labs/b3-stack/output/go-transfer.txt");
  });

  it("menolak rekaman tanpa file", () => {
    const r = Sumber.safeParse({ jenis: "rekaman" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["file"]);
  });

  it("menolak file di luar labs/", () => {
    expect(Sumber.safeParse({ jenis: "rekaman", file: "/etc/passwd" }).success).toBe(false);
  });

  it("menolak jenis yang tidak dikenal dan field tambahan", () => {
    expect(Sumber.safeParse({ jenis: "dugaan" }).success).toBe(false);
    expect(Sumber.safeParse({ jenis: "asumsi", angka: 1 }).success).toBe(false);
  });

  it("ilustrasi dan asumsi tidak wajib menyebut file", () => {
    expect(labelSumber(Sumber.parse({ jenis: "ilustrasi" }))).toBe("Ilustrasi");
    const a = Sumber.parse({ jenis: "asumsi", catatan: "100 user, 3 transaksi per hari" });
    expect(labelSumber(a)).toBe("Asumsi");
    expect(keteranganSumber(a)).toBe("100 user, 3 transaksi per hari");
  });
});
