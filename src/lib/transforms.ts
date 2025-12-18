/**
 * Image transformation utilities for GIF processing
 * Handles rotate, flip, crop, and resize operations
 */

import type { Frame } from '../types';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FlipDirection = 'horizontal' | 'vertical' | 'both';
export type RotateAngle = 0 | 90 | 180 | 270;

/**
 * Crop an ImageData to the specified rectangle
 */
export function cropImageData(imageData: ImageData, rect: CropRect): ImageData {
  const { x, y, width, height } = rect;
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  const croppedData = ctx.getImageData(x, y, width, height);
  return croppedData;
}

/**
 * Crop all frames to the specified rectangle
 */
export function cropFrames(frames: Frame[], rect: CropRect): Frame[] {
  return frames.map(frame => ({
    imageData: cropImageData(frame.imageData, rect),
    delay: frame.delay,
  }));
}

/**
 * Flip an ImageData horizontally, vertically, or both
 */
export function flipImageData(imageData: ImageData, direction: FlipDirection): ImageData {
  const { width, height } = imageData;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Put original image
  ctx.putImageData(imageData, 0, 0);

  // Create temp canvas to hold original
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(canvas, 0, 0);

  // Clear and apply transform
  ctx.clearRect(0, 0, width, height);

  if (direction === 'horizontal' || direction === 'both') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  if (direction === 'vertical' || direction === 'both') {
    ctx.translate(0, height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(tempCanvas, 0, 0);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Flip all frames
 */
export function flipFrames(frames: Frame[], direction: FlipDirection): Frame[] {
  return frames.map(frame => ({
    imageData: flipImageData(frame.imageData, direction),
    delay: frame.delay,
  }));
}

/**
 * Rotate an ImageData by 90, 180, or 270 degrees
 */
export function rotateImageData(imageData: ImageData, angle: RotateAngle): ImageData {
  if (angle === 0) return imageData;

  const { width, height } = imageData;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set canvas size based on rotation
  if (angle === 90 || angle === 270) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // Create temp canvas with original
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Apply rotation
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(tempCanvas, -width / 2, -height / 2);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Rotate an ImageData by arbitrary angle (slower, uses interpolation)
 */
export function rotateImageDataArbitrary(imageData: ImageData, degrees: number): ImageData {
  const { width, height } = imageData;
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  // Calculate new dimensions
  const newWidth = Math.ceil(Math.abs(width * cos) + Math.abs(height * sin));
  const newHeight = Math.ceil(Math.abs(width * sin) + Math.abs(height * cos));

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;

  // Create temp canvas with original
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Apply rotation around center
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(tempCanvas, -width / 2, -height / 2);

  return ctx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Rotate all frames by 90-degree increments
 */
export function rotateFrames(frames: Frame[], angle: RotateAngle): Frame[] {
  return frames.map(frame => ({
    imageData: rotateImageData(frame.imageData, angle),
    delay: frame.delay,
  }));
}

/**
 * Resize an ImageData to new dimensions
 */
export async function resizeImageData(
  imageData: ImageData,
  newWidth: number,
  newHeight: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  // Use createImageBitmap for better quality scaling
  const bitmap = await createImageBitmap(canvas, {
    resizeWidth: newWidth,
    resizeHeight: newHeight,
    resizeQuality: quality,
  });

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = newWidth;
  resultCanvas.height = newHeight;
  const resultCtx = resultCanvas.getContext('2d')!;
  resultCtx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return resultCtx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Resize all frames
 */
export async function resizeFrames(
  frames: Frame[],
  newWidth: number,
  newHeight: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<Frame[]> {
  const result: Frame[] = [];

  for (const frame of frames) {
    const resizedData = await resizeImageData(frame.imageData, newWidth, newHeight, quality);
    result.push({
      imageData: resizedData,
      delay: frame.delay,
    });
  }

  return result;
}

/**
 * Auto-crop to remove transparent edges
 */
export function autoCrop(imageData: ImageData, threshold = 0): CropRect {
  const { width, height, data } = imageData;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > threshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // Handle fully transparent image
  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width, height };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Calculate aspect ratio presets
 */
export function getAspectRatioRect(
  width: number,
  height: number,
  aspectRatio: number,
  centered = true
): CropRect {
  let cropWidth: number;
  let cropHeight: number;

  const currentRatio = width / height;

  if (currentRatio > aspectRatio) {
    // Image is wider than target ratio, crop width
    cropHeight = height;
    cropWidth = Math.round(height * aspectRatio);
  } else {
    // Image is taller than target ratio, crop height
    cropWidth = width;
    cropHeight = Math.round(width / aspectRatio);
  }

  const x = centered ? Math.round((width - cropWidth) / 2) : 0;
  const y = centered ? Math.round((height - cropHeight) / 2) : 0;

  return { x, y, width: cropWidth, height: cropHeight };
}

/**
 * Common aspect ratio presets
 */
export const ASPECT_RATIOS = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '3:2': 3 / 2,
  '2:1': 2,
  '9:16': 9 / 16, // Vertical video
  'golden': 1.618,
} as const;
