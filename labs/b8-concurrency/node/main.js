// Lab B8 · Node.js: 10 notifikasi (500 ms per kiriman), lalu event loop yang tersumbat kerja CPU.
const http = require("node:http");

function kirim() {
  return new Promise((ok) => {
    const req = http.request("http://127.0.0.1:18090/kirim", { method: "POST" }, (res) => { res.resume(); res.on("end", ok); });
    req.on("error", ok);
    req.end();
  });
}

// --8<-- [start:paralel]
async function berurutan(n) {
  for (let i = 0; i < n; i++) await kirim();   // menunggu satu per satu
}

async function paralel(n) {
  await Promise.all(Array.from({ length: n }, () => kirim()));   // semua dimulai, lalu ditunggu bersama
}
// --8<-- [end:paralel]

async function ukur(nama, f) {
  const t = performance.now();
  await f();
  console.log(`${nama.padEnd(28)} ${((performance.now() - t) / 1000).toFixed(2).padStart(6)} detik`);
}

(async () => {
  console.log(`# Node.js ${process.version} · 10 notifikasi, layanan tiruan 500 ms per kiriman`);
  await ukur("berurutan (await di loop)", () => berurutan(10));
  await ukur("paralel (Promise.all)", () => paralel(10));

})();
