package main

// Lapisan handler: urusan HTTP saja. Parsing JSON, token, status code, format error.

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Server struct {
	layanan         Layanan
	data            Data
	secret          []byte
	umurToken       time.Duration
	tanpaCekPemilik bool
	db              *sql.DB
}

type kunciPeminta struct{}

// --8<-- [start:problem]
// Error dalam format RFC 9457 (application/problem+json).
type Problem struct {
	Type   string        `json:"type"`
	Title  string        `json:"title"`
	Status int           `json:"status"`
	Detail string        `json:"detail,omitempty"`
	Errors []ErrValidasi `json:"errors,omitempty"` // extension member: daftar field yang salah
	Saldo  *int64        `json:"saldo,omitempty"`  // extension member: untuk saldo-kurang
}

func tulisProblem(w http.ResponseWriter, p Problem) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(p.Status)
	json.NewEncoder(w).Encode(p)
}

// --8<-- [end:problem]

func tulisJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// --8<-- [start:auth]
// Middleware: setiap endpoint di belakangnya butuh token yang valid.
func (s Server) wajibLogin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		klaim, err := periksaToken(s.secret, token, time.Now())
		if !ok || err != nil {
			w.Header().Set("WWW-Authenticate", `Bearer error="invalid_token"`)
			tulisProblem(w, Problem{Type: "/problems/belum-login", Title: "Belum login", Status: 401,
				Detail: alasan(ok, err)})
			return
		}
		next(w, r.WithContext(context.WithValue(r.Context(), kunciPeminta{}, klaim.Sub)))
	}
}

// --8<-- [end:auth]

func alasan(ok bool, err error) string {
	if !ok {
		return "header Authorization: Bearer <token> tidak ada"
	}
	return err.Error()
}

func peminta(r *http.Request) string { return r.Context().Value(kunciPeminta{}).(string) }

func (s Server) login(w http.ResponseWriter, r *http.Request) {
	var in struct{ ID, PIN string }
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		tulisProblem(w, Problem{Type: "/problems/json-rusak", Title: "Body bukan JSON yang valid", Status: 400})
		return
	}
	_, hash, err := s.data.Akun(r.Context(), in.ID)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(in.PIN)) != nil {
		// Pesan sama untuk "akun tidak ada" dan "PIN salah": jangan bantu penebak.
		tulisProblem(w, Problem{Type: "/problems/login-gagal", Title: "ID atau PIN salah", Status: 401})
		return
	}
	tulisJSON(w, 200, map[string]any{"token": buatToken(s.secret, in.ID, s.umurToken, time.Now()),
		"kedaluwarsa_detik": int(s.umurToken.Seconds())})
}

func (s Server) lihatAkun(w http.ResponseWriter, r *http.Request) {
	a, err := s.layanan.LihatAkun(r.Context(), peminta(r), r.PathValue("id"), s.tanpaCekPemilik)
	if errors.Is(err, ErrTidakDitemukan) {
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Akun tidak ditemukan", Status: 404})
		return
	}
	if err != nil {
		s.errorInternal(w, err)
		return
	}
	tulisJSON(w, 200, a)
}

// --8<-- [start:transfer]
func (s Server) transfer(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Ke     string `json:"ke"`
		Jumlah int64  `json:"jumlah"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		tulisProblem(w, Problem{Type: "/problems/json-rusak", Title: "Body bukan JSON yang valid", Status: 400,
			Detail: err.Error()})
		return
	}
	id, saldo, err := s.layanan.Transfer(r.Context(), peminta(r), in.Ke, in.Jumlah)
	var v ErrValidasi
	switch {
	case errors.As(err, &v):
		tulisProblem(w, Problem{Type: "/problems/validasi", Title: "Input tidak valid", Status: 422,
			Errors: []ErrValidasi{v}})
	case errors.Is(err, ErrSaldoKurang):
		a, _, _ := s.data.Akun(r.Context(), peminta(r))
		tulisProblem(w, Problem{Type: "/problems/saldo-kurang", Title: "Saldo tidak cukup", Status: 422,
			Detail: "Saldo " + rupiah(a.Saldo) + ", transfer " + rupiah(in.Jumlah) + ".", Saldo: &a.Saldo})
	case err != nil:
		s.errorInternal(w, err)
	default:
		w.Header().Set("Location", fmt.Sprintf("/transfers/%d", id))
		tulisJSON(w, 201, map[string]int64{"id": id, "saldo": saldo})
	}
}

// --8<-- [end:transfer]

// Detail error asli hanya ke log server. Client hanya menerima pesan umum.
func (s Server) errorInternal(w http.ResponseWriter, err error) {
	log.Printf("error internal: %v", err)
	tulisProblem(w, Problem{Type: "/problems/internal", Title: "Terjadi kesalahan di server", Status: 500})
}

// 1080000 -> "Rp1.080.000"
func rupiah(n int64) string {
	s := fmt.Sprint(n)
	for i := len(s) - 3; i > 0; i -= 3 {
		s = s[:i] + "." + s[i:]
	}
	return "Rp" + s
}
