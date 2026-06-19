import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set base to '/REPO_NAME/' if deploying to GitHub Pages project site.
// Leave as '/' for Vercel or a custom domain / user-page GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: "Izer-SignatureApp",
  build: {
    target: "es2018",
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
});
