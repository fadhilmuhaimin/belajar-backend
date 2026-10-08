package main

// Unit test: aturan bisnis tanpa HTTP dan tanpa database. Data diganti data palsu di memori.

import (
	"context"
	"errors"
	"testing"
)

type dataPalsu struct{ saldo map[string]int64 }

func (d dataPalsu) Akun(_ context.Context, id string) (Akun, string, error) {
	s, ok := d.saldo[id]
	if !ok {
		return Akun{}, "", errTidakAda
	}
	return Akun{ID: id, Saldo: s}, "", nil
}

func (d dataPalsu) Pindahkan(_ context.Context, dari, ke string, j int64) (int64, int64, error) {
	if d.saldo[dari] < j {
		return 0, 0, ErrSaldoKurang
	}
	d.saldo[dari] -= j
	d.saldo[ke] += j
	return 1, d.saldo[dari], nil
}

// --8<-- [start:unit]
func TestTransferMenolakInputSalah(t *testing.T) {
	l := Layanan{data: dataPalsu{map[string]int64{"budi": 100000, "ani": 0}}}
	kasus := []struct {
		nama   string
		ke     string
		jumlah int64
		field  string
	}{
		{"jumlah negatif", "ani", -70000, "jumlah"},
		{"jumlah nol", "ani", 0, "jumlah"},
		{"melebihi batas", "ani", 5_000_001, "jumlah"},
		{"ke diri sendiri", "budi", 10000, "ke"},
		{"penerima tidak ada", "cici", 10000, "ke"},
	}
	for _, k := range kasus {
		t.Run(k.nama, func(t *testing.T) {
			_, _, err := l.Transfer(context.Background(), "budi", k.ke, k.jumlah)
			var v ErrValidasi
			if !errors.As(err, &v) || v.Field != k.field {
				t.Fatalf("ingin ErrValidasi di field %q, dapat %v", k.field, err)
			}
		})
	}
}

// --8<-- [end:unit]

func TestTransferSaldoKurang(t *testing.T) {
	l := Layanan{data: dataPalsu{map[string]int64{"budi": 100000, "ani": 0}}}
	if _, _, err := l.Transfer(context.Background(), "budi", "ani", 120000); !errors.Is(err, ErrSaldoKurang) {
		t.Fatalf("ingin ErrSaldoKurang, dapat %v", err)
	}
}
