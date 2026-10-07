/* "Siapa yang mengerjakan?": pilah tiap tugas ke salah satu kelompok, lalu cek.
 *
 * Pakai di Markdown:
 *   <div data-bb="pilah" data-src="data/a1-pilah.json"></div>
 *
 * Data:
 *   judul, kelompok: ["App", "Backend", ...]
 *   item: [{ teks, jawab: <indeks kelompok>, kenapa }]
 * Tombol Cek aktif setelah semua item dipilih. Setelah dicek, tiap item menampilkan alasannya.
 */
(function () {
  "use strict";

  // Logika murni: skor dan daftar item yang meleset.
  function nilai(d, pilihan) {
    var benar = 0, salah = [];
    d.item.forEach(function (it, k) { if (pilihan[k] === it.jawab) benar++; else salah.push(k); });
    return { benar: benar, total: d.item.length, salah: salah };
  }
  if (typeof module !== "undefined") { module.exports = { nilai: nilai }; return; }

  var BB = window.BB;

  BB.mounts.pilah = function (host) {
    BB.fetchJSON(host.dataset.src).then(function (d) {
      var pilihan = d.item.map(function () { return null; });
      var dicek = false;
      var list = BB.el("ol", { class: "bb-pilah__list" });
      var cek = BB.el("button", { type: "button", class: "bb-btn bb-btn--primary", text: "Cek jawaban", disabled: "disabled" });
      var hasil = BB.el("p", { class: "bb-summary", role: "status" });
      var rows = d.item.map(function (it, k) {
        var btns = d.kelompok.map(function (g, j) {
          return BB.el("button", { type: "button", class: "bb-btn bb-btn--opt", "aria-pressed": "false", text: g, onclick: function () {
            if (dicek) return;
            pilihan[k] = j;
            btns.forEach(function (b, x) { b.setAttribute("aria-pressed", x === j ? "true" : "false"); });
            if (pilihan.every(function (p) { return p !== null; })) cek.removeAttribute("disabled");
          } });
        });
        var why = BB.el("p", { class: "bb-pilah__why", hidden: "hidden" });
        var li = BB.el("li", { class: "bb-pilah__item" }, [
          BB.el("span", { class: "bb-pilah__task", text: it.teks }),
          BB.el("span", { class: "bb-pilah__opts", role: "group", "aria-label": "Pilih untuk: " + it.teks }, btns), why]);
        list.appendChild(li);
        return { li: li, why: why };
      });
      cek.addEventListener("click", function () {
        dicek = true;
        var r = nilai(d, pilihan);
        d.item.forEach(function (it, k) {
          var ok = pilihan[k] === it.jawab;
          rows[k].li.classList.add(ok ? "is-good" : "is-warn");
          rows[k].why.hidden = false;
          rows[k].why.textContent = (ok ? "Tepat. " : "Jawabannya " + d.kelompok[it.jawab] + ". ") + it.kenapa;
        });
        list.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
        cek.disabled = true;
        hasil.className = "bb-summary " + (r.benar === r.total ? "is-good" : "is-warn");
        hasil.textContent = r.benar + " dari " + r.total + " tepat. " + (d.penutup || "");
      });
      host.appendChild(BB.el("div", { class: "bb-widget bb-pilah" }, [
        BB.el("div", { class: "bb-widget__head" }, [BB.el("strong", { text: d.judul }),
          BB.el("span", { class: "bb-muted", text: "Pilih untuk setiap baris, lalu cek" })]),
        list, BB.el("div", { class: "bb-row" }, [cek]), hasil]));
    }).catch(function (e) { host.textContent = "Widget gagal dimuat: " + e.message; });
  };

  BB.mountAll();
})();
