/* Stepper lintas stack: satu daftar langkah netral, sorot baris kode yang sesuai di setiap tab.
 *
 * Pakai di Markdown, tepat sebelum content tabs (=== "Go" ...):
 *   <div data-bb="stackstep" data-src="data/b3-1-stackstep.json"></div>
 *
 * Data:
 *   langkah  [{ id, label }]
 *   stack    { "<label tab persis>": { pola: { <id>: ["teks di baris kode", ...] },
 *                                     catatan: { <id>: "penjelasan bila implisit/berbeda" } } }
 * Baris dicocokkan lewat isi teks (bukan nomor baris), jadi tetap benar walau kode lab berubah.
 * Butuh pymdownx.highlight line_spans: __span (setiap baris kode punya <span id="__span-...">).
 */
(function () {
  "use strict";
  var BB = window.BB;

  // Blok kode di satu tab, tanpa blok "Output rekaman". Nomor baris dihitung per blok.
  function codeBlocks(tab) {
    return Array.prototype.slice.call(tab.querySelectorAll("div.highlight")).filter(function (h) {
      var title = h.querySelector(".filename");
      return !(title && /output/i.test(title.textContent));
    }).map(function (h) {
      return Array.prototype.slice.call(h.querySelectorAll("pre code > span[id^='__span']"));
    });
  }

  BB.mounts.stackstep = function (host) {
    BB.fetchJSON(host.dataset.src).then(function (cfg) {
      var tabs = host.nextElementSibling;
      while (tabs && !tabs.classList.contains("tabbed-set")) tabs = tabs.nextElementSibling;
      if (!tabs) throw new Error("content tabs tidak ditemukan sesudah stepper");

      var labels = Array.prototype.slice.call(tabs.querySelectorAll(".tabbed-labels > label"));
      var blocks = Array.prototype.slice.call(tabs.querySelectorAll(".tabbed-content > .tabbed-block"));
      var inputs = Array.prototype.slice.call(tabs.querySelectorAll(":scope > input"));
      var notes = blocks.map(function (b) {
        var n = BB.el("p", { class: "bb-stepnote", "aria-live": "polite" });
        b.insertBefore(n, b.firstChild);
        return n;
      });

      host.classList.add("bb-stackstep");
      var buttons = BB.el("div", { class: "bb-stackstep__steps", role: "group", "aria-label": "Langkah netral" });
      var status = BB.el("p", { class: "bb-stackstep__status bb-muted", "aria-live": "polite",
        text: "Klik satu langkah. Baris kode yang mengerjakannya akan tersorot di setiap tab." });
      var current = null;

      cfg.langkah.forEach(function (st, i) {
        buttons.appendChild(BB.el("button", { type: "button", class: "bb-btn bb-step-btn", "data-id": st.id,
          "aria-pressed": "false", text: (i + 1) + ". " + st.label, onclick: function () { pick(st.id); } }));
      });
      host.appendChild(buttons);
      host.appendChild(status);

      function openIndex() {
        for (var i = 0; i < inputs.length; i++) if (inputs[i].checked) return i;
        return 0;
      }

      function pick(id) {
        current = id;
        buttons.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-pressed", b.dataset.id === id ? "true" : "false");
        });
        var step = cfg.langkah.filter(function (s) { return s.id === id; })[0];
        blocks.forEach(function (block, i) {
          var name = labels[i] ? labels[i].textContent.trim() : "";
          var s = cfg.stack[name] || { pola: {}, catatan: {} };
          var pats = (s.pola && s.pola[id]) || [];
          var hit = [];
          var many = codeBlocks(block).filter(function (l) { return l.length; }).length > 1;
          codeBlocks(block).forEach(function (lines, k) {
            lines.forEach(function (line, n) {
              var on = pats.some(function (p) { return line.textContent.indexOf(p) >= 0; });
              line.classList.toggle("bb-hl", on);
              if (on) hit.push((n + 1) + (many ? " (blok " + (k + 1) + ")" : ""));
            });
          });
          var cat = s.catatan && s.catatan[id];
          notes[i].textContent = "Langkah " + step.label + ": " +
            (hit.length ? "baris " + hit.join(", ") + (cat ? ". " + cat : ".") : (cat || "tidak ada baris yang cocok."));
          notes[i].classList.toggle("is-implicit", !hit.length);
          block.dataset.hits = hit.length;
        });
        report();
      }

      function report() {
        if (!current) return;
        var i = openIndex();
        var name = labels[i] ? labels[i].textContent.trim() : "";
        status.textContent = "Tab " + name + ": " + notes[i].textContent.replace(/^Langkah [^:]*: /, "");
      }
      inputs.forEach(function (inp) { inp.addEventListener("change", report); });
    }).catch(function (e) { host.textContent = "Stepper gagal dimuat: " + e.message; });
  };

  BB.mountAll();
})();
