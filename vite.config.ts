import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Default base path targets the GitHub Pages deployment at
// kiki-group/ai-sim-research-demo. Override with VITE_BASE for other hosts.
export default defineConfig({
  base: process.env.VITE_BASE || "/ai-sim-research-demo/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
