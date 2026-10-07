// Package pembayaran: API publik modul pembayaran. Modul lain hanya boleh memanggil yang ada di sini.
package pembayaran

import "rekeningo/modul/pembayaran/internal/gateway"

// Bayar membayar pesanan dan mengembalikan id transaksi.
func Bayar(pesananID string, jumlah int64) (string, error) {
	return gateway.Tagih(pesananID, jumlah)
}
