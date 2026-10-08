/* Widget "Dua client, satu saldo": memutar ulang rekaman Postgres langkah demi langkah.
 *
 * Pakai di Markdown:
 *   <div data-bb="race" data-modes="tx-tanpa-lock,for-update,atomic,optimistic"></div>
 *
 * Data: widgets/data/b3-race/<mode>.json, dibuat oleh labs/b3-race/run.py dari
 * PostgreSQL sungguhan. Widget ini tidak mensimulasikan apa pun, hanya memutar ulang.
 * Langkah yang sudah lewat tetap terlihat di timeline (tidak ada informasi yang hilang).
 */
(function () {
  "use strict";
  var BB = window.BB;
  var OPTION_VALUES = [-20000, 30000, 50000];
  var OPTIONS = OPTION_VALUES.map(function (v) { return BB.rp(v); }).concat(["Belum tahu"]);
  var VAR_LABEL = { saldo_dibaca: "saldo yang dibaca", version: "version yang dibaca" };

  function clientCard(name) {
    var status = BB.el("span", { class: "bb-chip" });
    var vars = BB.el("dl", { class: "bb-vars" });
    var last = BB.el("code", { class: "bb-client__sql" });
    var card = BB.el("div", { class: "bb-client" }, [
      BB.el("div", { class: "bb-client__head" }, [BB.el("span", { class: "bb-actor bb-actor--" + name, text: name }),
        BB.el("strong", { text: "Client " + name }), status]),
      vars, last]);
    return { card: card, status: status, vars: vars, last: last };
  }

  BB.mounts.race = function (host) {
    var modes = host.dataset.modes.split(",");
    host.textContent = "Memuat rekaman...";
    Promise.all(modes.map(function (m) { return BB.fetchJSON("data/b3-race/" + m + ".json"); })).then(function (all) {
      host.textContent = "";
      host.classList.add("bb-widget", "bb-race");
      host.tabIndex = 0;
      var data = {};
      all.forEach(function (d) { data[d.id] = d; });
      var mode = modes[0];
      var i = 0;           // jumlah langkah yang sudah ditampilkan
      var predicted = {};  // mode -> indeks tebakan

      var tabs = BB.el("div", { class: "bb-tabs", role: "tablist", "aria-label": "Cara mengamankan penarikan" });
      modes.forEach(function (m) {
        tabs.appendChild(BB.el("button", { type: "button", role: "tab", class: "bb-tab", "data-m": m,
          text: data[m].title, onclick: function () { mode = m; i = 0; render(); } }));
      });

      var predictHost = BB.el("div");
      var A = clientCard("A"), B = clientCard("B");
      var dbSaldo = BB.el("span", { class: "bb-db__saldo" });
      var dbLock = BB.el("span", { class: "bb-chip" });
      var db = BB.el("div", { class: "bb-db" }, [
        BB.el("strong", { text: "Database" }),
        BB.el("div", { class: "bb-db__row" }, [BB.el("span", { class: "bb-muted", text: "saldo yang sudah commit" }), dbSaldo]),
        BB.el("div", { class: "bb-db__row" }, [BB.el("span", { class: "bb-muted", text: "row lock" }), dbLock])]);
      var stage = BB.el("div", { class: "bb-stage" }, [A.card, db, B.card]);

      var now = BB.el("p", { class: "bb-now", "aria-live": "polite" });
      var prev = BB.el("button", { type: "button", class: "bb-btn", text: "← Sebelumnya", onclick: function () { if (i > 0) { i--; render(); } } });
      var next = BB.el("button", { type: "button", class: "bb-btn bb-btn--primary", text: "Berikutnya →", onclick: function () { step(); } });
      var reset = BB.el("button", { type: "button", class: "bb-btn bb-btn--quiet", text: "Ulang", onclick: function () { i = 0; render(); } });
      var counter = BB.el("span", { class: "bb-muted" });
      var timeline = BB.el("ol", { class: "bb-steps bb-timeline" });
      var summary = BB.el("p", { class: "bb-summary", role: "status" });
      var foot = BB.el("p", { class: "bb-widget__foot bb-muted" });

      var head = BB.el("div", { class: "bb-widget__head" }, [BB.el("strong", { text: "Dua perangkat, satu saldo" }),
        BB.el("span", { class: "bb-muted", text: "Langkah demi langkah · panah kiri/kanan" }),
        BB.sumberChip({ jenis: "rekaman", file: "labs/b3-race/run.py" })]);
      [head, tabs, predictHost, stage, now, BB.el("div", { class: "bb-row" }, [prev, next, reset, counter]),
        timeline, summary, foot].forEach(function (n) { host.appendChild(n); });

      host.addEventListener("keydown", function (e) {
        if (e.target.closest("button") && e.key === " ") return;
        if (e.key === "ArrowRight") { e.preventDefault(); step(); }
        if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); i--; render(); }
      });

      function step() {
        if (!(mode in predicted)) return;
        if (i < data[mode].steps.length) { i++; render(); }
      }

      function paintClient(c, name, s, done) {
        var waiting = s && s.waiting.indexOf(name) >= 0;
        var vars = s ? s.vars[name] : {};
        var mine = done.filter(function (st) { return st.actor === name; });
        var last = mine[mine.length - 1];
        c.status.textContent = waiting ? "menunggu lock" : !s ? "siap" : "jalan";
        c.status.className = "bb-chip" + (waiting ? " is-warn" : "");
        c.card.classList.toggle("is-waiting", waiting);
        c.vars.innerHTML = "";
        Object.keys(vars).forEach(function (k) {
          c.vars.appendChild(BB.el("dt", { text: VAR_LABEL[k] || k }));
          c.vars.appendChild(BB.el("dd", { text: k === "saldo_dibaca" ? BB.rp(vars[k]) : String(vars[k]) }));
        });
        if (!Object.keys(vars).length) c.vars.appendChild(BB.el("dd", { class: "bb-muted", text: "belum membaca apa pun" }));
        c.last.textContent = last ? (last.sql || "(" + last.result + ")") : "";
        c.last.classList.toggle("is-now", !!(s && s.actor === name));
      }

      function render() {
        var d = data[mode];
        tabs.querySelectorAll(".bb-tab").forEach(function (t) {
          t.setAttribute("aria-selected", t.dataset.m === mode ? "true" : "false");
        });

        predictHost.innerHTML = "";
        var pBox = BB.predict({ q: "Saldo awal " + BB.rp(d.start) + ". A menarik " + BB.rp(d.withdraw.A) + ", B menarik " + BB.rp(d.withdraw.B) +
          " pada waktu bersamaan. Berapa saldo akhir?", options: OPTIONS }, function (k) { predicted[mode] = k; render(); });
        if (mode in predicted) {
          pBox.querySelectorAll("button").forEach(function (b, k) {
            b.disabled = true;
            if (k === predicted[mode]) b.classList.add("is-picked");
          });
        }
        predictHost.appendChild(pBox);

        var s = i > 0 ? d.steps[i - 1] : null;
        var done = d.steps.slice(0, i);
        paintClient(A, "A", s, done);
        paintClient(B, "B", s, done);
        dbSaldo.textContent = BB.rp(s ? s.committed : d.start);
        dbLock.textContent = s && s.lock ? "dipegang " + s.lock : "tidak ada";
        dbLock.className = "bb-chip" + (s && s.lock ? " is-system" : "");

        if (!(mode in predicted)) now.textContent = "Pilih tebakanmu dulu, lalu tekan Berikutnya.";
        else if (!s) now.textContent = "Belum ada langkah. Tekan Berikutnya (atau panah kanan).";
        else now.textContent = "Langkah " + i + " · " + s.actor + ": " + (s.sql ? s.sql + " → " + s.result : s.result) +
          (s.note && s.note !== "kode aplikasi" ? " (" + s.note + ")" : "");

        timeline.innerHTML = "";
        d.steps.slice(0, i).forEach(function (st, k) {
          var li = BB.el("li", { class: "bb-step" + (k === i - 1 ? " is-current" : "") + (st.result === "MENUNGGU lock" ? " is-wait" : "") + (st.sql ? "" : " is-app") }, [
            BB.el("span", { class: "bb-actor bb-actor--" + st.actor, text: st.actor }),
            st.sql ? BB.el("code", { class: "bb-step__sql", text: st.sql }) : BB.el("em", { class: "bb-step__sql", text: st.result }),
            st.sql ? BB.el("span", { class: "bb-step__res", text: "→ " + st.result }) : null]);
          timeline.appendChild(li);
        });
        timeline.scrollTop = timeline.scrollHeight; // langkah terbaru selalu terlihat

        counter.textContent = "Langkah " + i + " dari " + d.steps.length;
        prev.disabled = i === 0;
        next.disabled = !(mode in predicted) || i >= d.steps.length;

        summary.innerHTML = "";
        summary.className = "bb-summary";
        if (i === d.steps.length) {
          var correct = OPTION_VALUES.indexOf(d.final);
          var pick = predicted[mode];
          var verdict = pick === correct ? "Tebakanmu benar. " : pick === 3 ? "" : "Tebakanmu meleset. ";
          summary.classList.add(d.final === d.start - d.withdraw.A ? "is-good" : "is-warn");
          summary.appendChild(BB.el("strong", { text: "Saldo akhir " + BB.rp(d.final) + ". " }));
          summary.appendChild(document.createTextNode(verdict + d.summary));
        }
        foot.textContent = "Rekaman PostgreSQL " + d.postgres.split(" ")[0] + ", isolation " + d.isolation +
          ", direkam " + d.recorded + " oleh labs/b3-race/run.py. Bukan simulasi.";
      }
      render();
    }).catch(function (e) {
      host.textContent = "Rekaman gagal dimuat: " + e.message;
    });
  };

  BB.mountAll();
})();
