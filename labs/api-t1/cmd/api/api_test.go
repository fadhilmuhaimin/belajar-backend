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

func kirim(t *testing.T, url, token, body string) *http.Response {
	t.Helper()
	req, _ := http.NewRequest("POST", url, strings.NewReader(body))
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

// --8<-- [start:http]
// Tes HTTP: router, handler, service, dan PostgreSQL dirakit seperti main, di port acak dari httptest.
// Yang diperiksa adalah yang dibaca app: status code, Content-Type, dan nama field di body error.
func TestBayarDitolakDenganNamaField(t *testing.T) {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		t.Skip("DATABASE_URL kosong: tes ini butuh PostgreSQL")
	}
	db, err := sql.Open("pgx", url)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	srv := httptest.NewServer(handler.Baru(service.Baru(repo.Baru(db), time.Hour)).Rute())
	defer srv.Close()

	var sesi struct{ Token string }
	res := kirim(t, srv.URL+"/login", "", `{"email": "budi@lestari.example", "password": "sementara-419"}`)
	json.NewDecoder(res.Body).Decode(&sesi)

	for _, c := range []struct {
		body   string
		status int
	}{
		{`{"ke": 418, "jumlah": -70000}`, 422}, // M1: aturan di service
		{`{"ke": 418, "amount": 70000}`, 400},  // M2: field wajib di handler
	} {
		res := kirim(t, srv.URL+"/transfers", sesi.Token, c.body)
		var p struct{ Errors []map[string]string }
		json.NewDecoder(res.Body).Decode(&p)
		jenis := res.Header.Get("Content-Type")
		if res.StatusCode != c.status || jenis != "application/problem+json" || len(p.Errors) != 1 || p.Errors[0]["field"] != "jumlah" {
			t.Errorf("%s: %d %s %v, ingin %d problem+json field jumlah", c.body, res.StatusCode, jenis, p.Errors, c.status)
		}
	}
}

// --8<-- [end:http]
