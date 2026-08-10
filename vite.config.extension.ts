import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Dedicated Chrome MV3 build. Rooted at `extension/`, output to
 * `dist-extension/`. `extension/public/` (manifest.json + icons/) is copied
 * to the output root so the unpacked extension loads as-is.
 *
 * Named rollup inputs keep entry filenames stable. The MV3 background
 * service worker is emitted at a stable `background.js` (module worker) so
 * the manifest can reference it; the popup entry keeps a hashed name under
 * assets/.
 */
export default defineConfig({
  root: path.resolve(repoRoot, "extension"),
  build: {
    outDir: path.resolve(repoRoot, "dist-extension"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: path.resolve(repoRoot, "extension", "popup.html"),
        background: path.resolve(repoRoot, "extension", "src", "background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "background"
            ? "background.js"
            : "assets/[name]-[hash].js",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(repoRoot, "./src"),
    },
  },
});
