/* Logika murni untuk widget Before/After SQL. Tanpa DOM, supaya bisa dites di Node.
 *
 * Skenario (JSON di widgets/data/):
 *   setup   SQL yang menyiapkan tabel
 *   check   SELECT untuk menampilkan hasil akhir
 *   panels  { before, after }, masing-masing:
 *     steps    [{ sql, actor?, store?, note?, rowsLabel? }]
 *              store: nama variabel aplikasi untuk nilai kolom pertama baris pertama
 *              rowsLabel: arti jumlah baris berubah, mis. {"0": "ditolak", "1": "sukses"}
 *              sql boleh memuat ${nama} atau ${nama - 70} / ${nama + 70}
 *     onError  "stop" (berhenti, tanpa rollback) | "rollback" (jalankan ROLLBACK lalu berhenti)
 *   toggles [{ label, pairs: [[cari, ganti], ...] }]  ubah satu hal di semua SQL, lalu jalankan ulang
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else (root.BB = root.BB || {}).runsqlCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var TEMPLATE = /\$\{(\w+)(?:\s*([+-])\s*(\d+))?\}/g;

  function fill(sql, vars) {
    return sql.replace(TEMPLATE, function (_, name, op, num) {
      if (!(name in vars)) throw new Error("variabel ${" + name + "} belum diisi");
      var v = Number(vars[name]);
      if (op === "+") v += Number(num);
      if (op === "-") v -= Number(num);
      return String(v);
    });
  }

  function applyToggles(text, toggles) {
    (toggles || []).forEach(function (t) {
      t.pairs.forEach(function (p) { text = text.split(p[0]).join(p[1]); });
    });
    return text;
  }

  function firstValue(res) {
    return res.length && res[0].values.length ? res[0].values[0][0] : null;
  }

  /* Jalankan satu panel di database baru. Mengembalikan log langkah + tabel akhir. */
  function runPanel(SQL, scenario, panelName, activeToggles) {
    var panel = scenario.panels[panelName];
    var db = new SQL.Database();
    var vars = {};
    var log = [];
    try {
      db.exec(applyToggles(scenario.setup, activeToggles));
      for (var i = 0; i < panel.steps.length; i++) {
        var step = panel.steps[i];
        var sql = fill(applyToggles(step.sql, activeToggles), vars);
        try {
          var res = db.exec(sql);
          var entry = { actor: step.actor || null, sql: sql, ok: true, note: step.note || null };
          if (res.length) {
            entry.result = res[0].values.map(function (r) { return r.join(", "); }).join("; ");
          } else if (/^\s*(UPDATE|INSERT|DELETE)/i.test(sql)) {
            var n = db.getRowsModified();
            entry.result = n + " baris berubah";
            if (step.rowsLabel && step.rowsLabel[n]) entry.result += " = " + step.rowsLabel[n];
          } else {
            entry.result = "ok";
          }
          if (step.store) vars[step.store] = firstValue(res);
          log.push(entry);
        } catch (e) {
          log.push({ actor: step.actor || null, sql: sql, ok: false, result: e.message, note: step.note || null });
          if (panel.onError === "rollback") {
            db.exec("ROLLBACK");
            log.push({ actor: step.actor || null, sql: "ROLLBACK", ok: true, result: "ok",
                       note: "dijalankan aplikasi karena ada error", auto: true });
          }
          for (var j = i + 1; j < panel.steps.length; j++) {
            log.push({ actor: panel.steps[j].actor || null, sql: applyToggles(panel.steps[j].sql, activeToggles),
                       skipped: true, result: "tidak dijalankan" });
          }
          break;
        }
      }
      var table = db.exec(scenario.check)[0] || { columns: [], values: [] };
      return { log: log, table: { columns: table.columns, values: table.values }, vars: vars };
    } finally {
      db.close();
    }
  }

  function engineVersion(SQL) {
    var db = new SQL.Database();
    try { return "SQLite " + db.exec("SELECT sqlite_version()")[0].values[0][0]; }
    finally { db.close(); }
  }

  return { fill: fill, applyToggles: applyToggles, runPanel: runPanel, engineVersion: engineVersion };
});
