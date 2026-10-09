import path from "node:path";
import { defineConfig } from "vitest/config";

const root = process.cwd();

/**
 * Mirrors the tsconfig.json "paths" mapping for "@/..." so tests resolve the
 * same modules the app does:
 *   "@/../auth" -> <repo root>/auth.ts   (the NextAuth entry; tsconfig falls
 *                                         back to its "./*" mapping)
 *   "@/index"   -> <repo root>/index.ts  (route constants; same fallback)
 *   "@/lib/db"  -> <repo root>/src/lib/db.ts
 */
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/\.\.\/(.+)$/, replacement: path.join(root, "$1") },
      { find: /^@\/index$/, replacement: path.join(root, "index.ts") },
      { find: /^@\/(.+)$/, replacement: path.join(root, "src", "$1") },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
