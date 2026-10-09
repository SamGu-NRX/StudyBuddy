/**
 * Test bootstrap for `src/app/dashboard` contract tests.
 *
 * Loads TypeScript through ts-node (already a devDependency — no new packages)
 * and teaches Node the `@/*` path alias from tsconfig.json, so tests can import
 * page modules and dashboard modules directly.
 *
 * Usage (from the repository root):
 *   node --require ./src/app/dashboard/__tests__/tsnode.cjs ./src/app/dashboard/__tests__/run.ts
 */
"use strict";

const path = require("path");
const Module = require("module");

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const srcRoot = path.join(repoRoot, "src");
let lastError = new Error("module not found");

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
    jsx: "react-jsx",
    target: "es2019",
    esModuleInterop: true,
  },
});

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    const withoutPrefix = request.slice(2);
    // tsconfig paths: "@/*": ["./src/*", "./*"] — try both, in order.
    for (const base of [srcRoot, repoRoot]) {
      const candidate = path.join(base, withoutPrefix);
      try {
        return originalResolve.call(this, candidate, ...rest);
      } catch (error) {
        if (error.code !== "MODULE_NOT_FOUND") {
          throw error;
        }
        lastError = error;
      }
    }
    throw lastError;
  }
  return originalResolve.call(this, request, ...rest);
};
