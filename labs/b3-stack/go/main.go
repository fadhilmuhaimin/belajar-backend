// Lab B3 · Go 1.27 + database/sql + pgx. Jalankan: make go
package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"sync"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var ErrSaldoKurang = errors.New("saldo tidak cukup")

// --8<-- [start:transfer]
// Transaction: dua UPDATE dalam satu transaction.
func transfer(ctx context.Context, db *sql.DB, dari, ke string, jumlah int) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() // tidak berbuat apa-apa kalau Commit sudah jalan
	if _, err := tx.ExecContext(ctx, `UPDATE akun SET saldo = saldo - $1 WHERE nama = $2`, jumlah, dari); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE akun SET saldo = saldo + $1 WHERE nama = $2`, jumlah, ke); err != nil {
		return err
	}
	return tx.Commit()
}

// --8<-- [end:transfer]

// --8<-- [start:tarik]
// Race condition: lock baris dulu, baru cek dan ubah.
func tarik(ctx context.Context, db *sql.DB, nama string, jumlah int) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var saldo int
	err = tx.QueryRowContext(ctx, `SELECT saldo FROM akun WHERE nama = $1 FOR UPDATE`, nama).Scan(&saldo)
	if err != nil {
		return err
	}
	if saldo < jumlah {
		return ErrSaldoKurang
	}
	if _, err := tx.ExecContext(ctx, `UPDATE akun SET saldo = $1 WHERE nama = $2`, saldo-jumlah, nama); err != nil {
		return err
	}
	return tx.Commit()
}

// --8<-- [end:tarik]

func main() {
	ctx := context.Background()
	db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
	must(err)
	schema, err := os.ReadFile("../schema.sql")
	must(err)
	_, err = db.ExecContext(ctx, string(schema))
	must(err)

	mode := "semua"
	if len(os.Args) > 1 {
		mode = os.Args[1]
	}
	if mode == "transfer" || mode == "semua" {
		fmt.Println("transfer budi -> ani 70000:", transfer(ctx, db, "budi", "ani", 70000))
		cetak(ctx, db)
	}
	if mode == "tarik" || mode == "semua" {
		var wg sync.WaitGroup
		for _, jumlah := range []int{70000, 50000} {
			wg.Add(1)
			go func() {
				defer wg.Done()
				err := tarik(ctx, db, "budi", jumlah)
				fmt.Printf("tarik %d: %v\n", jumlah, hasil(err))
			}()
		}
		wg.Wait()
		cetak(ctx, db)
	}
}

func hasil(err error) string {
	if err == nil {
		return "sukses"
	}
	return err.Error()
}

func cetak(ctx context.Context, db *sql.DB) {
	var budi, ani int
	must(db.QueryRowContext(ctx, `SELECT
		(SELECT saldo FROM akun WHERE nama = 'budi'),
		(SELECT saldo FROM akun WHERE nama = 'ani')`).Scan(&budi, &ani))
	fmt.Printf("saldo budi=%d ani=%d total=%d\n", budi, ani, budi+ani)
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}
