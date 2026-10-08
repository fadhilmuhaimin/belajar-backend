// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { sidebar } from "./tools/sidebar.mjs";
import remarkRujukan from "./src/plugins/remark-rujukan.mjs";
import { temaShiki } from "./src/lib/shiki-tema.mjs";
import { unified } from "@astrojs/markdown-remark";

export default defineConfig({
  // Domain final mengikuti keputusan hosting fase 0 (Cloudflare Pages); nilai ini hanya untuk sitemap. [perlu verifikasi]
  site: "https://belajar-backend.pages.dev",
  integrations: [
    starlight({
      title: "Belajar Backend",
      defaultLocale: "root",
      locales: { root: { label: "Bahasa Indonesia", lang: "id" } },
      customCss: ["./src/styles/tema.css"],
      sidebar: sidebar(),
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        Pagination: "./src/components/Lanjut.astro",
      },
      // Semua blok kode lewat Shiki Astro dengan tema token CSS (lihat src/lib/shiki-tema.mjs), bukan Expressive Code.
      expressiveCode: false,
      // Halaman 404 ditulis sebagai konten biasa (src/content/docs/404.md); route 404 bawaan Starlight bentrok dengannya di Astro 7.
      disable404Route: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 2 },
      credits: false,
    }),
  ],
  markdown: {
    // Astro 7 memakai Sätteri sebagai pemroses Markdown bawaan; plugin remark butuh pemroses unified.
    processor: unified({ remarkPlugins: [remarkRujukan], smartypants: false }), // tanda kutip tetap lurus, sama dengan situs lama
    shikiConfig: { theme: temaShiki },
  },
});
