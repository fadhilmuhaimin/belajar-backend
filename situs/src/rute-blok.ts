// Route middleware Starlight (keputusan 118): di halaman berblok, daftar isi kanan (desktop dan HP) hanya memuat
// blok halaman itu, bukan heading di dalamnya. Heading ### di dalam blok tetap ada di halaman.
import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { daftarBlok, slugBlok } from "./lib/blok";

export const onRequest = defineRouteMiddleware((context) => {
  const r = context.locals.starlightRoute;
  const bloks = daftarBlok(r.entry.body ?? "");
  if (!bloks.length || !r.toc) return;
  const ringkasan = r.toc.items.filter((x) => x.slug === "_top");
  r.toc.items = [...ringkasan, ...bloks.map((b) => ({ depth: 2, slug: slugBlok(b.nama), text: b.nama, children: [] }))];
});
