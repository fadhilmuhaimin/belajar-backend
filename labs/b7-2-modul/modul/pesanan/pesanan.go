// Package pesanan memanggil modul pembayaran lewat API publiknya.
package pesanan

import "rekeningo/modul/pembayaran"

func Checkout(id string, total int64) (string, error) {
	return pembayaran.Bayar(id, total)
}
