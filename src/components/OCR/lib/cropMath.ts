/**
 * Pure size math for the OCR crop preview.
 *
 * Extracted from Crop/cropImage.tsx so the formulas can be unit-tested
 * without a DOM. The formulas are kept exactly as they were inlined in
 * canvasPreview (scaleX = naturalWidth / width, canvasWidth =
 * Math.floor(crop.width * scaleX * pixelRatio), cropX = crop.x * scaleX, ...).
 */

export interface CropSourceImage {
  /** Intrinsic pixel width of the source image. */
  naturalWidth: number;
  /** Intrinsic pixel height of the source image. */
  naturalHeight: number;
  /** Display width the crop coordinates are expressed against. */
  width: number;
  /** Display height the crop coordinates are expressed against. */
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputedCanvasSize {
  canvasWidth: number;
  canvasHeight: number;
  scaleX: number;
  scaleY: number;
  cropX: number;
  cropY: number;
}

function requireFiniteNumber(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`computeCanvasSize: ${name} must be a finite number, got ${String(value)}`);
  }
}

function requirePositiveNumber(value: number, name: string): void {
  requireFiniteNumber(value, name);
  if (value <= 0) {
    throw new TypeError(`computeCanvasSize: ${name} must be a positive number, got ${String(value)}`);
  }
}

export function computeCanvasSize(
  i: CropSourceImage,
  crop: CropArea,
  scale?: number,
  rotate?: number,
  pixelRatio?: number
): ComputedCanvasSize {
  requireFiniteNumber(i.naturalWidth, 'naturalWidth');
  requireFiniteNumber(i.naturalHeight, 'naturalHeight');
  requirePositiveNumber(i.width, 'width');
  requirePositiveNumber(i.height, 'height');

  requireFiniteNumber(crop.x, 'crop.x');
  requireFiniteNumber(crop.y, 'crop.y');
  requirePositiveNumber(crop.width, 'crop.width');
  requirePositiveNumber(crop.height, 'crop.height');

  // scale defaults to 1 when omitted (same default as canvasPreview).
  if (scale !== undefined) {
    requirePositiveNumber(scale, 'scale');
  }
  // rotate only feeds the canvas rotation transform, not the size math.
  if (rotate !== undefined) {
    requireFiniteNumber(rotate, 'rotate');
  }

  // pixelRatio defaults to 1 when omitted.
  const ratio = pixelRatio === undefined ? 1 : pixelRatio;
  requirePositiveNumber(ratio, 'pixelRatio');

  const scaleX = i.naturalWidth / i.width;
  const scaleY = i.naturalHeight / i.height;
  const canvasWidth = Math.floor(crop.width * scaleX * ratio);
  const canvasHeight = Math.floor(crop.height * scaleY * ratio);
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  return { canvasWidth, canvasHeight, scaleX, scaleY, cropX, cropY };
}
