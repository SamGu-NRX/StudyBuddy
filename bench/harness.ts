/**
 * Minimal benchmark harness for the `src/lib/` performance work.
 *
 * Conventions:
 *  - Benchmark cases live in `bench/cases/*.bench.ts` and register themselves
 *    with `registerCase`. Each case benchmarks the ORIGINAL implementation and
 *    the OPTIMIZED implementation side by side on the same machine, in the same
 *    process, so numbers are directly comparable.
 *  - The runner (`bench/runner.test.ts`) discovers every case file and runs
 *    them: `pnpm bench` (filter with `BENCH_ONLY=<substring>`).
 *  - Results are written to `bench/results/latest.json` and rendered with
 *    console.table. Medians are the headline statistic; p95/min/max are kept
 *    for spread.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

export type BenchUnit = "ms" | "ops";

export type BenchCase = {
  /** Unique case name, e.g. "utils/cn original". */
  name: string;
  /** Grouping label, usually the lib file, e.g. "utils.ts". */
  group: string;
  unit?: BenchUnit;
  warmup?: number;
  iterations?: number;
  /** Body timed on every iteration. */
  run: () => void | Promise<void>;
};

export type BenchResult = {
  name: string;
  group: string;
  unit: BenchUnit;
  samples: number;
  median: number;
  mean: number;
  p95: number;
  min: number;
  max: number;
  opsPerSecond: number | null;
};

const registry: BenchCase[] = [];

export function registerCase(c: BenchCase): void {
  registry.push(c);
}

export function listCases(): BenchCase[] {
  return registry.slice();
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const idx = Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function summarize(samples: number[]): Omit<BenchResult, "name" | "group" | "unit" | "opsPerSecond"> {
  const sorted = samples.slice().sort((a, b) => a - b);
  const mean = samples.reduce((acc, v) => acc + v, 0) / (samples.length || 1);
  return {
    samples: samples.length,
    median: quantile(sorted, 0.5),
    mean,
    p95: quantile(sorted, 0.95),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

export function machineLoad(): {
  loadavg1m: number;
  loadavg5m: number;
  loadavg15m: number;
  cores: number;
} {
  const [one, five, fifteen] = os.loadavg();
  return { loadavg1m: one, loadavg5m: five, loadavg15m: fifteen, cores: os.cpus().length };
}

export async function measureCase(c: BenchCase): Promise<BenchResult> {
  const warmup = c.warmup ?? 200;
  const iterations = c.iterations ?? 500;
  for (let i = 0; i < warmup; i += 1) await c.run();
  const samples: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const t0 = performance.now();
    await c.run();
    samples.push(performance.now() - t0);
  }
  const s = summarize(samples);
  const opsPerSecond = c.unit === "ops" && s.median > 0 ? 1000 / s.median : null;
  return { name: c.name, group: c.group, unit: c.unit ?? "ms", ...s, opsPerSecond };
}

export async function runAll(filter?: string): Promise<BenchResult[]> {
  const needle = (filter ?? process.env.BENCH_ONLY ?? "").toLowerCase();
  const cases = registry.filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.group.toLowerCase().includes(needle));

  const results: BenchResult[] = [];
  for (const c of cases) {
    const r = await measureCase(c);
    results.push(r);
  }

  const load = machineLoad();
  const payload = {
    capturedAt: new Date().toISOString(),
    machine: load,
    nodeVersion: process.version,
    results,
  };

  const outDir = path.join(process.cwd(), "bench", "results");
  try {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "latest.json"), `${JSON.stringify(payload, null, 2)}\n`);
  } catch {
    // Results writing is best-effort; printing matters more.
  }

  // eslint-disable-next-line no-console
  console.log(`\nMachine: loadavg(1m/5m/15m)=${load.loadavg1m}/${load.loadavg5m}/${load.loadavg15m} cores=${load.cores} node=${process.version}`);
  if (results.length > 0) {
    // eslint-disable-next-line no-console
    console.table(
      results.map((r) => ({
        name: r.name,
        group: r.group,
        unit: r.unit,
        samples: r.samples,
        median: Number(r.median.toFixed(6)),
        p95: Number(r.p95.toFixed(6)),
        "ops/s": r.opsPerSecond === null ? "" : Math.round(r.opsPerSecond),
      })),
    );
  } else {
    // eslint-disable-next-line no-console
    console.log("No benchmark cases matched. Add files under bench/cases/*.bench.ts.");
  }
  return results;
}

/**
 * Async sleep, used to simulate per-call latency of remote resources
 * (Prisma/Mongo round trips, Resend HTTP calls) without a network.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps a plain object (typically a fake Prisma client) so that every method
 * call is counted and every async method pays `latencyMs` of simulated
 * latency. `calls` records method -> invocation count, which is the primary
 * "repeated work" evidence for N+1 style findings.
 */
export function instrument<T extends Record<string, unknown>>(
  base: T,
  latencyMs = 0,
): { proxy: T; calls: Record<string, number>; reset: () => void } {
  const calls: Record<string, number> = {};
  const reset = () => {
    for (const k of Object.keys(calls)) delete calls[k];
  };
  const proxy = new Proxy(base, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        const key = String(prop);
        calls[key] = (calls[key] ?? 0) + 1;
        const out = (value as (...a: unknown[]) => unknown).apply(target, args);
        if (latencyMs > 0 && out instanceof Promise) {
          return out.then((v) => sleep(latencyMs).then(() => v));
        }
        if (latencyMs > 0) return sleep(latencyMs).then(() => out);
        return out;
      };
    },
  }) as T;
  return { proxy, calls, reset };
}
