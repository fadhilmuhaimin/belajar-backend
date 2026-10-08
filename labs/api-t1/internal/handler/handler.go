// Package handler adalah lapisan HTTP: parsing JSON, sesi, status code, format error. Tidak ada aturan uang di sini.
package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lab/apit1/internal/service"
)

type Server struct {
	svc    service.Service
	rentan string // mode rentan lab (flag -rentan); kosong = versi benar
}

func Baru(svc service.Service) Server { return Server{svc: svc} }

// DenganRentan menyalakan satu mode rentan untuk rekaman halaman masalah (keputusan 148).
func (s Server) DenganRentan(mode string) Server { s.rentan = mode; return s }

// --8<-- [start:rute]
func (s Server) Rute() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /login", s.login)
	mux.HandleFunc("POST /logout", s.wajibLogin(s.logout))
	mux.HandleFunc("GET /akun/{id}", s.wajibLogin(s.lihatAkun))
	mux.HandleFunc("POST /topup", s.wajibLogin(s.topup))
	mux.HandleFunc("POST /transfers", s.wajibLogin(s.bayar))
	mux.HandleFunc("GET /transfers/{id}", s.wajibLogin(s.lihatTransaksi))
	mux.HandleFunc("GET /akun/{id}/riwayat", s.wajibLogin(s.riwayat))
	mux.HandleFunc("GET /warung/{id}/laporan", s.wajibLogin(s.laporan))
	return mux
}

// --8<-- [end:rute]

// Problem adalah format error RFC 9457 (application/problem+json).
// --8<-- [start:problem]
// Problem adalah format error RFC 9457 (application/problem+json), sama untuk semua endpoint.
type Problem struct {
	Type   string `json:"type"`
	Title  string `json:"title"`
	Status int    `json:"status"`
	Detail string `json:"detail,omitempty"`
	// Errors adalah extension member (RFC 9457 bagian 3.2): daftar baris atau field yang salah.
	Errors any `json:"errors,omitempty"`
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

// --8<-- [end:problem]

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

// GET /transfers/{id}: alamat yang dikirim di header Location setelah 201.
func (s Server) lihatTransaksi(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Transaksi tidak ditemukan", Status: 404})
		return
	}
	t, err := s.svc.LihatTransaksi(r.Context(), peminta(r), id)
	if errors.Is(err, service.ErrTidakDitemukan) {
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Transaksi tidak ditemukan", Status: 404})
		return
	}
	if err != nil {
		s.errorInternal(w, err)
		return
	}
	tulisJSON(w, 200, t)
}

// --8<-- [start:topup]
// POST /topup?keterangan=...  body text/csv: email,nominal
func (s Server) topup(w http.ResponseWriter, r *http.Request) {
	isi, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		tulisProblem(w, Problem{Type: "/problems/body-rusak", Title: "Body tidak terbaca", Status: 400})
		return
	}
	akun, total, err := s.svc.Topup(r.Context(), peminta(r), r.URL.Query().Get("keterangan"), string(isi))
	var errCSV service.ErrCSV
	switch {
	case errors.Is(err, service.ErrDilarang):
		tulisProblem(w, Problem{Type: "/problems/dilarang", Title: "Hanya admin tunjangan yang boleh top-up", Status: 403})
	case errors.As(err, &errCSV):
		tulisProblem(w, Problem{Type: "/problems/csv-ditolak", Title: "CSV ditolak; tidak ada saldo yang berubah",
			Status: 422, Errors: errCSV.Kesalahan})
	case err != nil:
		s.errorInternal(w, err)
	default:
		tulisJSON(w, 200, map[string]any{"akun": akun, "total": total})
	}
}

// --8<-- [end:topup]

// --8<-- [start:bayar]
func (s Server) bayar(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Ke     int64 `json:"ke"`
		Jumlah int64 `json:"jumlah"`
	}
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		tulisProblem(w, Problem{Type: "/problems/json-rusak", Title: "Body bukan JSON yang valid", Status: 400})
		return
	}
	bayar := s.svc.Bayar
	if s.rentan == "m1" {
		bayar = s.svc.BayarM1
	}
	id, saldo, err := bayar(r.Context(), peminta(r), in.Ke, in.Jumlah)
	var errV service.ErrValidasi
	switch {
	case errors.As(err, &errV):
		tulisProblem(w, Problem{Type: "/problems/validasi", Title: "Input tidak memenuhi aturan", Status: 422,
			Errors: []map[string]string{{"field": errV.Field, "pesan": errV.Pesan}}})
	case errors.Is(err, service.ErrSaldoKurang):
		tulisProblem(w, Problem{Type: "/problems/saldo-kurang", Title: "Saldo tidak cukup", Status: 422})
	case err != nil:
		s.errorInternal(w, err)
	default:
		w.Header().Set("Location", fmt.Sprintf("/transfers/%d", id))
		tulisJSON(w, 201, map[string]int64{"id": id, "saldo": saldo})
	}
}

// --8<-- [end:bayar]

func (s Server) riwayat(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	daftar, err := s.svc.Riwayat(r.Context(), peminta(r), id)
	if errors.Is(err, service.ErrTidakDitemukan) {
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Akun tidak ditemukan", Status: 404})
		return
	}
	if err != nil {
		s.errorInternal(w, err)
		return
	}
	tulisJSON(w, 200, map[string]any{"riwayat": daftar})
}

func (s Server) laporan(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	q := r.URL.Query()
	baris, err := s.svc.Laporan(r.Context(), peminta(r), id, q.Get("dari"), q.Get("sampai"))
	var errV service.ErrValidasi
	switch {
	case errors.Is(err, service.ErrTidakDitemukan):
		tulisProblem(w, Problem{Type: "/problems/tidak-ditemukan", Title: "Warung tidak ditemukan", Status: 404})
	case errors.As(err, &errV):
		tulisProblem(w, Problem{Type: "/problems/validasi", Title: "Input tidak memenuhi aturan", Status: 422,
			Errors: []map[string]string{{"field": errV.Field, "pesan": errV.Pesan}}})
	case err != nil:
		s.errorInternal(w, err)
	default:
		tulisJSON(w, 200, map[string]any{"warung": id, "per_hari": baris})
	}
}
