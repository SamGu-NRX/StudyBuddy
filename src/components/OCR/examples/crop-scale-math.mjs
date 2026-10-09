/**
 * Verified mirror of the crop math in src/components/OCR/OCR.tsx (getCroppedImg).
 *
 * The component itself needs a browser canvas: it computes
 *   scaleX = image.naturalWidth / image.width
 *   scaleY = image.naturalHeight / image.height
 * sizes the canvas to crop.width x crop.height, and calls
 *   ctx.drawImage(image, crop.x*scaleX, crop.y*scaleY,
 *                 crop.width*scaleX, crop.height*scaleY,
 *                 0, 0, crop.width, crop.height).
 * This script verifies the SAME coordinate math in Node as pure functions over
 * plain numbers — no canvas, no DOM — and pins the arithmetic with assertions
 * so refactors of getCroppedImg can be checked against it.
 *
 * Run: node src/components/OCR/examples/crop-scale-math.mjs   (exit 0 = pass)
 */

import assert from 'node:assert/strict';

/**
 * Source rectangle (the sx/sy/sWidth/sHeight args passed to drawImage),
 * mirroring OCR.tsx getCroppedImg. `crop` is { x, y, width, height } in
 * DISPLAYED pixels (what ReactCrop hands the component); the natural* and
 * displayed* size args are the image's intrinsic and rendered sizes.
 */
function computeSourceRect(naturalWidth, naturalHeight, displayedWidth, displayedHeight, crop) {
  const scaleX = naturalWidth / displayedWidth;
  const scaleY = naturalHeight / displayedHeight;
  return {
    sx: crop.x * scaleX,
    sy: crop.y * scaleY,
    sWidth: crop.width * scaleX,
    sHeight: crop.height * scaleY,
  };
}

/**
 * Destination rectangle and canvas size, mirroring
 * canvas.width/height = crop.width/height and the final four drawImage args.
 */
function computeDestRect(crop) {
  return {
    dx: 0,
    dy: 0,
    dWidth: crop.width,
    dHeight: crop.height,
    canvasWidth: crop.width,
    canvasHeight: crop.height,
  };
}

// Case 1: uniform 2x downscale — natural 2000x1000 displayed at 1000x500.
{
  const crop = { x: 100, y: 50, width: 400, height: 200 };
  assert.deepStrictEqual(
    computeSourceRect(2000, 1000, 1000, 500, crop),
    { sx: 200, sy: 100, sWidth: 800, sHeight: 400 },
    '2x uniform scale should double every crop coordinate',
  );
  console.log('ok 1 — 2x uniform downscale: crop {100,50,400,200} -> source rect {200,100,800,400}');
}

// Case 2: displayed size equals natural size — no scaling, source rect === crop,
// and the canvas is sized to the crop with the image drawn at the origin.
{
  const crop = { x: 10, y: 20, width: 100, height: 50 };
  assert.deepStrictEqual(
    computeSourceRect(800, 600, 800, 600, crop),
    { sx: 10, sy: 20, sWidth: 100, sHeight: 50 },
    '1:1 display should pass the crop straight through',
  );
  assert.deepStrictEqual(computeDestRect(crop), {
    dx: 0, dy: 0, dWidth: 100, dHeight: 50, canvasWidth: 100, canvasHeight: 50,
  });
  console.log('ok 2 — no-scale case: source rect equals the crop; canvas sized to crop, drawn at (0,0)');
}

// Case 3: non-uniform scale (aspect-distorting display) — each axis scales
// independently, exactly as the component's separate scaleX/scaleY do.
{
  const crop = { x: 50, y: 40, width: 200, height: 100 };
  assert.deepStrictEqual(
    computeSourceRect(3000, 750, 1000, 500, crop),
    { sx: 150, sy: 60, sWidth: 600, sHeight: 150 },
    'non-uniform scale should apply scaleX=3 and scaleY=1.5 independently',
  );
  console.log('ok 3 — non-uniform scale: scaleX=3, scaleY=1.5 applied independently per axis');
}

// Case 4 (degenerate): zero-size display divides by zero. The component has no
// guard for this (a rendered <img> normally always has a positive width), and
// this mirror does not add one — we pin the raw arithmetic: the affected axes
// become non-finite, and a browser drawImage call with non-finite args would
// fail. Documented behavior of the math, not a fix.
{
  const src = computeSourceRect(2000, 1000, 0, 500, { x: 100, y: 50, width: 400, height: 200 });
  assert.ok(
    !Number.isFinite(src.sx) && !Number.isFinite(src.sWidth),
    'zero display width should make x-axis source coordinates non-finite (÷0 propagates)',
  );
  assert.ok(
    Number.isFinite(src.sy) && Number.isFinite(src.sHeight),
    'y-axis keeps its own scale and stays finite',
  );
  console.log('ok 4 — zero-size display: division by zero propagates on the affected axis (component behavior, pinned)');
}

console.log('PASS: crop-scale-math.mjs — all crop-math assertions held');
