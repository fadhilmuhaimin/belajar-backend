/* Dua arsitektur berdampingan. Pilih satu fitur: bagian yang mengerjakannya tersorot di kedua opsi.
 *
 * Pakai di Markdown:
 *   <div data-bb="banding" data-src="data/a4-banding.json"></div>
 *
 * Data:
 *   judul
 *   opsi:  [{ id, nama, baris: [[{ id, label, sub? }]], judulBaris?: ["", "label baris 2"] }]
 *          baris[0] = jalur request (atas ke bawah); baris berikutnya = kelompok pendukung berlabel
 *   fitur: [{ label, sorot: { <id opsi>: [id simpul] }, catatan: { <id opsi>: "..." }, nada?: { <id opsi>: "warn" } }]
 */
(function () {
  "use strict";

  // Logika murni: semua id simpul yang dirujuk fitur harus ada di opsinya.
  function cekData(d) {
    var err = [];
    d.fitur.forEach(function (f) {
      d.opsi.forEach(function (o) {
        var ids = [].concat.apply([], o.baris).map(function (s) { return s.id; });
        (f.sorot[o.id] || []).forEach(function (id) {
          if (ids.indexOf(id) < 0) err.push(f.label + ": simpul " + id + " tidak ada di " + o.id);
        });
        if (!f.catatan || !f.catatan[o.id]) err.push(f.label + ": catatan " + o.id + " kosong");
      });
    });
    return err;
  }
  if (typeof module !== "undefined") { module.exports = { cekData: cekData }; return; }

  var BB = window.BB;

  BB.mounts.banding = function (host) {
    BB.fetchJSON(host.dataset.src).then(function (d) {
      var cols = d.opsi.map(function (o) {
        var nodes = {};
        var fig = BB.el("div", { class: "bb-banding__opt" }, [BB.el("strong", { class: "bb-banding__name", text: o.nama })]);
        o.baris.forEach(function (baris, r) {
          // Baris pertama = jalur request (vertikal, panah ↓). Baris berikutnya = kelompok berlabel.
          if (r > 0 && o.judulBaris && o.judulBaris[r]) fig.appendChild(BB.el("small", { class: "bb-banding__sublabel", text: o.judulBaris[r] }));
          var ol = BB.el("ol", { class: "bb-banding__row" + (r > 0 ? " is-sub" : "") });
          baris.forEach(function (s) {
            var li = BB.el("li", null, [s.label, s.sub ? BB.el("small", { text: s.sub }) : null]);
            nodes[s.id] = li;
            ol.appendChild(li);
          });
          fig.appendChild(ol);
        });
        var note = BB.el("p", { class: "bb-banding__note", "aria-live": "polite" });
        fig.appendChild(note);
        return { o: o, nodes: nodes, note: note, el: fig };
      });
      var tabs = BB.el("div", { class: "bb-banding__features", role: "group", "aria-label": "Pilih fitur" });
      function pick(k) {
        var f = d.fitur[k];
        tabs.querySelectorAll("button").forEach(function (b, x) { b.setAttribute("aria-pressed", x === k ? "true" : "false"); });
        cols.forEach(function (c) {
          var on = f.sorot[c.o.id] || [];
          var warn = f.nada && f.nada[c.o.id] === "warn";
          Object.keys(c.nodes).forEach(function (id) {
            c.nodes[id].className = on.indexOf(id) >= 0 ? (warn ? "is-warn" : "is-on") : "";
          });
          c.note.textContent = f.catatan[c.o.id];
          c.note.className = "bb-banding__note" + (warn ? " is-warn" : "");
        });
      }
      d.fitur.forEach(function (f, k) {
        tabs.appendChild(BB.el("button", { type: "button", class: "bb-btn bb-btn--opt", "aria-pressed": "false", text: f.label,
          onclick: function () { pick(k); } }));
      });
      host.appendChild(BB.el("div", { class: "bb-widget bb-banding" }, [
        BB.el("div", { class: "bb-widget__head" }, [BB.el("strong", { text: d.judul }),
          BB.el("span", { class: "bb-muted", text: "Pilih fitur, lihat siapa yang mengerjakannya" })]),
        tabs, BB.el("div", { class: "bb-banding__cols" }, cols.map(function (c) { return c.el; }))]));
      pick(0);
    }).catch(function (e) { host.textContent = "Widget gagal dimuat: " + e.message; });
  };

  BB.mountAll();
})();
