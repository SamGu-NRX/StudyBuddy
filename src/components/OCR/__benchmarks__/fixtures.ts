/**
 * Deterministic benchmark fixtures for the OCR hot paths, generated with sharp
 * into os.tmpdir() (never into the repo tree).
 *
 * - text-ocr.png: SVG-composited text rasterizes into real glyphs via librsvg,
 *   so tesseract genuinely recognizes it.
 * - noise-2400x1600.jpg: seeded-PRNG RGB noise (deterministic given the same
 *   sharp version) - a worst-case decode workload.
 * - tiny-1px.png: minimal image, lower bound of the recognize pipeline.
 */
import { mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

export interface FixtureSet {
  dir: string;
  /** 600x300 white background with black text 'STUDYBUDDY OCR BENCH 7384'. */
  textOcrPng: string;
  /** 2400x1600 deterministic seeded noise JPEG. */
  noiseJpg: string;
  /** 1x1 PNG. */
  tinyPng: string;
}

const NOISE_WIDTH = 2400;
const NOISE_HEIGHT = 1600;
const NOISE_SEED = 0x7384;

/** mulberry32 - tiny deterministic PRNG so the noise fixture is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function generateFixtures(): Promise<FixtureSet> {
  const dir = path.join(os.tmpdir(), 'ocr-bench-fixtures');
  await mkdir(dir, { recursive: true });

  const textOcrPng = path.join(dir, 'text-ocr.png');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300">` +
    `<rect width="600" height="300" fill="#ffffff"/>` +
    `<text x="300" y="150" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" ` +
    `font-size="48" font-weight="bold" fill="#000000" text-anchor="middle" ` +
    `letter-spacing="2">STUDYBUDDY OCR BENCH 7384</text>` +
    `</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(textOcrPng);

  const noiseJpg = path.join(dir, 'noise-2400x1600.jpg');
  const rand = mulberry32(NOISE_SEED);
  const raw = Buffer.alloc(NOISE_WIDTH * NOISE_HEIGHT * 3);
  for (let i = 0; i < raw.length; i += 1) {
    raw[i] = Math.floor(rand() * 256);
  }
  await sharp(raw, { raw: { width: NOISE_WIDTH, height: NOISE_HEIGHT, channels: 3 } })
    .jpeg({ quality: 80 })
    .toFile(noiseJpg);

  const tinyPng = path.join(dir, 'tiny-1px.png');
  await sharp({
    create: { width: 1, height: 1, channels: 3, background: { r: 32, g: 32, b: 32 } },
  })
    .png()
    .toFile(tinyPng);

  return { dir, textOcrPng, noiseJpg, tinyPng };
}
