import { defineConfig } from "vitest/config";
import path from "path";

// Test stack for StudyBuddy.
// Unit/integration tests exercise the real public interface of each module
// (server actions, Next.js route handlers, Flask-independent pure logic,
// React components). Fakes live only at true external boundaries:
//  - MongoDB (Prisma client)        -> mocked '@/lib/db'
//  - NextAuth session / auth()      -> mocked '@/../auth'
//  - Resend (paid email API)        -> mocked 'resend' / '@/lib/mail'
//  - Flask backend / OpenAI network -> mocked global fetch
//  - tesseract.js / googleapis      -> mocked modules
// No test in this suite touches the network or a real database.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    testTimeout: 20000,
  },
});
