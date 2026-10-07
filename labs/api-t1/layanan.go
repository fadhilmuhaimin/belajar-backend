package main

// Lapisan logika bisnis: aturan Rekeningo. Tidak tahu HTTP, tidak menulis SQL.

import (
	"context"
	"errors"
	"fmt"
)

var (
	ErrSaldoKurang    = errors.New("saldo tidak cukup")
	ErrTidakDitemukan = errors.New("tidak ditemukan")
)

// ErrValidasi: input dipahami, tapi melanggar aturan. Dipetakan ke 422 oleh handler.
type ErrValidasi struct {
	Field string `json:"field"`
	Pesan string `json:"pesan"`
}

func (e ErrValidasi) Error() string { return e.Field + ": " + e.Pesan }

// Data yang dibutuhkan layanan. Interface kecil supaya bisa diganti data palsu di unit test.
type Data interface {
	Akun(ctx context.Context, id string) (Akun, string, error)
	Pindahkan(ctx context.Context, dari, ke string, jumlah int64) (id, saldo int64, err error)
}

type Layanan struct {
	data          Data
	tanpaValidasi bool // hanya untuk lab B6: meniru server yang percaya pada validasi di app
}

// --8<-- [start:aturan]
const BatasTransfer = 5_000_000 // aturan fiktif Rekeningo: maksimal Rp5.000.000 per transfer

func (l Layanan) Transfer(ctx context.Context, dari, ke string, jumlah int64) (id, saldo int64, err error) {
	if !l.tanpaValidasi {
		if jumlah <= 0 {
			return 0, 0, ErrValidasi{"jumlah", "harus lebih dari 0"}
		}
		if jumlah > BatasTransfer {
			return 0, 0, ErrValidasi{"jumlah", fmt.Sprintf("maksimal %d per transfer", BatasTransfer)}
		}
		if ke == dari {
			return 0, 0, ErrValidasi{"ke", "tidak boleh ke akun sendiri"}
		}
	}
	if _, _, err := l.data.Akun(ctx, ke); errors.Is(err, errTidakAda) {
		return 0, 0, ErrValidasi{"ke", "penerima tidak ditemukan"}
	} else if err != nil {
		return 0, 0, err
	}
	return l.data.Pindahkan(ctx, dari, ke, jumlah)
}

// --8<-- [end:aturan]

// --8<-- [start:pemilik]
// Lihat akun: hanya pemiliknya. Akun orang lain dijawab "tidak ditemukan", bukan "dilarang",
// supaya penanya tidak tahu akun itu ada.
func (l Layanan) LihatAkun(ctx context.Context, peminta, id string, tanpaCekPemilik bool) (Akun, error) {
	if !tanpaCekPemilik && peminta != id {
		return Akun{}, ErrTidakDitemukan
	}
	a, _, err := l.data.Akun(ctx, id)
	if errors.Is(err, errTidakAda) {
		return Akun{}, ErrTidakDitemukan
	}
	return a, err
}

// --8<-- [end:pemilik]
