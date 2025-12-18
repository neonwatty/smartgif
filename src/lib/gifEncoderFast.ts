import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { Frame } from '../types';

export interface FastEncodeOptions {
  width: number;
  height: number;
  colors?: number;
  loop?: number;
}

/**
 * Fast GIF encoding using a global palette computed from sampled frames.
 * This is much faster than per-frame quantization.
 */
export async function encodeGifFast(
  frames: Frame[],
  options: FastEncodeOptions,
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  const { width, height, colors = 256, loop = 0 } = options;

  // Step 1: Build global palette from sampled frames (10% of frames, min 3)
  const sampleCount = Math.max(3, Math.ceil(frames.length * 0.1));
  const sampleInterval = Math.floor(frames.length / sampleCount);

  // Collect sampled pixel data
  const sampledPixels: number[] = [];
  const pixelsPerSample = Math.min(10000, width * height); // Sample up to 10k pixels per frame
  const pixelStride = Math.max(1, Math.floor((width * height) / pixelsPerSample));

  for (let i = 0; i < frames.length; i += sampleInterval) {
    const { data } = frames[i].imageData;
    for (let j = 0; j < data.length; j += pixelStride * 4) {
      sampledPixels.push(data[j], data[j + 1], data[j + 2], data[j + 3]);
    }
  }

  // Quantize sampled pixels to get global palette
  const sampledData = new Uint8ClampedArray(sampledPixels);
  const globalPalette = quantize(sampledData, colors);

  onProgress?.(5);

  // Step 2: Encode frames using global palette
  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const { data } = frame.imageData;

    // Apply global palette (no per-frame quantization needed!)
    const index = applyPalette(data, globalPalette);

    // Write frame
    gif.writeFrame(index, width, height, {
      palette: globalPalette,
      delay: frame.delay,
      repeat: i === 0 ? loop : undefined,
    });

    // Report progress
    const percent = 5 + ((i + 1) / frames.length) * 95;
    onProgress?.(percent);

    // Yield every 5 frames to keep UI responsive
    if (i % 5 === 0) {
      await yieldToMain();
    }
  }

  gif.finish();
  return gif.bytes();
}

/**
 * Scale frames using createImageBitmap for better performance
 */
export async function scaleFramesFast(
  frames: Frame[],
  targetWidth: number,
  targetHeight: number,
  onProgress?: (percent: number) => void
): Promise<Frame[]> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const result: Frame[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    // Create ImageData canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frame.imageData.width;
    tempCanvas.height = frame.imageData.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(frame.imageData, 0, 0);

    // Use createImageBitmap for faster scaling
    const bitmap = await createImageBitmap(tempCanvas, {
      resizeWidth: targetWidth,
      resizeHeight: targetHeight,
      resizeQuality: 'medium', // 'low' | 'medium' | 'high'
    });

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    result.push({
      imageData: ctx.getImageData(0, 0, targetWidth, targetHeight),
      delay: frame.delay,
    });

    onProgress?.(((i + 1) / frames.length) * 100);

    // Yield every 3 frames
    if (i % 3 === 0) {
      await yieldToMain();
    }
  }

  return result;
}

/**
 * Reduce frame rate by skipping frames
 */
export function reduceFrameRateFast(
  frames: Frame[],
  targetFps: number,
  originalFps: number
): Frame[] {
  if (targetFps >= originalFps) return frames;

  const ratio = originalFps / targetFps;
  const result: Frame[] = [];
  let accumulator = 0;

  for (let i = 0; i < frames.length; i++) {
    accumulator += 1;
    if (accumulator >= ratio) {
      accumulator -= ratio;
      const frame = frames[i];
      result.push({
        ...frame,
        delay: Math.round(1000 / targetFps),
      });
    }
  }

  return result;
}

/**
 * Yield to main thread to keep UI responsive
 */
function yieldToMain(): Promise<void> {
  return new Promise(resolve => {
    if ('scheduler' in globalThis && 'yield' in (globalThis as any).scheduler) {
      (globalThis as any).scheduler.yield().then(resolve);
    } else {
      setTimeout(resolve, 0);
    }
  });
}
