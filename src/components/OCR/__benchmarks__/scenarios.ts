/**
 * Benchmark scenarios for the OCR hot paths in src/components/OCR/.
 *
 * Every scenario that touches the (future) worker pool runs the legacy
 * pattern - an inline replica of what main's OCR.tsx does today - and, when
 * src/components/OCR/lib/workerManager exists, the pool variant in the same
 * process. On pristine main the lib imports fail, pool variants report n/a,
 * and the run still exits 0.
 */
import { performance } from 'node:perf_hooks';
import { createWorker, OEM, PSM, type Worker } from 'tesseract.js';
import type { FixtureSet } from './fixtures';

export interface Stats {
  median: number;
  p25: number;
  p75: number;
}

export interface VariantResult {
  name: string;
  status: 'ok' | 'n/a';
  unit: string;
  stats?: Stats;
  /** Per-call latency percentiles (recognize scenarios). */
  perCall?: Stats;
  /** Per-cycle figure for multi-cycle scenarios (worker-recycle). */
  perCycle?: number;
  /** Raw per-repeat samples of the primary metric. */
  values?: number[];
  note?: string;
}

export interface ScenarioResult {
  name: string;
  repeats: number;
  variants: VariantResult[];
}

export interface PoolAdapter {
  acquireWorker: (...args: unknown[]) => Promise<unknown>;
  releaseWorker: (worker: unknown) => Promise<unknown>;
}

export interface ScenarioContext {
  repeats: number;
  fixtures: FixtureSet;
  /** Where tesseract may cache eng.traineddata (fixtures tmp dir). */
  cachePath: string;
  pool: PoolAdapter | null;
  poolNote: string;
  computeCanvasSize: ((...args: never[]) => unknown) | null;
  computeCanvasSizeNote: string;
}

export const SCENARIO_ORDER = [
  'worker-init-cold',
  'worker-recycle',
  'recognize-fixed',
  'recognize-concurrent',
  'cropmath-micro',
] as const;
export type ScenarioName = (typeof SCENARIO_ORDER)[number];

// ---------------------------------------------------------------------------
// stats
// ---------------------------------------------------------------------------

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return Number.NaN;
  const idx = (sortedAsc.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
}

export function statsOf(values: number[]): Stats {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    median: percentile(sorted, 0.5),
    p25: percentile(sorted, 0.25),
    p75: percentile(sorted, 0.75),
  };
}

function medianOf(values: number[]): number {
  return statsOf(values).median;
}

// ---------------------------------------------------------------------------
// legacy worker lifecycle - replica of main's OCR.tsx
// ---------------------------------------------------------------------------

/**
 * Replica of the mount path in src/components/OCR/OCR.tsx (main):
 *   const worker = await createWorker('eng');
 *   await worker.setParameters({
 *     tessedit_pageseg_mode: PSM.AUTO,
 *     tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
 *   });
 * OEM.LSTM_ONLY is tesseract.js v5's default OEM, passed here only to reach
 * the options slot so traineddata caches under the fixtures tmp dir instead
 * of the repo tree. terminate() (the unmount path) is the caller's job.
 */
export async function legacyMountWorker(cachePath: string): Promise<Worker> {
  const worker = await createWorker('eng', OEM.LSTM_ONLY, { cachePath });
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
  });
  return worker;
}

// ---------------------------------------------------------------------------
// defensive pool adapter (workerManager lib may be absent on pristine main)
// ---------------------------------------------------------------------------

let poolAcquireSig: 'lang' | 'none' | null = null;

/** Try acquireWorker('eng') first, then acquireWorker(); remember what worked. */
export async function acquireFromPool(pool: PoolAdapter): Promise<unknown> {
  if (poolAcquireSig === null) {
    try {
      const w = await pool.acquireWorker('eng');
      poolAcquireSig = 'lang';
      return w;
    } catch {
      try {
        const w = await pool.acquireWorker();
        poolAcquireSig = 'none';
        return w;
      } catch (err) {
        throw new Error(`acquireWorker failed with ('eng') and with (): ${String(err)}`);
      }
    }
  }
  return poolAcquireSig === 'lang' ? pool.acquireWorker('eng') : pool.acquireWorker();
}

type Recognizable = { recognize: (image: string) => Promise<unknown> };

function asRecognizable(w: unknown): Recognizable {
  const cand = w as { recognize?: unknown };
  if (cand && typeof cand.recognize === 'function') {
    return { recognize: (image: string) => cand.recognize(image) as Promise<unknown> };
  }
  throw new Error('pool worker does not expose recognize()');
}

// ---------------------------------------------------------------------------
// scenarios
// ---------------------------------------------------------------------------

/** Mount + parameterize + terminate a fresh worker - what OCR.tsx pays per mount. */
export async function runWorkerInitCold(ctx: ScenarioContext): Promise<ScenarioResult> {
  const once = async (): Promise<number> => {
    const t0 = performance.now();
    const worker = await legacyMountWorker(ctx.cachePath);
    await worker.terminate();
    return performance.now() - t0;
  };
  await once(); // warmup (also fetches/caches eng.traineddata on the first ever run)
  const values: number[] = [];
  for (let i = 0; i < ctx.repeats; i += 1) values.push(await once());
  return {
    name: 'worker-init-cold',
    repeats: ctx.repeats,
    variants: [{ name: 'legacy', status: 'ok', unit: 'ms', stats: statsOf(values), values }],
  };
}

/** 5 mount/unmount cycles: legacy create+terminate per cycle vs pool acquire/release. */
export async function runWorkerRecycle(ctx: ScenarioContext): Promise<ScenarioResult> {
  const CYCLES = 5;
  const result: ScenarioResult = { name: 'worker-recycle', repeats: ctx.repeats, variants: [] };

  const legacyOnce = async (): Promise<number> => {
    const t0 = performance.now();
    for (let c = 0; c < CYCLES; c += 1) {
      const worker = await legacyMountWorker(ctx.cachePath);
      await worker.terminate();
    }
    return performance.now() - t0;
  };
  await legacyOnce(); // warmup
  const legacyTotals: number[] = [];
  for (let i = 0; i < ctx.repeats; i += 1) legacyTotals.push(await legacyOnce());
  result.variants.push({
    name: 'legacy',
    status: 'ok',
    unit: 'ms total',
    stats: statsOf(legacyTotals),
    values: legacyTotals,
    perCycle: medianOf(legacyTotals) / CYCLES,
  });

  if (!ctx.pool) {
    result.variants.push({ name: 'pool', status: 'n/a', unit: 'ms total', note: ctx.poolNote });
    return result;
  }
  const pool = ctx.pool;
  const poolOnce = async (): Promise<number> => {
    const t0 = performance.now();
    for (let c = 0; c < CYCLES; c += 1) {
      const w = await acquireFromPool(pool);
      await pool.releaseWorker(w);
    }
    return performance.now() - t0;
  };
  try {
    await poolOnce(); // warmup
    const poolTotals: number[] = [];
    for (let i = 0; i < ctx.repeats; i += 1) poolTotals.push(await poolOnce());
    result.variants.push({
      name: 'pool',
      status: 'ok',
      unit: 'ms total',
      stats: statsOf(poolTotals),
      values: poolTotals,
      perCycle: medianOf(poolTotals) / CYCLES,
    });
  } catch (err) {
    result.variants.push({
      name: 'pool',
      status: 'n/a',
      unit: 'ms total',
      note: `pool API call failed: ${String(err)}`,
    });
  }
  return result;
}

/** Same fixture 5x sequentially on a warm worker; median per-call. */
export async function runRecognizeFixed(ctx: ScenarioContext): Promise<ScenarioResult> {
  const CALLS = 5;
  const img = ctx.fixtures.textOcrPng;
  const once = async (): Promise<number[]> => {
    const worker = await legacyMountWorker(ctx.cachePath);
    try {
      await worker.recognize(img); // warm the worker on this fixture
      const calls: number[] = [];
      for (let i = 0; i < CALLS; i += 1) {
        const t0 = performance.now();
        await worker.recognize(img);
        calls.push(performance.now() - t0);
      }
      return calls;
    } finally {
      await worker.terminate();
    }
  };
  await once(); // warmup
  const perRepeatMedian: number[] = [];
  const allCalls: number[] = [];
  for (let i = 0; i < ctx.repeats; i += 1) {
    const calls = await once();
    perRepeatMedian.push(medianOf(calls));
    allCalls.push(...calls);
  }
  return {
    name: 'recognize-fixed',
    repeats: ctx.repeats,
    variants: [
      {
        name: 'legacy',
        status: 'ok',
        unit: 'ms/call',
        stats: statsOf(perRepeatMedian),
        perCall: statsOf(allCalls),
        values: perRepeatMedian,
      },
    ],
  };
}

/** 4 parallel recognize calls: legacy single shared worker vs pool sizes 1/2/4. */
export async function runRecognizeConcurrent(ctx: ScenarioContext): Promise<ScenarioResult> {
  const JOBS = 4;
  const POOL_SIZES = [1, 2, 4];
  const img = ctx.fixtures.textOcrPng;
  const result: ScenarioResult = { name: 'recognize-concurrent', repeats: ctx.repeats, variants: [] };

  type Burst = { wall: number; per: number[] };
  const legacyOnce = async (): Promise<Burst> => {
    const worker = await legacyMountWorker(ctx.cachePath);
    try {
      await worker.recognize(img); // warm
      const t0 = performance.now();
      const per = await Promise.all(
        Array.from({ length: JOBS }, async () => {
          const s = performance.now();
          await worker.recognize(img);
          return performance.now() - s;
        }),
      );
      return { wall: performance.now() - t0, per };
    } finally {
      await worker.terminate();
    }
  };

  const collect = async (once: () => Promise<Burst>) => {
    await once(); // warmup
    const walls: number[] = [];
    const allPer: number[] = [];
    for (let i = 0; i < ctx.repeats; i += 1) {
      const burst = await once();
      walls.push(burst.wall);
      allPer.push(...burst.per);
    }
    return { walls, allPer };
  };

  const legacy = await collect(legacyOnce);
  result.variants.push({
    name: 'legacy (1 shared worker)',
    status: 'ok',
    unit: 'ms wall',
    stats: statsOf(legacy.walls),
    perCall: statsOf(legacy.allPer),
    values: legacy.walls,
  });

  if (!ctx.pool) {
    for (const size of POOL_SIZES) {
      result.variants.push({
        name: `pool:${size}`,
        status: 'n/a',
        unit: 'ms wall',
        note: ctx.poolNote,
      });
    }
    return result;
  }
  const pool = ctx.pool;
  for (const size of POOL_SIZES) {
    const poolOnce = async (): Promise<Burst> => {
      const workers: unknown[] = [];
      try {
        for (let i = 0; i < size; i += 1) workers.push(await acquireFromPool(pool));
        const recognizable = workers.map((w) => asRecognizable(w));
        await Promise.all(recognizable.map((w) => w.recognize(img))); // warm
        const t0 = performance.now();
        const per = await Promise.all(
          Array.from({ length: JOBS }, async (_, j) => {
            const s = performance.now();
            await recognizable[j % size].recognize(img);
            return performance.now() - s;
          }),
        );
        return { wall: performance.now() - t0, per };
      } finally {
        for (const w of workers) await pool.releaseWorker(w);
      }
    };
    try {
      const r = await collect(poolOnce);
      result.variants.push({
        name: `pool:${size}`,
        status: 'ok',
        unit: 'ms wall',
        stats: statsOf(r.walls),
        perCall: statsOf(r.allPer),
        values: r.walls,
      });
    } catch (err) {
      result.variants.push({
        name: `pool:${size}`,
        status: 'n/a',
        unit: 'ms wall',
        note: `pool API call failed: ${String(err)}`,
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// cropmath micro
// ---------------------------------------------------------------------------

const CROP_ITERS = 1e6;
/** Fixed but non-constant-foldable params (read from a mutable module object). */
const CROP_PARAMS = {
  naturalWidth: 1200,
  naturalHeight: 900,
  displayWidth: 600,
  displayHeight: 450,
  cropWidth: 320,
  cropHeight: 240,
};

let dceSink = 0;

/**
 * Inline replica of main's crop canvas size formula in OCR.tsx getCroppedImg:
 *   const scaleX = image.naturalWidth / image.width;
 *   const scaleY = image.naturalHeight / image.height;
 *   canvas.width = crop.width; canvas.height = crop.height;
 * The sum keeps every arithmetic op observable so V8 cannot dead-code it.
 */
function inlineCanvasSizeFormula(): number {
  const scaleX = CROP_PARAMS.naturalWidth / CROP_PARAMS.displayWidth;
  const scaleY = CROP_PARAMS.naturalHeight / CROP_PARAMS.displayHeight;
  return CROP_PARAMS.cropWidth + CROP_PARAMS.cropHeight + scaleX + scaleY;
}

type ComputeSizeFn = (...args: never[]) => unknown;

/**
 * Try common calling conventions for the lib's computeCanvasSize once, and
 * return a closure that invokes ONLY the winning convention (args pre-built,
 * no probing) so the timed loop measures the lib function, not the adapter.
 * A convention wins if it returns a finite number or {width,height}.
 */
function pickComputeCanvasSizeCaller(
  fn: ComputeSizeFn,
): { caller: () => number; convention: string; errors: string[] } | { caller: null; convention: null; errors: string[] } {
  const { naturalWidth: nw, naturalHeight: nh, displayWidth: dw, displayHeight: dh, cropWidth: cw, cropHeight: ch } =
    CROP_PARAMS;
  const crop = { x: 10, y: 20, width: cw, height: ch };
  const scaleX = nw / dw;
  const scaleY = nh / dh;
  const toNumber = (r: unknown): number | null => {
    if (typeof r === 'number' && Number.isFinite(r)) return r;
    const o = r as { width?: unknown; height?: unknown } | null | undefined;
    if (o && typeof o.width === 'number' && typeof o.height === 'number') return o.width + o.height;
    return null;
  };
  const attempts: Array<{ convention: string; call: () => unknown }> = [
    { convention: 'obj:{crop,scaleX,scaleY,pixelRatio}', call: () => fn({ crop, scaleX, scaleY, pixelRatio: 1 }) },
    { convention: 'pos:(crop,scaleX,scaleY,pixelRatio)', call: () => fn(crop, scaleX, scaleY, 1) },
    { convention: 'pos:(cropW,cropH,scaleX,scaleY)', call: () => fn(cw, ch, scaleX, scaleY) },
  ];
  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      const value = toNumber(attempt.call());
      if (value !== null) {
        return { caller: () => toNumber(attempt.call()) ?? 0, convention: attempt.convention, errors };
      }
      errors.push(`${attempt.convention}: unexpected result`);
    } catch (err) {
      errors.push(`${attempt.convention}: ${String(err)}`);
    }
  }
  return { caller: null, convention: null, errors };
}

export async function runCropMathMicro(ctx: ScenarioContext): Promise<ScenarioResult> {
  const result: ScenarioResult = { name: 'cropmath-micro', repeats: ctx.repeats, variants: [] };

  const inlineOnce = (): number => {
    let acc = 0;
    const t0 = performance.now();
    for (let i = 0; i < CROP_ITERS; i += 1) acc += inlineCanvasSizeFormula();
    const elapsedMs = performance.now() - t0;
    dceSink += acc;
    return (elapsedMs * 1e6) / CROP_ITERS; // ns/op
  };
  inlineOnce(); // warmup
  const inlineValues: number[] = [];
  for (let i = 0; i < ctx.repeats; i += 1) inlineValues.push(inlineOnce());
  result.variants.push({
    name: 'inline (main replica)',
    status: 'ok',
    unit: 'ns/op',
    stats: statsOf(inlineValues),
    values: inlineValues,
  });

  if (!ctx.computeCanvasSize) {
    result.variants.push({
      name: 'lib computeCanvasSize',
      status: 'n/a',
      unit: 'ns/op',
      note: ctx.computeCanvasSizeNote,
    });
    return result;
  }
  const probe = pickComputeCanvasSizeCaller(ctx.computeCanvasSize);
  if (probe.caller === null) {
    result.variants.push({
      name: 'lib computeCanvasSize',
      status: 'n/a',
      unit: 'ns/op',
      note: `no compatible calling convention (${probe.errors.join('; ')})`,
    });
    return result;
  }
  const caller = probe.caller;
  const libOnce = (): number => {
    let acc = 0;
    const t0 = performance.now();
    for (let i = 0; i < CROP_ITERS; i += 1) acc += caller();
    const elapsedMs = performance.now() - t0;
    dceSink += acc;
    return (elapsedMs * 1e6) / CROP_ITERS; // ns/op
  };
  libOnce(); // warmup
  const libValues: number[] = [];
  for (let i = 0; i < ctx.repeats; i += 1) libValues.push(libOnce());
  result.variants.push({
    name: 'lib computeCanvasSize',
    status: 'ok',
    unit: 'ns/op',
    stats: statsOf(libValues),
    values: libValues,
    note: `convention: ${probe.convention}`,
  });
  return result;
}

// ---------------------------------------------------------------------------
// deterministic, sequential driver
// ---------------------------------------------------------------------------

export async function runScenarios(
  ctx: ScenarioContext,
  names: ScenarioName[],
): Promise<ScenarioResult[]> {
  const results: ScenarioResult[] = [];
  for (const name of SCENARIO_ORDER) {
    if (!names.includes(name)) continue;
    if (name === 'worker-init-cold') results.push(await runWorkerInitCold(ctx));
    else if (name === 'worker-recycle') results.push(await runWorkerRecycle(ctx));
    else if (name === 'recognize-fixed') results.push(await runRecognizeFixed(ctx));
    else if (name === 'recognize-concurrent') results.push(await runRecognizeConcurrent(ctx));
    else if (name === 'cropmath-micro') results.push(await runCropMathMicro(ctx));
  }
  if (results.length === 0) {
    throw new Error(`no scenarios ran; requested: ${names.join(', ')}`);
  }
  return results;
}

/** Exported so the run can prove the sink was consumed (defends against DCE claims). */
export function dceSinkValue(): number {
  return dceSink;
}
