import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API = process.env.VITE_API_PROXY ?? "http://localhost:4000";

// The dev server proxies the API so the browser sees one origin
// (localhost:5173). That keeps the session cookie first-party.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Private admin tool: one ~200 KB (gzip) app chunk is fine; the rich-text
  // editor is split out and loaded only when a blog post is opened.
  build: { chunkSizeWarningLimit: 800 },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: API, changeOrigin: false },
      "/uploads": { target: API, changeOrigin: false },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      "/api": { target: API, changeOrigin: false },
      "/uploads": { target: API, changeOrigin: false },
    },
  },
});
