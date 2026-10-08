/* Token bucket (rate limit): kirim request, lihat token habis, tunggu, lihat token terisi lagi.
 *
 * Pakai di Markdown:
 *   <div data-bb="ember" data-src="data/c4-ember.json"></div>
 *
 * Data:
 *   judul, sumber { jenis, catatan }, tebak { q, options, benar, jelas, setelah: <indeks aksi> }
 *   mode: [{ id, label, ember: { <jenis kunci>: { kapasitas, perDetik } } }]   jenis kunci: "ip" | "akun"
 *   aksi: [{ label, tunggu?: detik, kirim?: { jumlah, akun, ip, akunBeda?: true } }]
 * Jam disimulasikan (tidak menunggu sungguhan). Aturannya sama dengan lab labs/c4-ratelimit/main.go.
 */
(function () {
  "use strict";

  // ---- logika murni (dites di tests/widgets/ember.test.cjs) ----
  function ambil(ember, kunci, cfg, now) {
    var e = ember[kunci];
    if (!e) e = ember[kunci] = { token: cfg.kapasitas, t: now };
    e.token = Math.min(cfg.kapasitas, e.token + (now - e.t) * cfg.perDetik);
    e.t = now;
    if (e.token >= 1) { e.token -= 1; return { ok: true }; }
    return { ok: false, retryAfter: Math.ceil((1 - e.token) / cfg.perDetik - 1e-9) };
  }

  // Satu request: setiap ember yang berlaku harus punya token (urutan sama dengan lab: IP dulu, lalu akun).
  function kirim(state, mode, req) {
    var urut = ["ip", "akun"].filter(function (j) { return mode.ember[j]; });
    for (var i = 0; i < urut.length; i++) {
      var j = urut[i];
      var r = ambil(state.ember, j + ":" + req[j], mode.ember[j], state.now);
      if (!r.ok) return { status: 429, retryAfter: r.retryAfter };
    }
    return { status: req.pinBenar ? 200 : 401 };
  }

  function jalankan(state, mode, aksi) {
    if (aksi.tunggu) { state.now += aksi.tunggu; return { tunggu: aksi.tunggu }; }
    var k = aksi.kirim, hasil = [];
    for (var i = 0; i < k.jumlah; i++) {
      hasil.push(kirim(state, mode, { ip: k.ip, akun: k.akunBeda ? k.akun + (i + 1) : k.akun, pinBenar: !!k.pinBenar }));
    }
    return { hasil: hasil };
  }

  function baru() { return { now: 0, ember: {} }; }

  if (typeof module !== "undefined") { module.exports = { ambil: ambil, kirim: kirim, jalankan: jalankan, baru: baru }; return; }

  // ---- DOM ----
  var BB = window.BB;

  function ringkas(aksi, r) {
    if (r.tunggu) return "Jam maju " + r.tunggu + " detik.";
    var n = {}, ra = 0;
    r.hasil.forEach(function (h) { n[h.status] = (n[h.status] || 0) + 1; if (h.retryAfter) ra = h.retryAfter; });
    var bag = [];
    if (n[200]) bag.push(n[200] + " berhasil (200)");
    if (n[401]) bag.push(n[401] + " sampai ke pemeriksaan PIN dan salah (401)");
    if (n[429]) bag.push(n[429] + " ditolak sebelum PIN dicek (429, Retry-After " + ra + " detik)");
    return aksi.label + ": " + bag.join(", ") + ".";
  }

  BB.mounts.ember = function (host) {
    BB.fetchJSON(host.dataset.src).then(function (d) {
      var modeIdx = 0, state = baru(), sudahTebak = false;
      var kepala = BB.el("div", { class: "bb-ember__head" }, [BB.el("strong", { text: d.judul }), " ", BB.sumberChip(d.sumber)]);
      var modeRow = BB.el("div", { class: "bb-ember__mode", role: "group", "aria-label": "Key bucket" });
      var jam = BB.el("span", { class: "bb-ember__jam" });
      var ember = BB.el("div", { class: "bb-ember__ember", "aria-live": "polite" });
      var log = BB.el("ul", { class: "bb-ember__log", role: "status" });
      var tombol = BB.el("div", { class: "bb-ember__aksi" });
      var tebak = d.tebak ? BB.predict({ q: d.tebak.q, options: d.tebak.options }, function () {}) : null;

      function gambarEmber() {
        var mode = d.mode[modeIdx];
        jam.textContent = "Jam simulasi: " + state.now + " detik";
        ember.textContent = "";
        var kunci = Object.keys(state.ember);
        if (!kunci.length) { ember.appendChild(BB.el("p", { class: "bb-muted", text: "Belum ada request. Setiap key punya bucket sendiri, penuh di awal." })); return; }
        kunci.slice(-3).forEach(function (k) {
          var jenis = k.split(":")[0], cfg = mode.ember[jenis];
          var e = state.ember[k];
          var isi = Math.min(cfg.kapasitas, e.token + (state.now - e.t) * cfg.perDetik);
          var vis;
          if (cfg.kapasitas <= 10) {
            vis = BB.el("span", { class: "bb-ember__token", "aria-hidden": "true" });
            for (var i = 0; i < cfg.kapasitas; i++) vis.appendChild(BB.el("i", { class: i < Math.floor(isi + 1e-9) ? "is-isi" : "" }));
          } else vis = BB.el("span", { class: "bb-ember__angka", text: Math.floor(isi + 1e-9) + "/" + cfg.kapasitas });
          ember.appendChild(BB.el("div", { class: "bb-ember__baris" }, [
            BB.el("span", { class: "bb-ember__kunci", text: (jenis === "ip" ? "IP " : "Akun ") + k.slice(jenis.length + 1) }),
            vis, BB.el("span", { class: "bb-sr", text: Math.floor(isi + 1e-9) + " dari " + cfg.kapasitas + " token" })]));
        });
      }

      function pasangMode() {
        modeRow.textContent = "";
        d.mode.forEach(function (m, i) {
          modeRow.appendChild(BB.el("button", { type: "button", class: "bb-btn bb-btn--opt", "aria-pressed": i === modeIdx ? "true" : "false",
            text: m.label, onclick: function () { modeIdx = i; state = baru(); log.textContent = ""; pasangMode(); gambarEmber(); } }));
        });
      }

      d.aksi.forEach(function (a, i) {
        tombol.appendChild(BB.el("button", { type: "button", class: "bb-btn" + (a.tunggu ? "" : " bb-btn--primary"), text: a.label, onclick: function () {
          var r = jalankan(state, d.mode[modeIdx], a);
          log.insertBefore(BB.el("li", { text: ringkas(a, r) }), log.firstChild);
          while (log.children.length > 4) log.removeChild(log.lastChild);
          gambarEmber();
          if (tebak && !sudahTebak && i === d.tebak.setelah && modeIdx === 0) { sudahTebak = true; tebak.reveal(d.tebak.benar, d.tebak.jelas); }
        } }));
      });

      pasangMode();
      gambarEmber();
      // Tombol di atas ember: setelah tap, perubahan token dan ringkasan langsung terlihat di bawahnya (375 px).
      host.appendChild(BB.el("div", { class: "bb-ember" }, [kepala, tebak, modeRow, tombol,
        BB.el("div", { class: "bb-ember__status" }, [jam]), ember, log].filter(Boolean)));
    }).catch(function (e) { host.textContent = "Widget gagal dimuat: " + e.message; });
  };

  BB.mountAll();
})();
