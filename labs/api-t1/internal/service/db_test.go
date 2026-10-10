package service

import (
	"context"
	"database/sql"
	"os"
	"testing"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"lab/apit1/internal/repo"
)

// --8<-- [start:siapkan]
// siapkan membuka PostgreSQL sungguhan dan menulis keadaan awal yang sama sebelum setiap tes.
// Tanpa DATABASE_URL tes dilewati (SKIP), jadi tidak pernah terhitung lolos tanpa database.
func siapkan(t *testing.T, perintah ...string) (Service, *sql.DB) {
	t.Helper()
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		t.Skip("DATABASE_URL kosong: tes ini butuh PostgreSQL")
	}
	db, err := sql.Open("pgx", url)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	awal := []string{
		"DELETE FROM koreksi",
		"DELETE FROM transaksi",
		"ALTER TABLE akun DROP CONSTRAINT IF EXISTS batas_saldo_warung",
		"UPDATE akun SET saldo = 0",
	}
	for _, q := range append(awal, perintah...) {
		if _, err := db.Exec(q); err != nil {
			t.Fatalf("%s: %v", q, err)
		}
	}
	return Baru(repo.Baru(db), time.Hour), db
}

// --8<-- [end:siapkan]

func angka(t *testing.T, db *sql.DB, q string) int64 {
	t.Helper()
	var n int64
	if err := db.QueryRow(q).Scan(&n); err != nil {
		t.Fatalf("%s: %v", q, err)
	}
	return n
}

// --8<-- [start:m4]
// Regression test M4 (1.22): pembayaran yang gagal di langkah kedua tidak mengubah saldo siapa pun.
func TestBayarGagalTidakMengubahSaldo(t *testing.T) {
	svc, db := siapkan(t,
		"UPDATE akun SET saldo = 250000 WHERE id = 419",
		"UPDATE akun SET saldo = 1450000 WHERE id = 418",
		"ALTER TABLE akun ADD CONSTRAINT batas_saldo_warung CHECK (jenis <> 'warung' OR saldo <= 1500000)")

	_, _, err := svc.Bayar(context.Background(), 419, 418, 70000)
	if err == nil {
		t.Fatal("Bayar 70000 ke warung yang hampir penuh: ingin error, dapat nil")
	}
	if s := angka(t, db, "SELECT saldo FROM akun WHERE id = 419"); s != 250000 {
		t.Errorf("saldo Budi %d, ingin 250000", s)
	}
	if n := angka(t, db, "SELECT sum(saldo) FROM akun"); n != 1700000 {
		t.Errorf("total saldo %d, ingin 1700000", n)
	}
}

// --8<-- [end:m4]

// --8<-- [start:riwayat]
// Regression test commit f5ea0b4 (1.31): riwayat menjawab tanpa error, tapi isinya kosong.
func TestRiwayatMemuatPembayaran(t *testing.T) {
	svc, _ := siapkan(t, "UPDATE akun SET saldo = 250000 WHERE id = 419")
	ctx := context.Background()
	if _, _, err := svc.Bayar(ctx, 419, 418, 25000); err != nil {
		t.Fatal(err)
	}
	for _, c := range []struct {
		akun        int64
		arah, lawan string
	}{{419, "keluar", "Warung Ani"}, {418, "masuk", "Budi"}} {
		r, err := svc.Riwayat(ctx, c.akun, c.akun)
		if err != nil {
			t.Fatal(err)
		}
		if len(r) != 1 || r[0].Arah != c.arah || r[0].Lawan != c.lawan || r[0].Jumlah != 25000 {
			t.Errorf("riwayat akun %d: %d transaksi, ingin 1 (%s, %s, 25000)", c.akun, len(r), c.arah, c.lawan)
		}
	}
}

// --8<-- [end:riwayat]
