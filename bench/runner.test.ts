import { expect, it } from "vitest";
import { runAll } from "./harness";

// Discovers every benchmark case under bench/cases/. Filter with BENCH_ONLY.
// `import.meta.glob` is provided by vite (which vitest runs on); typed locally
// so `tsc --noEmit` stays clean without pulling vite client types.
type Glob = (pattern: string, options: { eager: boolean }) => Record<string, unknown>;
const glob = (import.meta as ImportMeta & { glob?: Glob }).glob;
const caseModules: Record<string, unknown> = glob ? glob("./cases/*.bench.ts", { eager: true }) : {};
void caseModules;

it(
  "runs the src/lib benchmark suite",
  async () => {
    const results = await runAll();
    expect(Array.isArray(results)).toBe(true);
  },
  900_000,
);
