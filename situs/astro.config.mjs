// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { sidebar } from "./tools/sidebar.mjs";
import remarkRujukan from "./src/plugins/remark-rujukan.mjs";
import remarkAbbr from "./src/plugins/remark-abbr.mjs";
import { temaShiki } from "./src/lib/shiki-tema.mjs";
import { unified } from "@astrojs/markdown-remark";

export default defineConfig({
  // Domain final mengikuti keputusan hosting fase 0 (Cloudflare Pages); nilai ini hanya untuk sitemap. [perlu verifikasi]
  site: "https://rekeningo-tech-journey.pages.dev",
  integrations: [
    starlight({
      title: "Rekeningo Tech Journey",
      defaultLocale: "root",
      locales: { root: { label: "Bahasa Indonesia", lang: "id" } },
      customCss: ["./src/styles/tema.css"],
      sidebar: sidebar(),
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        Pagination: "./src/components/Lanjut.astro",
        MarkdownContent: "./src/components/MarkdownContent.astro",
      },
      // Semua blok kode lewat Shiki Astro dengan tema token CSS (lihat src/lib/shiki-tema.mjs), bukan Expressive Code.
      expressiveCode: false,
      // Halaman 404 ditulis sebagai konten biasa (src/content/docs/404.md); route 404 bawaan Starlight bentrok dengannya di Astro 7.
      disable404Route: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 2 },
      credits: false,
    }),
    // Widget baru: island React + TypeScript, di-hydrate hanya di halaman yang memakainya (keputusan 116).
    react(),
  ],
  markdown: {
    // Astro 7 memakai Sätteri sebagai pemroses Markdown bawaan; plugin remark butuh pemroses unified.
    processor: unified({ remarkPlugins: [remarkRujukan, remarkAbbr], smartypants: false }), // tanda kutip tetap lurus, sama dengan situs lama
    shikiConfig: { theme: temaShiki },
  },
});
