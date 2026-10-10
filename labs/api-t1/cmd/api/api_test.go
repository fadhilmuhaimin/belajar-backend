package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"lab/apit1/internal/handler"
	"lab/apit1/internal/repo"
	"lab/apit1/internal/service"
)

// server merakit router, handler, service, dan PostgreSQL seperti main, di port acak dari httptest.
func server(t *testing.T) *httptest.Server {
	t.Helper()
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		t.Skip("DATABASE_URL kosong: tes ini butuh PostgreSQL")
	}
	db, err := sql.Open("pgx", url)
	if err != nil {
		t.Fatal(err)
	}
	srv := httptest.NewServer(handler.Baru(service.Baru(repo.Baru(db), time.Hour)).Rute())
	t.Cleanup(func() { srv.Close(); db.Close() })
	return srv
}

func minta(t *testing.T, method, url, token, body string) *http.Response {
	t.Helper()
	req, _ := http.NewRequest(method, url, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { res.Body.Close() })
	return res
}

func loginBudi(t *testing.T, srv *httptest.Server) string {
	t.Helper()
	var sesi struct{ Token string }
	res := minta(t, "POST", srv.URL+"/login", "", `{"email": "budi@lestari.example", "password": "sementara-419"}`)
	json.NewDecoder(res.Body).Decode(&sesi)
	return sesi.Token
}

// --8<-- [start:http]
// Tes HTTP: yang diperiksa adalah yang dibaca app, yaitu status code, Content-Type, dan nama field.
func TestBayarDitolakDenganNamaField(t *testing.T) {
	srv := server(t)
	token := loginBudi(t, srv)
	for _, c := range []struct {
		body   string
		status int
	}{
		{`{"ke": 418, "jumlah": -70000}`, 422}, // M1: aturan di service
		{`{"ke": 418, "amount": 70000}`, 400},  // M2: field wajib di handler
	} {
		res := minta(t, "POST", srv.URL+"/transfers", token, c.body)
		var p struct{ Errors []map[string]string }
		json.NewDecoder(res.Body).Decode(&p)
		jenis := res.Header.Get("Content-Type")
		if res.StatusCode != c.status || jenis != "application/problem+json" || len(p.Errors) != 1 || p.Errors[0]["field"] != "jumlah" {
			t.Errorf("%s: %d %s %v, ingin %d problem+json field jumlah", c.body, res.StatusCode, jenis, p.Errors, c.status)
		}
	}
}

// --8<-- [end:http]

// --8<-- [start:pemilik]
// Tes "token A meminta data B" (1.28): akun orang lain dijawab sama dengan akun yang tidak ada.
func TestAkunOrangLainDijawab404(t *testing.T) {
	srv := server(t)
	token := loginBudi(t, srv)
	for path, status := range map[string]int{"/akun/419": 200, "/akun/417": 404, "/akun/9999": 404} {
		if res := minta(t, "GET", srv.URL+path, token, ""); res.StatusCode != status {
			t.Errorf("Budi GET %s: %d, ingin %d", path, res.StatusCode, status)
		}
	}
}

// --8<-- [end:pemilik]
