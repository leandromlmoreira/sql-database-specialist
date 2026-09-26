import { defineConfig } from "vite";

export default defineConfig({
  base: "/sql-database-specialist/",
  optimizeDeps: {
    exclude: ["sql.js"]
  }
});
