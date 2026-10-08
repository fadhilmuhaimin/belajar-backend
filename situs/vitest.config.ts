// Vitest untuk logika widget murni (.ts tanpa DOM) di src/ (keputusan 116).
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
