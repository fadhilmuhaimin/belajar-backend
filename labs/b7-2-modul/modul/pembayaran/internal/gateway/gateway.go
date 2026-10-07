// Package gateway: detail milik modul pembayaran (credential, format payment gateway).
// Direktori internal/: hanya bisa diimpor dari dalam modul/pembayaran/.
package gateway

import "fmt"

func Tagih(pesananID string, jumlah int64) (string, error) {
	return fmt.Sprintf("trx-%s", pesananID), nil
}
