// Lab C4 · rate limit login dengan token bucket. Tanpa database: fokusnya pembatas, bukan login.
//
// BATAS=ip       satu bucket per IP: 5 percobaan, isi ulang 1 token per 12 detik (5 per menit)
// BATAS=akun+ip  satu bucket per akun (5, 1 per 12 detik) + satu bucket per IP yang longgar (60, 1 per detik)
//
// IP ditiru lewat header X-Lab-IP, hanya di lab. Di production IP diambil dari koneksi,
// atau dari header proxy yang tepercaya (lihat halaman).
package main

import (
	"encoding/json"
	"log"
	"math"
	"net"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

// --8<-- [start:bucket]
type bucket struct {
	token    float64
	terakhir time.Time
}

type pembatas struct {
	mu        sync.Mutex
	kapasitas float64 // token maksimum = burst
	perDetik  float64 // laju isi ulang
	bucket    map[string]*bucket
}

// izinkan mengambil satu token dari bucket milik key. Kalau kosong, kembalikan lama menunggu token berikutnya.
func (p *pembatas) izinkan(key string, now time.Time) (bool, time.Duration) {
	p.mu.Lock()
	defer p.mu.Unlock()
	e, ada := p.bucket[key]
	if !ada {
		e = &bucket{token: p.kapasitas, terakhir: now}
		p.bucket[key] = e
	}
	e.token = math.Min(p.kapasitas, e.token+now.Sub(e.terakhir).Seconds()*p.perDetik)
	e.terakhir = now
	if e.token >= 1 {
		e.token--
		return true, 0
	}
	return false, time.Duration((1 - e.token) / p.perDetik * float64(time.Second))
}

// --8<-- [end:bucket]

func baru(kapasitas, perDetik float64) *pembatas {
	return &pembatas{kapasitas: kapasitas, perDetik: perDetik, bucket: map[string]*bucket{}}
}

func tulis(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func main() {
	mode := os.Getenv("BATAS")
	perAkun := baru(5, 1.0/12)
	perIP := baru(5, 1.0/12)
	if mode == "akun+ip" {
		perIP = baru(60, 1)
	}

	// --8<-- [start:handler]
	http.HandleFunc("POST /login", func(w http.ResponseWriter, r *http.Request) {
		var in struct{ Telp, Pin string }
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			tulis(w, 400, map[string]string{"title": "Body tidak valid"})
			return
		}
		ip := r.Header.Get("X-Lab-IP") // lab saja; lihat komentar di atas
		if ip == "" {
			ip, _, _ = net.SplitHostPort(r.RemoteAddr)
		}
		now := time.Now()
		ok, tunggu := perIP.izinkan("ip:"+ip, now)
		if ok && mode == "akun+ip" {
			ok, tunggu = perAkun.izinkan("akun:"+in.Telp, now)
		}
		if !ok { // dicek sebelum PIN: percobaan yang ditolak tidak sempat menebak
			detik := int(math.Ceil(tunggu.Seconds()))
			w.Header().Set("Retry-After", strconv.Itoa(detik))
			tulis(w, 429, map[string]any{"title": "Terlalu banyak percobaan login", "status": 429, "retry_after": detik})
			return
		}
		if in.Pin != "246810" { // PIN lab, bukan rahasia
			tulis(w, 401, map[string]any{"title": "Nomor atau PIN salah", "status": 401})
			return
		}
		tulis(w, 200, map[string]string{"pesan": "login berhasil"})
	})
	// --8<-- [end:handler]

	port := os.Getenv("PORT")
	if port == "" {
		port = "18094"
	}
	log.Fatal(http.ListenAndServe("127.0.0.1:"+port, nil)) // port terpakai = gagal keras, bukan diam
}
