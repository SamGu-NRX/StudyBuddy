import path from "node:path";
import { defineConfig } from "vitest/config";

// Mirrors the repo's tsconfig `paths`: "@/*" tries ./src/* first, then the repo
// root (there is no src/index.ts; `@/index` is the root index.ts).
const root = process.cwd();

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/__tests__/**/*.test.ts", "bench/**/*.test.ts"],
  },
  resolve: {
    alias: [
      { find: "@/index", replacement: path.join(root, "index.ts") },
      { find: /^@bench\/(.*)$/, replacement: path.join(root, "bench/$1") },
      { find: /^@\/(.*)$/, replacement: path.join(root, "src/$1") },
      { find: /^@$/, replacement: path.join(root, "src") },
    ],
  },
});
