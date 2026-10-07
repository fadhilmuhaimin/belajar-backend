// Lab B8 · server Node.js untuk uji kerja CPU, dijalankan sebagai proses terpisah.
const http = require("node:http");
// --8<-- [start:blok]
http.createServer((req, res) => {
  if (req.url === "/cpu") {
    const akhir = Date.now() + 1000;
    while (Date.now() < akhir) {}   // kerja CPU 1 detik di thread event loop
  }
  res.end();
}).listen(18092, "127.0.0.1");
// --8<-- [end:blok]
