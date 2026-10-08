// Package handler adalah lapisan HTTP: parsing JSON, sesi, status code, format error. Tidak ada aturan uang di sini.
package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lab/apit1/internal/service"
)

type Server struct{ svc service.Service }

func Baru(svc service.Service) Server { return Server{svc: svc} }

// --8<-- [start:rute]
func (s Server) Rute() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /login", s.login)
	mux.HandleFunc("POST /logout", s.wajibLogin(s.logout))
	mux.HandleFunc("GET /akun/{id}", s.wajibLogin(s.lihatAkun))
	return mux
}

// --8<-- [end:rute]

// Problem adalah format error RFC 9457 (application/problem+json).
type Problem struct {
	Type   string `json:"type"`
	Title  string `json:"title"`
	Status int    `json:"status"`
	Detail string `json:"detail,omitempty"`
}

func tulisProblem(w http.ResponseWriter, p Problem) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(p.Status)
	json.NewEncoder(w).Encode(p)
}

func tulisJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func (s Server) errorInternal(w http.ResponseWriter, err error) {
	log.Printf("error internal: %v", err)
	tulisProblem(w, Problem{Type: "/problems/internal", Title: "Terjadi kesalahan di server", Status: 500})
}

// --8<-- [start:login]
func (s Server) login(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email, Password string }
	if json.NewDecoder(r.Body).Decode(&in) != nil || in.Email == "" || in.Password == "" {
		tulisProblem(w, Problem{Type: "/problems/json-rusak", Title: "Body harus JSON berisi email dan password", Status: 400})
		return
	}
	token, sampai, err := s.svc.Login(r.Context(), in.Email, in.Password)
	if errors.Is(err, service.ErrLoginGagal) {
		// Pesan sama untuk "email tidak terdaftar" dan "password salah": jangan bantu penebak.
		tulisProblem(w, Problem{Type: "/problems/login-gagal", Title: "Email atau password salah", Status: 401})
		return
	}
	if err != nil {
		s.errorInternal(w, err)
		return
	}
	tulisJSON(w, 200, map[string]any{"token": token, "kedaluwarsa_detik": int(time.Until(sampai).Round(time.Second).Seconds())})
}

// --8<-- [end:login]

type kunciPeminta struct{}

// --8<-- [start:wajib-login]
// wajibLogin: setiap endpoint di belakangnya butuh sesi yang masih aktif.
func (s Server) wajibLogin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, ada := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		akunID, err := s.svc.Periksa(r.Context(), token)
		if !ada || errors.Is(err, service.ErrSesiTidakSah) {
			w.Header().Set("WWW-Authenticate", `Bearer error="invalid_token"`)
			tulisProblem(w, Problem{Type: "/problems/belum-login", Title: "Belum login atau sesi sudah berakhir", Status: 401})
			return
		}
		if err != nil {
			s.errorInternal(w, err)
			return
		}
		next(w, r.WithContext(context.WithValue(r.Context(), kunciPeminta{}, akunID)))
	}
}

// --8<-- [end:wajib-login]

func peminta(r *http.Request) int64 { return r.Context().Value(kunciPeminta{}).(int64) }

func (s Server) logout(w http.ResponseWriter, r *http.Request) {
	token, _ := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
	if err := s.svc.Logout(r.Context(), token); err != nil {
		s.errorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s Server) lihatAkun(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Akun tidak ditemukan", Status: 404})
		return
	}
	a, err := s.svc.LihatAkun(r.Context(), peminta(r), id)
	if errors.Is(err, service.ErrTidakDitemukan) {
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Akun tidak ditemukan", Status: 404})
		return
	}
	if err != nil {
		s.errorInternal(w, err)
		return
	}
	tulisJSON(w, 200, a)
}
