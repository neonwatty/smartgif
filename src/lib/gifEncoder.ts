import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { Frame } from '../types';

export interface EncodeOptions {
  width: number;
  height: number;
  colors?: number;
  dithering?: 'none' | 'ordered' | 'floyd-steinberg';
  loop?: number;
}

export async function encodeGif(
  frames: Frame[],
  options: EncodeOptions,
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  const { width, height, colors = 256, loop = 0 } = options;

  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const { data } = frame.imageData;

    // Quantize to get palette
    const palette = quantize(data, colors);

    // Apply palette to get indexed pixels
    const index = applyPalette(data, palette);

    // Add frame
    gif.writeFrame(index, width, height, {
      palette,
      delay: frame.delay,
      repeat: loop,
    });

    if (onProgress) {
      onProgress(((i + 1) / frames.length) * 100);
    }

    // Yield to keep UI responsive
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  gif.finish();

  return gif.bytes();
}

export function scaleFrames(
  frames: Frame[],
  targetWidth: number,
  targetHeight: number
): Frame[] {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  return frames.map(frame => {
    // Create temporary canvas with original frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frame.imageData.width;
    tempCanvas.height = frame.imageData.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(frame.imageData, 0, 0);

    // Scale to target size
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

    return {
      imageData: ctx.getImageData(0, 0, targetWidth, targetHeight),
      delay: frame.delay,
    };
  });
}

export function reduceFrameRate(frames: Frame[], targetFps: number, originalFps: number): Frame[] {
  if (targetFps >= originalFps) return frames;

  const keepEvery = Math.ceil(originalFps / targetFps);
  const result: Frame[] = [];

  for (let i = 0; i < frames.length; i += keepEvery) {
    const frame = frames[i];
    // Adjust delay to compensate for dropped frames
    result.push({
      ...frame,
      delay: frame.delay * keepEvery,
    });
  }

  return result;
}
