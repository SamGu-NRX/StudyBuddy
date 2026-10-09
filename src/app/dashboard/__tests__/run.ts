/**
 * Runner for the `src/app/dashboard` contract tests.
 *
 * Discovers every `*.test.ts` next to this file and loads it in one process,
 * so a single Node invocation runs the whole dashboard suite. Test files use
 * the built-in `node:test` module; a failing test fails the process, so this
 * works both locally and in CI.
 *
 * Usage (from the repository root):
 *   node --require ./src/app/dashboard/__tests__/tsnode.cjs ./src/app/dashboard/__tests__/run.ts
 */
import * as fs from "fs";
import * as path from "path";

const testDir = __dirname;

const testFiles = fs
  .readdirSync(testDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort();

if (testFiles.length === 0) {
  console.error("No dashboard contract tests found in", testDir);
  process.exitCode = 1;
} else {
  // eslint-disable-next-line no-console
  console.log(`Running ${testFiles.length} dashboard contract test file(s):`);
  for (const file of testFiles) {
    require(path.join(testDir, file));
  }
}
