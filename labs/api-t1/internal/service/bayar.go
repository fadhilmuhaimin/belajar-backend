package service

import (
	"context"
	"errors"

	"lab/apit1/internal/repo"
)

var ErrSaldoKurang = errors.New("saldo tidak cukup")

// ErrValidasi: satu field input tidak memenuhi aturan Rekeningo.
type ErrValidasi struct{ Field, Pesan string }

func (e ErrValidasi) Error() string { return e.Field + ": " + e.Pesan }

// MaksBayar adalah batas fiktif satu pembayaran: empat kali tunjangan harian.
const MaksBayar = 200_000

// --8<-- [start:bayar]
// Bayar memindahkan uang dari karyawan ke warung. Di v1 hanya ke warung; transfer antar karyawan menunggu PRD v2.
func (s Service) Bayar(ctx context.Context, peminta, ke, jumlah int64) (id, saldo int64, err error) {
	if jumlah <= 0 || jumlah > MaksBayar {
		return 0, 0, ErrValidasi{"jumlah", "harus lebih dari 0 dan paling banyak 200000"}
	}
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
	// Baca lalu bandingkan: benar untuk satu request. Dua request bersamaan dibahas di Tahap 2.
	if pembayar.Saldo < jumlah {
		return 0, 0, ErrSaldoKurang
	}
	return s.repo.Pindahkan(ctx, peminta, ke, jumlah)
}

// --8<-- [end:bayar]
