import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the first entry of tsconfig paths ("@/*" -> "./src/*"), which is
      // what every module under src/app/api relies on. "@/../auth" therefore
      // resolves to the root auth.ts exactly as it does in Next.js.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/app/api/**/*.test.ts"],
  },
});
