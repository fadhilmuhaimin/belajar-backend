package service

import (
	"context"
	"errors"

	"lab/apit1/internal/repo"
)

// Mode rentan untuk halaman masalah Tahap 1 (keputusan 148). Tidak pernah default:
// hanya dipakai server yang dijalankan dengan flag -rentan, dan hanya oleh lab.

// --8<-- [start:m1]
// BayarM1 adalah Bayar versi minggu 1: Raka belum memeriksa apakah jumlahnya masuk akal.
func (s Service) BayarM1(ctx context.Context, peminta, ke, jumlah int64) (id, saldo int64, err error) {
	penerima, err := s.repo.Akun(ctx, ke)
	if errors.Is(err, repo.ErrTidakAda) || (err == nil && penerima.Jenis != "warung") {
		return 0, 0, ErrValidasi{"ke", "harus akun warung"}
	}
	if err != nil {
		return 0, 0, err
	}
	pembayar, err := s.repo.Akun(ctx, peminta)
	if err != nil {
		return 0, 0, err
	}
	if pembayar.Saldo < jumlah { // -5000 lolos: 250000 tidak lebih kecil dari -5000
		return 0, 0, ErrSaldoKurang
	}
	return s.repo.Pindahkan(ctx, peminta, ke, jumlah)
}

// --8<-- [end:m1]

// CariWarungRentanM3 meneruskan ke repo rentan (string concat + semua field). Hanya mode -rentan m3.
func (s Service) CariWarungRentanM3(ctx context.Context, cari string) ([]repo.Akun, error) {
	return s.repo.CariWarungRentanM3(ctx, cari)
}
