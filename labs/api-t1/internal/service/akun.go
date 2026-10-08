package service

import (
	"context"
	"errors"

	"lab/apit1/internal/repo"
)

// LihatAkun: hanya pemiliknya. Akun orang lain dijawab "tidak ditemukan", bukan "dilarang",
// supaya penanya tidak tahu akun itu ada.
func (s Service) LihatAkun(ctx context.Context, peminta, id int64) (repo.Akun, error) {
	if peminta != id {
		return repo.Akun{}, ErrTidakDitemukan
	}
	a, err := s.repo.Akun(ctx, id)
	if errors.Is(err, repo.ErrTidakAda) {
		return repo.Akun{}, ErrTidakDitemukan
	}
	return a, err
}
