// Lab F2 · contoh handler transfer seperti yang sering dihasilkan AI. ILUSTRASI: sengaja berisi masalah.
// Tidak dijalankan sebagai server; hanya diperiksa go vet dan gosec.
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

var db *sql.DB

type Transfer struct {
	Dari   string  `json:"dari"`
	Ke     string  `json:"ke"`
	Jumlah float64 `json:"jumlah"`
}

// --8<-- [start:handler]
func transferHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("transfer dari token %s", r.Header.Get("Authorization"))
	var t Transfer
	json.NewDecoder(r.Body).Decode(&t)

	tx, _ := db.Begin()
	var saldo float64
	tx.QueryRow("SELECT saldo FROM akun WHERE id = '" + t.Dari + "'").Scan(&saldo)
	if saldo < t.Jumlah {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]string{"error": "saldo kurang"})
		return
	}
	tx.Exec(fmt.Sprintf("UPDATE akun SET saldo = %f WHERE id = '%s'", saldo-t.Jumlah, t.Dari))
	tx.Exec("UPDATE akun SET saldo = saldo + $1 WHERE id = $2", t.Jumlah, t.Ke)
	http.Post("https://notifikasi.example/kirim", "application/json", nil)
	tx.Commit()
	json.NewEncoder(w).Encode(map[string]any{"ok": true})
}

// --8<-- [end:handler]

func main() {
	http.HandleFunc("/transfer", transferHandler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
