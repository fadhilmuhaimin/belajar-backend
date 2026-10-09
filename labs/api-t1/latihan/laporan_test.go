package latihan

import (
	"context"
	"database/sql"
	"os"
	"testing"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// Isi urut dari penyerang: subquery yang membagi dengan nol. Kalau PostgreSQL menjalankannya, urut masuk sebagai SQL.
const serangan = "(SELECT 1/0)"

func buka(t *testing.T) *sql.DB {
	db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
	if err != nil {
		t.Fatal(err)
	}
	return db
}

func TestDrafMenjalankanUrutSebagaiSQL(t *testing.T) {
	db := buka(t)
	_, err := LaporanDraf(context.Background(), db, 418, "", serangan, 20)
	t.Logf("draf, urut=%s: %v", serangan, err)
	if err == nil {
		t.Fatal("draf seharusnya menjalankan subquery dan gagal division by zero")
	}
}

func TestBenarMenolakUrutAsing(t *testing.T) {
	db := buka(t)
	_, err := LaporanBenar(context.Background(), db, 418, "", serangan, 20)
	t.Logf("benar, urut=%s: %v", serangan, err)
	if err == nil || err.Error() != `urut tidak dikenal: "(SELECT 1/0)"` {
		t.Fatal("versi benar harus menolak urut di luar allowlist")
	}
	rows, err := LaporanBenar(context.Background(), db, 418, "", "waktu", 20)
	if err != nil {
		t.Fatal(err)
	}
	rows.Close()
	t.Logf("benar, urut=waktu: tanpa error")
}
