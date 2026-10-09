#!/usr/bin/env node
/**
 * One-command benchmark harness for the OCR hot paths in src/components/OCR/.
 *
 *   npx -y tsx@4 src/components/OCR/__benchmarks__/run.ts --repeats=5 --scenario=all --json=ocr-bench.json
 *
 * Runs on pristine main AND after the optimization merge: the lib modules are
 * loaded with dynamic imports that fall back to null, so on a tree without
 * src/components/OCR/lib the pool-based scenarios report n/a and the run
 * exits 0. When the lib exists, legacy replica and pool variants run in the
 * same process.
 *
 * The fleet spec snippet uses literal specifiers; a string-annotated
 * specifier is used instead so TypeScript cannot statically resolve a module
 * that does not exist yet on pristine main (keeps tsc / next build type
 * checks green without touching tsconfig). Runtime semantics are identical:
 * dynamic import, caught, null when absent.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generateFixtures, type FixtureSet } from './fixtures';
import {
  runScenarios,
  SCENARIO_ORDER,
  type ScenarioName,
  type ScenarioResult,
  type PoolAdapter,
} from './scenarios';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  repeats: number;
  scenario: string;
  json: string | null;
}

function parseArgs(argv: string[]): Args {
  let repeats = 5;
  let scenario = 'all';
  let json: string | null = null;
  for (const arg of argv) {
    const eq = arg.indexOf('=');
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    const value = eq === -1 ? undefined : arg.slice(eq + 1);
    if (flag === '--repeats') {
      const n = value === undefined ? Number.NaN : Number.parseInt(value, 10);
      if (!Number.isFinite(n) || n < 1) throw new Error(`--repeats must be an integer >= 1, got: ${String(value)}`);
      repeats = n;
    } else if (flag === '--scenario') {
      if (!value) throw new Error('--scenario requires a value (all | name | name1,name2)');
      scenario = value;
    } else if (flag === '--json') {
      json = value === undefined || value === '' ? 'ocr-bench.json' : value;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return { repeats, scenario, json };
}

// ---------------------------------------------------------------------------
// optional lib discovery (must tolerate absence on pristine main)
// ---------------------------------------------------------------------------

const WORKER_MANAGER_SPEC: string = '../lib/workerManager';
const CROP_MATH_SPEC: string = '../lib/cropMath';

async function discoverLibs(): Promise<{ workerManager: unknown; cropMath: unknown }> {
  const workerManager = await import(WORKER_MANAGER_SPEC).catch(() => null);
  const cropMath = await import(CROP_MATH_SPEC).catch(() => null);
  return { workerManager, cropMath };
}

function adaptPool(mod: unknown): { pool: PoolAdapter | null; note: string } {
  if (!mod) {
    return { pool: null, note: 'n/a - pool lib not present (src/components/OCR/lib/workerManager)' };
  }
  const m = mod as Record<string, unknown>;
  if (typeof m.acquireWorker !== 'function' || typeof m.releaseWorker !== 'function') {
    return { pool: null, note: 'n/a - workerManager present but missing acquireWorker/releaseWorker' };
  }
  return {
    pool: {
      acquireWorker: (...args: unknown[]) => m.acquireWorker(...(args as [])) as Promise<unknown>,
      releaseWorker: (worker: unknown) => m.releaseWorker(worker) as Promise<unknown>,
    },
    note: '',
  };
}

function pickComputeCanvasSize(mod: unknown): { fn: ((...args: never[]) => unknown) | null; note: string } {
  if (!mod) {
    return { fn: null, note: 'n/a - crop math lib not present (src/components/OCR/lib/cropMath)' };
  }
  const fn = (mod as Record<string, unknown>).computeCanvasSize;
  if (typeof fn !== 'function') {
    return { fn: null, note: 'n/a - cropMath present but missing computeCanvasSize' };
  }
  return { fn: (fn as (...args: never[]) => unknown).bind(mod), note: '' };
}

// ---------------------------------------------------------------------------
// environment record
// ---------------------------------------------------------------------------

interface EnvInfo {
  node: string;
  platform: string;
  arch: string;
  cpuCount: number;
  tesseractVersion: string;
  loadavgBefore: [number, number, number];
  loadavgAfter: [number, number, number];
}

function tesseractVersion(repoRoot: string): string {
  const p = path.join(repoRoot, 'node_modules', 'tesseract.js', 'package.json');
  try {
    return String(JSON.parse(readFileSync(p, 'utf8')).version);
  } catch {
    return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// output
// ---------------------------------------------------------------------------

const fmt = (n: number | undefined | null): string => {
  if (n === undefined || n === null || Number.isNaN(n)) return 'n/a';
  return n >= 100 ? n.toFixed(0) : n.toFixed(2);
};

function printTable(env: EnvInfo, repeats: number, results: ScenarioResult[], poolNote: string): void {
  type Row = { scenario: string; variant: string; median: string; p25: string; p75: string; unit: string; extra: string };
  const rows: Row[] = [];
  for (const result of results) {
    for (const v of result.variants) {
      if (v.status !== 'ok' || !v.stats) {
        rows.push({ scenario: result.name, variant: v.name, median: 'n/a', p25: 'n/a', p75: 'n/a', unit: v.unit, extra: v.note ?? '' });
        continue;
      }
      const extra: string[] = [];
      if (v.perCycle !== undefined) extra.push(`per-cycle ${fmt(v.perCycle)}ms`);
      if (v.perCall) extra.push(`per-call median ${fmt(v.perCall.median)} (p25 ${fmt(v.perCall.p25)} / p75 ${fmt(v.perCall.p75)})`);
      if (v.note) extra.push(v.note);
      rows.push({
        scenario: result.name,
        variant: v.name,
        median: fmt(v.stats.median),
        p25: fmt(v.stats.p25),
        p75: fmt(v.stats.p75),
        unit: v.unit,
        extra: extra.join('; '),
      });
    }
  }

  const w = (s: string, n: number) => s.padEnd(n, ' ');
  const colWidths = [21, 25, 10, 10, 10];
  process.stdout.write('\nOCR benchmark harness - results\n');
  process.stdout.write(`node ${env.node} | ${env.platform} ${env.arch} | cpus ${env.cpuCount} | tesseract.js ${env.tesseractVersion}\n`);
  process.stdout.write(`repeats: ${repeats} (+1 warmup per scenario) | loadavg 1/5/15 before: ${env.loadavgBefore.map((x) => x.toFixed(2)).join('/')}  after: ${env.loadavgAfter.map((x) => x.toFixed(2)).join('/')}\n`);
  if (poolNote) process.stdout.write(`pool lib: ${poolNote}\n`);
  process.stdout.write('\n');
  process.stdout.write(`${w('scenario', colWidths[0])}${w('variant', colWidths[1])}${w('median', colWidths[2])}${w('p25', colWidths[3])}${w('p75', colWidths[4])}unit  notes\n`);
  process.stdout.write(`${'-'.repeat(colWidths[0])}  ${'-'.repeat(colWidths[1])}  ${'-'.repeat(colWidths[2])}  ${'-'.repeat(colWidths[3])}  ${'-'.repeat(colWidths[4])}\n`);
  for (const r of rows) {
    process.stdout.write(
      `${w(r.scenario, colWidths[0])}${w(r.variant, colWidths[1])}${w(r.median, colWidths[2])}${w(r.p25, colWidths[3])}${w(r.p75, colWidths[4])}${r.unit}${r.extra ? `  [${r.extra}]` : ''}\n`,
    );
  }
  process.stdout.write('\n');
}

function toJsonPayload(args: Args, env: EnvInfo, fixtures: FixtureSet, results: ScenarioResult[]): Record<string, unknown> {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      node: env.node,
      platform: env.platform,
      arch: env.arch,
      cpuCount: env.cpuCount,
      tesseractVersion: env.tesseractVersion,
      repeats: args.repeats,
      warmups: 1,
      scenarioOrder: SCENARIO_ORDER,
      requestedScenario: args.scenario,
      loadavgBefore: env.loadavgBefore,
      loadavgAfter: env.loadavgAfter,
      fixtures,
    },
    scenarios: results,
  };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.join(__dirname, '..', '..', '..', '..');

  const requested = args.scenario === 'all'
    ? [...SCENARIO_ORDER]
    : args.scenario.split(',').map((s) => s.trim()).filter(Boolean);
  for (const name of requested) {
    if (!SCENARIO_ORDER.includes(name as ScenarioName)) {
      process.stderr.write(`unknown scenario '${name}'. valid: ${SCENARIO_ORDER.join(', ')} or 'all'\n`);
      return 2;
    }
  }

  const loadavgBefore = os.loadavg();
  process.stdout.write(`generating fixtures in ${os.tmpdir()}...\n`);
  const fixtures = await generateFixtures();
  process.stdout.write('discovering OCR lib modules (pool/cropMath may be absent on pristine main)...\n');
  const libs = await discoverLibs();
  const { pool, note: poolNote } = adaptPool(libs.workerManager);
  const { fn: computeCanvasSize, note: cropNote } = pickComputeCanvasSize(libs.cropMath);
  process.stdout.write(`${poolNote || 'pool lib present.'}\n`);
  process.stdout.write(`${cropNote || 'crop math lib present.'}\n`);

  const results = await runScenarios(
    {
      repeats: args.repeats,
      fixtures,
      cachePath: fixtures.dir,
      pool,
      poolNote,
      computeCanvasSize,
      computeCanvasSizeNote: cropNote,
    },
    requested as ScenarioName[],
  );

  const env: EnvInfo = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cpuCount: os.cpus().length,
    tesseractVersion: tesseractVersion(repoRoot),
    loadavgBefore: [loadavgBefore[0], loadavgBefore[1], loadavgBefore[2]],
    loadavgAfter: [os.loadavg()[0], os.loadavg()[1], os.loadavg()[2]],
  };

  printTable(env, args.repeats, results, poolNote);

  if (args.json) {
    const jsonPath = path.isAbsolute(args.json) ? args.json : path.join(process.cwd(), args.json);
    const dir = path.dirname(jsonPath);
    if (dir && dir !== '.') mkdirSync(dir, { recursive: true });
    writeFileSync(jsonPath, `${JSON.stringify(toJsonPayload(args, env, fixtures, results), null, 2)}\n`);
    process.stdout.write(`json written: ${jsonPath}\n`);
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    process.stderr.write(`benchmark failed: ${String(err)}\n`);
    process.exit(1);
  });
