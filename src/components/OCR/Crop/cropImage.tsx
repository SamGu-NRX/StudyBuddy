import { computeCanvasSize, type CropArea } from '../lib/cropMath';

const TO_RADIANS = Math.PI / 180;

export async function canvasPreview(
  image: HTMLImageElement | null | undefined,
  crop: CropArea,
  scale = 1,
  rotate = 0
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!image) {
    throw new Error('canvasPreview: image is required');
  }

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const devicePixelRatio = typeof window === 'undefined' ? undefined : window.devicePixelRatio;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  // Fall back to 1 when devicePixelRatio is unavailable so the canvas math
  // never multiplies by undefined and produces NaN dimensions.
  const pixelRatio = devicePixelRatio ?? 1;
  if (!Number.isFinite(pixelRatio) || pixelRatio <= 0) {
    throw new Error('canvasPreview: pixelRatio must be a finite number - fall back to 1 when undefined');
  }

  // Pure size math, validated: throws TypeError on invalid image/crop values.
  const size = computeCanvasSize(
    {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: image.width,
      height: image.height
    },
    crop,
    scale,
    rotate,
    pixelRatio
  );

  canvas.width = size.canvasWidth;
  canvas.height = size.canvasHeight;

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-size.cropX, -size.cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
  // const data = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);

  // set canvas width to final desired crop size - this will clear existing context
  // canvas.width = pixelCrop.width;
  // canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  // ctx.putImageData(data, 0, 0);

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('canvasPreview: canvas.toBlob returned a null blob'));
        return;
      }

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'springverify.jpg';

      link.click();

      // Revoke on a delay instead of synchronously: revoking immediately after
      // click() can cancel the download before the browser has consumed the
      // URL. The 10s grace period keeps the leak window bounded.
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10_000);

      resolve(blobUrl);
    }, 'image/jpeg');
  });
}
