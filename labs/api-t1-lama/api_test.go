package main

// Integration test: HTTP sungguhan (httptest) + PostgreSQL sungguhan. Dilewati tanpa DATABASE_URL.

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"
)

func siapkan(t *testing.T) (*httptest.Server, *sql.DB) {
	t.Helper()
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		t.Skip("DATABASE_URL kosong: integration test butuh PostgreSQL")
	}
	db, err := sql.Open("pgx", url)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`TRUNCATE transfer, akun`); err != nil {
		t.Fatal(err)
	}
	isiContoh(db)
	data := DataPG{db: db, naif: os.Getenv("DATA_NAIF") == "1"}
	s := Server{layanan: Layanan{data: data}, data: data, secret: []byte("rahasia-uji"), umurToken: time.Minute}
	return httptest.NewServer(rute(s)), db
}

// --8<-- [start:integrasi]
func TestTransferLewatHTTP(t *testing.T) {
	srv, db := siapkan(t)
	defer srv.Close()
	token := buatToken([]byte("rahasia-uji"), "budi", time.Minute, time.Now())

	req, _ := http.NewRequest("POST", srv.URL+"/transfers", strings.NewReader(`{"ke":"ani","jumlah":70000}`))
	req.Header.Set("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode != 201 || res.Header.Get("Location") == "" {
		t.Fatalf("ingin 201 + Location, dapat %d", res.StatusCode)
	}
	var budi, ani int64
	db.QueryRow(`SELECT saldo FROM akun WHERE id = 'budi'`).Scan(&budi)
	db.QueryRow(`SELECT saldo FROM akun WHERE id = 'ani'`).Scan(&ani)
	if budi != 30000 || ani != 320000 {
		t.Fatalf("saldo budi=%d ani=%d, ingin 30000 dan 320000", budi, ani)
	}
}

// --8<-- [end:integrasi]

func TestTanpaTokenDitolak(t *testing.T) {
	srv, _ := siapkan(t)
	defer srv.Close()
	res, _ := http.Post(srv.URL+"/transfers", "application/json", strings.NewReader(`{"ke":"ani","jumlah":1}`))
	var p Problem
	json.NewDecoder(res.Body).Decode(&p)
	if res.StatusCode != 401 || p.Type != "/problems/belum-login" {
		t.Fatalf("ingin 401 belum-login, dapat %d %s", res.StatusCode, p.Type)
	}
}

// --8<-- [start:race]
// Regression test Tahap 2: dua penarikan dari saldo yang sama, dikirim bersamaan.
func TestDuaTransferBersamaan(t *testing.T) {
	srv, db := siapkan(t)
	defer srv.Close()
	token := buatToken([]byte("rahasia-uji"), "budi", time.Minute, time.Now())
	kirim := func(jumlah string) int {
		req, _ := http.NewRequest("POST", srv.URL+"/transfers", strings.NewReader(`{"ke":"ani","jumlah":`+jumlah+`}`))
		req.Header.Set("Authorization", "Bearer "+token)
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Error(err)
			return 0
		}
		return res.StatusCode
	}
	var wg sync.WaitGroup
	status := make([]int, 2)
	for i, j := range []string{"70000", "50000"} {
		wg.Add(1)
		go func() { defer wg.Done(); status[i] = kirim(j) }()
	}
	wg.Wait()
	var budi, ani int64
	db.QueryRow(`SELECT saldo FROM akun WHERE id = 'budi'`).Scan(&budi)
	db.QueryRow(`SELECT saldo FROM akun WHERE id = 'ani'`).Scan(&ani)
	t.Logf("status %v, saldo budi=%d ani=%d", status, budi, ani)
	if budi+ani != 350000 {
		t.Fatalf("total saldo %d, harus tetap 350000: ada uang yang tercipta atau hilang", budi+ani)
	}
}

// --8<-- [end:race]
