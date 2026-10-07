CREATE TABLE transfer (
  id     bigserial PRIMARY KEY,
  dari   text NOT NULL REFERENCES akun(id),
  ke     text NOT NULL REFERENCES akun(id),
  jumlah bigint NOT NULL CHECK (jumlah > 0)
);
