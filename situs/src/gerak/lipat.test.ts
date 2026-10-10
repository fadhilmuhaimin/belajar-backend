import { describe, expect, it } from "vitest";
import { rentangTinggi } from "./lipat";

describe("rentang tinggi buka/tutup blok", () => {
  it("blok pendek dibuka dari 0 sampai tinggi penuhnya", () => {
    expect(rentangTinggi(true, 0, 400, 667, 120)).toEqual({ dari: 0, ke: 400 });
  });

  it("blok panjang hanya digerakkan setinggi layar; sisanya di bawah layar dilepas sesudahnya", () => {
    expect(rentangTinggi(true, 0, 2461, 667, 190)).toEqual({ dari: 0, ke: 667 });
  });

  it("menutup blok panjang mulai dari batas layar, bukan dari 2.461 px", () => {
    expect(rentangTinggi(false, 2461, 2461, 667, 190)).toEqual({ dari: 667, ke: 0 });
  });

  it("isi yang sudah di atas layar ikut dihitung supaya bagian yang terlihat tetap tertutup gerak", () => {
    expect(rentangTinggi(false, 2461, 2461, 667, -300)).toEqual({ dari: 967, ke: 0 });
  });

  it("gerak yang disela dilanjutkan dari tinggi tengahnya", () => {
    expect(rentangTinggi(true, 250, 2461, 667, 190)).toEqual({ dari: 250, ke: 667 });
    expect(rentangTinggi(false, 250, 2461, 667, 190)).toEqual({ dari: 250, ke: 0 });
  });

  it("tidak pernah negatif", () => {
    expect(rentangTinggi(true, -5, 0, 667, 0)).toEqual({ dari: 0, ke: 0 });
  });
});
