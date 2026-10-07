// Lab API Tahap 1 · Rekeningo (fiktif). Satu monolith, tiga lapisan, satu PostgreSQL.
// Flag lab: -tanpa-validasi (B6), -tanpa-cek-pemilik (B5.3), -umur-token (B5.1).
package main

import (
	"database/sql"
	"flag"
	"log"
	"net/http"
	"os"

	"golang.org/x/crypto/bcrypt"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// --8<-- [start:rute]
func rute(s Server) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /login", s.login)
	mux.HandleFunc("GET /akun/{id}", s.wajibLogin(s.lihatAkun))
	mux.HandleFunc("POST /transfers", s.wajibLogin(s.transfer))
	mux.HandleFunc("GET /sehat", s.sehat)
	mux.HandleFunc("GET /config", config)
	return mux
}

// --8<-- [end:rute]

// Diisi saat build: go build -ldflags "-X main.versi=v1"
var versi = "dev"

// --8<-- [start:sehat]
// Health check: dipakai deploy untuk memutuskan versi baru siap menerima request.
func (s Server) sehat(w http.ResponseWriter, r *http.Request) {
	if err := s.db.PingContext(r.Context()); err != nil {
		tulisJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "database tidak terjangkau", "versi": versi})
		return
	}
	tulisJSON(w, 200, map[string]string{"status": "ok", "versi": versi})
}

// --8<-- [end:sehat]

func main() {
	tanpaValidasi := flag.Bool("tanpa-validasi", false, "lewati validasi di logika bisnis (lab B6)")
	tanpaCek := flag.Bool("tanpa-cek-pemilik", false, "lewati cek pemilik akun (lab B5.3)")
	umur := flag.Duration("umur-token", 15*60e9, "umur token")
	seed := flag.Bool("seed", false, "isi akun contoh (PIN di-hash bcrypt), lalu keluar")
	flag.Parse()
	db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	if *seed {
		isiContoh(db)
		return
	}
	// --8<-- [start:failfast]
	// Fail-fast: konfigurasi wajib yang hilang menghentikan proses saat start, bukan saat request pertama.
	if len(os.Getenv("TOKEN_SECRET")) < 16 {
		log.Fatal("konfigurasi salah: TOKEN_SECRET kosong atau kurang dari 16 karakter")
	}
	// --8<-- [end:failfast]
	data := DataPG{db: db}
	s := Server{layanan: Layanan{data: data, tanpaValidasi: *tanpaValidasi}, data: data,
		secret: []byte(os.Getenv("TOKEN_SECRET")), umurToken: *umur, tanpaCekPemilik: *tanpaCek, db: db}
	alamat := os.Getenv("ALAMAT")
	if alamat == "" {
		alamat = "127.0.0.1:18081"
	}
	log.Printf("api-t1 %s mendengarkan di %s", versi, alamat)
	pencatat := &PencatatVersi{jumlah: map[string]int{}}
	mux := rute(s)
	mux.HandleFunc("GET /metrics/versi-app", pencatat.laporan)
	log.Fatal(http.ListenAndServe(alamat, pencatat.catat(mux)))
}

// Akun contoh lab. PIN di sini adalah nilai uji lab lokal, bukan credential sungguhan.
func isiContoh(db *sql.DB) {
	for _, a := range []struct {
		id, nama, pin string
		saldo         int64
	}{{"budi", "Budi", "123456", 100000}, {"ani", "Warung Ani", "654321", 250000}} {
		h, _ := bcrypt.GenerateFromPassword([]byte(a.pin), bcrypt.DefaultCost)
		if _, err := db.Exec(`INSERT INTO akun (id, nama, pin_hash, saldo) VALUES ($1, $2, $3, $4)`,
			a.id, a.nama, string(h), a.saldo); err != nil {
			log.Fatal(err)
		}
	}
}
