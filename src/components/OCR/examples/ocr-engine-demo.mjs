/**
 * Runnable mirror of the OCR engine path in src/components/OCR/OCR.tsx.
 *
 * OCR.tsx runs tesseract.js in the browser: createWorker('eng'), then
 * setParameters({ tessedit_pageseg_mode: PSM.AUTO, tessedit_ocr_engine_mode: OEM.LSTM_ONLY }),
 * then worker.recognize(<data URL>). This script exercises the same worker
 * setup in Node: it renders a known English phrase to PNG with the repo's own
 * `sharp` dependency, recognizes it with the identical worker configuration,
 * and asserts the phrase comes back.
 *
 * Environment notes (differences that do not affect the pipeline semantics):
 * - The component passes a data URL; Node accepts a file path, so we pass the
 *   PNG path directly.
 * - In Node, tesseract.js caches eng.traineddata in the process cwd
 *   (cachePath defaults to '.'). We chdir into a dedicated cache dir before
 *   creating the worker so the repo tree stays clean. createWorker('eng') is
 *   otherwise called exactly like the component.
 * - First run downloads eng.traineddata from the tessdata CDN (outbound
 *   internet required once; later runs use the cache).
 *
 * Run: node src/components/OCR/examples/ocr-engine-demo.mjs   (exit 0 = pass)
 */

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

// Resolve the repo's own dependencies from this clone's node_modules
// (no new dependencies added).
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const { createWorker, PSM, OEM } = require('tesseract.js');

const EXPECTED_PHRASE = 'StudyBuddy OCR pipeline check 1234';

// Normalize whitespace and case before comparing (tesseract adds newlines and
// may vary spacing).
const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

// --- 1. Render the sample image with the repo's `sharp` ----------------------

const renderDir = await mkdtemp(join(tmpdir(), 'studybuddy-ocr-demo-'));
const pngPath = join(renderDir, 'sample.png');

// Large, bold, black-on-white single line: high contrast keeps recognition
// stable across tesseract builds.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1900" height="300">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="70" y="185" font-family="DejaVu Sans" font-size="72" font-weight="bold" fill="#000000">${EXPECTED_PHRASE}</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(pngPath);
if (!existsSync(pngPath)) {
  throw new Error(`sharp did not produce ${pngPath}`);
}
console.log(`[1/3] rendered sample image: ${pngPath}`);

// --- 2. Same worker setup as OCR.tsx ------------------------------------------

// Keep tesseract's traineddata cache out of the repo tree (see header note).
const cacheDir = join(tmpdir(), 'studybuddy-ocr-examples-cache');
await mkdir(cacheDir, { recursive: true });
process.chdir(cacheDir);

console.log('[2/3] creating worker: createWorker("eng") then setParameters(PSM.AUTO + OEM.LSTM_ONLY), same as OCR.tsx');
// Note: tesseract.js v5 prints
//   "Attempted to set parameters that can only be set during initialization:
//    tessedit_ocr_engine_mode"
// here — the component triggers the same warning. It is harmless: v5's
// createWorker defaults to oem = OEM.LSTM_ONLY (verified in tesseract.js
// 5.1.1 src/createWorker.js), so the effective engine mode already matches
// the component's intent. PSM.AUTO does take effect via setParameters.
const worker = await createWorker('eng');
await worker.setParameters({
  tessedit_pageseg_mode: PSM.AUTO,
  tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
});

// --- 3. Recognize and assert ---------------------------------------------------

const result = await worker.recognize(pngPath);
console.log('[3/3] recognition complete. tesseract output:');
console.log('--- begin ---');
console.log(result.data.text.trim());
console.log('--- end ---');

assert.ok(
  normalize(result.data.text).includes(normalize(EXPECTED_PHRASE)),
  `expected recognized text to contain "${EXPECTED_PHRASE}", got: ${JSON.stringify(result.data.text)}`,
);
console.log(`PASS: recognized text contains "${EXPECTED_PHRASE}"`);

await worker.terminate();
await rm(renderDir, { recursive: true, force: true });
// Natural end of script exits 0; node:assert failures exit non-zero.
