package main

// Lab E1 · versi app: catat versi dari header X-App-Version, dan beri tahu versi minimum lewat /config.

import (
	"net/http"
	"os"
	"sort"
	"sync"
)

type PencatatVersi struct {
	mu     sync.Mutex
	jumlah map[string]int
}

// --8<-- [start:catat]
// Middleware: hitung request per versi app. Di production, ini jadi metric (C2), bukan map di memori.
func (p *PencatatVersi) catat(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		v := r.Header.Get("X-App-Version")
		if v == "" {
			v = "(tanpa header)"
		}
		p.mu.Lock()
		p.jumlah[v]++
		p.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}

// --8<-- [end:catat]

func (p *PencatatVersi) laporan(w http.ResponseWriter, r *http.Request) {
	p.mu.Lock()
	defer p.mu.Unlock()
	type baris struct {
		Versi   string `json:"versi"`
		Request int    `json:"request"`
	}
	out := []baris{}
	for v, n := range p.jumlah {
		out = append(out, baris{v, n})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Versi < out[j].Versi })
	tulisJSON(w, 200, out)
}

// --8<-- [start:config]
// Konfigurasi untuk app, dibaca saat app dibuka. Versi minimum diatur lewat environment, tanpa deploy kode.
func config(w http.ResponseWriter, r *http.Request) {
	tulisJSON(w, 200, map[string]string{
		"versi_minimum":    os.Getenv("VERSI_MINIMUM"),
		"versi_disarankan": os.Getenv("VERSI_DISARANKAN"),
	})
}

// --8<-- [end:config]
