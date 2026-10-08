package main

// JWT HS256 minimal dengan pustaka standar, supaya isinya terlihat utuh di lab.
// Di production pakai library yang teruji (mis. golang-jwt), bukan kode buatan sendiri.

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var b64 = base64.RawURLEncoding

type Klaim struct {
	Sub string `json:"sub"`
	Iat int64  `json:"iat"`
	Exp int64  `json:"exp"`
}

// --8<-- [start:token]
func buatToken(secret []byte, sub string, umur time.Duration, now time.Time) string {
	head := b64.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	body, _ := json.Marshal(Klaim{Sub: sub, Iat: now.Unix(), Exp: now.Add(umur).Unix()})
	isi := head + "." + b64.EncodeToString(body)
	return isi + "." + b64.EncodeToString(tandaTangan(secret, isi))
}

func periksaToken(secret []byte, token string, now time.Time) (Klaim, error) {
	var k Klaim
	p := strings.Split(token, ".")
	if len(p) != 3 {
		return k, errors.New("format token salah")
	}
	if h, _ := b64.DecodeString(p[0]); string(h) != `{"alg":"HS256","typ":"JWT"}` {
		return k, errors.New("algoritma tidak diterima") // menolak "alg":"none" dan algoritma lain
	}
	sig, _ := b64.DecodeString(p[2])
	if !hmac.Equal(sig, tandaTangan(secret, p[0]+"."+p[1])) {
		return k, errors.New("signature tidak cocok")
	}
	body, _ := b64.DecodeString(p[1])
	if json.Unmarshal(body, &k) != nil || k.Sub == "" {
		return k, errors.New("payload rusak")
	}
	if now.Unix() >= k.Exp {
		return k, errors.New("token kedaluwarsa")
	}
	return k, nil
}

// --8<-- [end:token]

func tandaTangan(secret []byte, isi string) []byte {
	m := hmac.New(sha256.New, secret)
	m.Write([]byte(isi))
	return m.Sum(nil)
}
