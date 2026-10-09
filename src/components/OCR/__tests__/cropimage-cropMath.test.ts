import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computeCanvasSize } from '../lib/cropMath';

const validImage = { naturalWidth: 800, naturalHeight: 600, width: 400, height: 300 };
const validCrop = { x: 10, y: 10, width: 100, height: 50 };

type ImageInput = typeof validImage;
type CropInput = typeof validCrop;

function badImage(patch: Partial<ImageInput>): ImageInput {
  return { ...validImage, ...patch };
}

function badCrop(patch: Partial<CropInput>): CropInput {
  return { ...validCrop, ...patch };
}

function expectTypeError(run: () => unknown, param: string): void {
  assert.throws(
    run,
    (error: Error) => error instanceof TypeError && error.message.includes(param),
    `expected a TypeError mentioning "${param}"`
  );
}

test('golden values: 800x600 natural shown at 400x300 (default pixelRatio 1)', () => {
  const size = computeCanvasSize(validImage, validCrop);

  assert.equal(size.scaleX, 2);
  assert.equal(size.scaleY, 2);
  assert.equal(size.canvasWidth, 200); // Math.floor(100 * 2 * 1)
  assert.equal(size.canvasHeight, 100); // Math.floor(50 * 2 * 1)
  assert.equal(size.cropX, 20);
  assert.equal(size.cropY, 20);
});

test('golden values: pixelRatio 2 doubles the device-pixel canvas; CSS display size stays 200x100', () => {
  const size = computeCanvasSize(validImage, validCrop, undefined, undefined, 2);

  assert.equal(size.canvasWidth, 400); // Math.floor(100 * 2 * 2)
  assert.equal(size.canvasHeight, 200); // Math.floor(50 * 2 * 2)
  // On-screen size (canvas.width / pixelRatio) stays 200x100.
  assert.equal(size.canvasWidth / 2, 200);
  assert.equal(size.canvasHeight / 2, 100);
  assert.equal(size.cropX, 20);
  assert.equal(size.cropY, 20);
});

test('property sweep: valid inputs yield finite positive integer canvas dims and stable ratios', () => {
  const naturalSizes: Array<Pick<ImageInput, 'naturalWidth' | 'naturalHeight'>> = [
    { naturalWidth: 800, naturalHeight: 600 },
    { naturalWidth: 1237, naturalHeight: 941 },
    { naturalWidth: 4032, naturalHeight: 3024 }
  ];
  const displaySizes: Array<Pick<ImageInput, 'width' | 'height'>> = [
    { width: 400, height: 300 },
    { width: 655, height: 401 },
    { width: 1024, height: 768 }
  ];
  const crops: CropInput[] = [
    { x: 0, y: 0, width: 100, height: 100 },
    { x: 10, y: 25, width: 250, height: 75 },
    { x: 33, y: 0, width: 61, height: 47 }
  ];
  const scales: Array<number | undefined> = [undefined, 1, 1.5, 3];
  const rotations: Array<number | undefined> = [undefined, 0, 90, -45];
  const ratios: Array<number | undefined> = [undefined, 1, 2, 2.5];

  let cases = 0;

  for (const natural of naturalSizes) {
    for (const display of displaySizes) {
      const image: ImageInput = { ...natural, ...display };
      for (const crop of crops) {
        for (const scale of scales) {
          for (const rotate of rotations) {
            for (const pixelRatio of ratios) {
              const size = computeCanvasSize(image, crop, scale, rotate, pixelRatio);
              const ratio = pixelRatio ?? 1;

              assert.equal(size.scaleX, image.naturalWidth / image.width);
              assert.equal(size.scaleY, image.naturalHeight / image.height);
              assert.equal(size.canvasWidth, Math.floor(crop.width * size.scaleX * ratio));
              assert.equal(size.canvasHeight, Math.floor(crop.height * size.scaleY * ratio));
              assert.equal(size.cropX, crop.x * size.scaleX);
              assert.equal(size.cropY, crop.y * size.scaleY);
              assert.ok(Number.isFinite(size.canvasWidth));
              assert.ok(Number.isInteger(size.canvasWidth));
              assert.ok(size.canvasWidth > 0);
              assert.ok(Number.isFinite(size.canvasHeight));
              assert.ok(Number.isInteger(size.canvasHeight));
              assert.ok(size.canvasHeight > 0);

              cases += 1;
            }
          }
        }
      }
    }
  }

  assert.ok(cases >= 3 * 3 * 3 * 4 * 4 * 4);
});

test('invalid image fields throw TypeError naming the parameter', () => {
  expectTypeError(() => computeCanvasSize(badImage({ naturalWidth: Number.NaN }), validCrop), 'naturalWidth');
  expectTypeError(
    () => computeCanvasSize(badImage({ naturalHeight: undefined as unknown as number }), validCrop),
    'naturalHeight'
  );
  expectTypeError(() => computeCanvasSize(badImage({ width: 0 }), validCrop), 'width');
  expectTypeError(() => computeCanvasSize(badImage({ height: -5 }), validCrop), 'height');
});

test('invalid crop fields throw TypeError naming the parameter', () => {
  expectTypeError(() => computeCanvasSize(validImage, badCrop({ x: Number.NaN })), 'crop.x');
  expectTypeError(() => computeCanvasSize(validImage, badCrop({ y: Number.POSITIVE_INFINITY })), 'crop.y');
  expectTypeError(() => computeCanvasSize(validImage, badCrop({ width: 0 })), 'crop.width');
  expectTypeError(() => computeCanvasSize(validImage, badCrop({ height: -10 })), 'crop.height');
});

test('invalid scale/rotate/pixelRatio throw TypeError naming the parameter', () => {
  expectTypeError(() => computeCanvasSize(validImage, validCrop, 0), 'scale');
  expectTypeError(() => computeCanvasSize(validImage, validCrop, -1), 'scale');
  expectTypeError(() => computeCanvasSize(validImage, validCrop, Number.NaN), 'scale');
  expectTypeError(() => computeCanvasSize(validImage, validCrop, 1, Number.NaN), 'rotate');
  expectTypeError(() => computeCanvasSize(validImage, validCrop, undefined, undefined, 0), 'pixelRatio');
  expectTypeError(() => computeCanvasSize(validImage, validCrop, undefined, undefined, -2), 'pixelRatio');
  expectTypeError(
    () => computeCanvasSize(validImage, validCrop, undefined, undefined, Number.POSITIVE_INFINITY),
    'pixelRatio'
  );
  expectTypeError(() => computeCanvasSize(validImage, validCrop, undefined, undefined, Number.NaN), 'pixelRatio');
});

test('omitted optional args are accepted and defaulted', () => {
  assert.doesNotThrow(() => computeCanvasSize(validImage, validCrop));
  const size = computeCanvasSize(validImage, validCrop, undefined, undefined, undefined);
  assert.equal(size.canvasWidth, 200);
  assert.equal(size.canvasHeight, 100);
});
