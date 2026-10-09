// Package latihan berisi draf kode buatan AI untuk latihan halaman 1.20. Tidak dipakai server api-t1.
package latihan

import (
	"context"
	"database/sql"
	"fmt"
)

// --8<-- [start:draf]
// LaporanDraf: draf AI untuk laporan warung yang bisa dicari nama pembayar dan diurutkan.
func LaporanDraf(ctx context.Context, db *sql.DB, warung int64, cari, urut string, batas int) (*sql.Rows, error) {
	q := "SELECT t.id, a.nama, t.jumlah FROM transaksi t JOIN akun a ON a.id = t.dari" +
		" WHERE t.ke = $1 AND a.nama ILIKE '%' || $2 || '%'" +
		" ORDER BY " + urut +
		fmt.Sprintf(" LIMIT %d", batas)
	return db.QueryContext(ctx, q, warung, cari)
}

// --8<-- [end:draf]

// --8<-- [start:benar]
// kolomUrut adalah allowlist: app mengirim kunci, server memilih potongan SQL-nya.
var kolomUrut = map[string]string{
	"waktu":  "t.dibuat DESC, t.id DESC",
	"jumlah": "t.jumlah DESC, t.id DESC",
}

func LaporanBenar(ctx context.Context, db *sql.DB, warung int64, cari, urut string, batas int) (*sql.Rows, error) {
	urutan, ok := kolomUrut[urut]
	if !ok {
		return nil, fmt.Errorf("urut tidak dikenal: %q", urut)
	}
	q := "SELECT t.id, a.nama, t.jumlah FROM transaksi t JOIN akun a ON a.id = t.dari" +
		" WHERE t.ke = $1 AND a.nama ILIKE '%' || $2 || '%'" +
		" ORDER BY " + urutan + " LIMIT $3"
	rows, err := db.QueryContext(ctx, q, warung, cari, batas)
	return rows, err
}

// --8<-- [end:benar]
