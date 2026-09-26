import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  base: "/sql-lab/",
  plugins: [preact()],
  build: {
    chunkSizeWarningLimit: 700
  },
  optimizeDeps: {
    exclude: ["sql.js"]
  },
  server: {
    fs: {
      allow: [".."]
    }
  }
});
