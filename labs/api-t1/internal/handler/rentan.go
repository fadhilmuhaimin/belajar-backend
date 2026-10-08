package handler

import (
	"encoding/json"
	"net/http"
)

// Mode rentan untuk halaman masalah Tahap 1 (keputusan 148, 155). Hanya aktif dengan flag -rentan.

// --8<-- [start:m2]
// bayarM2 adalah handler bayar minggu 1, sebelum kontrak: field yang tidak dikirim dianggap 0,
// dan semua error baca body dijawab sama, tanpa nama field.
func (s Server) bayarM2(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Ke     int64 `json:"ke"`
		Jumlah int64 `json:"jumlah"`
	}
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		tulisProblem(w, Problem{Type: "/problems/json-rusak", Title: "Body bukan JSON yang valid", Status: 400})
		return
	}
	s.selesaikanBayar(w, r, in.Ke, in.Jumlah)
}

// --8<-- [end:m2]
