import { defineConfig } from "tsup";

// Bundles the server (and the TypeScript-only @portfolio/shared package) into
// dist/ so production runs plain `node dist/server.js`.
export default defineConfig({
  entry: ["src/server.ts", "src/scripts/create-admin.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  noExternal: ["@portfolio/shared"],
});
