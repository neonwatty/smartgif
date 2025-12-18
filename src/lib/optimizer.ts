import type { Frame } from '../types';
import { encodeGifFast, scaleFramesFast, reduceFrameRateFast } from './gifEncoderFast';

export interface OptimizeOptions {
  targetSizeKB: number;
  originalWidth: number;
  originalHeight: number;
  originalFps: number;
}

export interface OptimizeResult {
  data: Uint8Array;
  sizeKB: number;
  scale: number;
  colors: number;
  fps: number;
  width: number;
  height: number;
}

export interface OptimizeProgress {
  attempt: number;
  totalAttempts: number;
  scale: number;
  colors: number;
  sizeKB: number;
  message: string;
}

// Parameter search space - ordered from highest to lowest quality
const SCALES = [1.0, 0.75, 0.5, 0.375, 0.25];
const COLOR_COUNTS = [256, 128, 64, 32];
const FPS_OPTIONS = [null, 15, 10, 8]; // null = keep original

export async function optimizeForTargetSize(
  frames: Frame[],
  options: OptimizeOptions,
  onProgress?: (progress: OptimizeProgress) => void
): Promise<OptimizeResult | null> {
  const { targetSizeKB, originalWidth, originalHeight, originalFps } = options;
  const targetBytes = targetSizeKB * 1024;

  let attempt = 0;
  const totalAttempts = SCALES.length * COLOR_COUNTS.length;

  // Try combinations, prioritizing quality (larger scale, more colors)
  for (const scale of SCALES) {
    for (const colors of COLOR_COUNTS) {
      attempt++;

      const targetWidth = Math.round(originalWidth * scale);
      const targetHeight = Math.round(originalHeight * scale);

      // Skip if dimensions are too small
      if (targetWidth < 50 || targetHeight < 50) continue;

      onProgress?.({
        attempt,
        totalAttempts,
        scale,
        colors,
        sizeKB: 0,
        message: `Trying ${targetWidth}x${targetHeight} with ${colors} colors...`,
      });

      // Scale frames using fast scaler
      const scaledFrames = await scaleFramesFast(frames, targetWidth, targetHeight);

      // Encode using fast encoder (global palette)
      const data = await encodeGifFast(scaledFrames, {
        width: targetWidth,
        height: targetHeight,
        colors,
      });

      const sizeKB = Math.round(data.length / 1024);

      onProgress?.({
        attempt,
        totalAttempts,
        scale,
        colors,
        sizeKB,
        message: `Result: ${sizeKB}KB (target: ${targetSizeKB}KB)`,
      });

      if (data.length <= targetBytes) {
        // Found a valid result
        const result: OptimizeResult = {
          data,
          sizeKB,
          scale,
          colors,
          fps: originalFps,
          width: targetWidth,
          height: targetHeight,
        };

        // Found a valid result - return immediately (we tried high quality first)
        return result;
      }
    }
  }

  // If still no result, try reducing FPS as well
  for (const fpsOption of FPS_OPTIONS) {
      if (fpsOption === null) continue;

      let workingFrames = frames;
      if (fpsOption < originalFps) {
        workingFrames = reduceFrameRateFast(frames, fpsOption, originalFps);
      }

      for (const scale of SCALES) {
        for (const colors of COLOR_COUNTS) {
          attempt++;

          const targetWidth = Math.round(originalWidth * scale);
          const targetHeight = Math.round(originalHeight * scale);

          if (targetWidth < 50 || targetHeight < 50) continue;

          const scaledFrames = await scaleFramesFast(workingFrames, targetWidth, targetHeight);

          const data = await encodeGifFast(scaledFrames, {
            width: targetWidth,
            height: targetHeight,
            colors,
          });

          const sizeKB = Math.round(data.length / 1024);

          onProgress?.({
            attempt,
            totalAttempts: attempt + 10,
            scale,
            colors,
            sizeKB,
            message: `Trying ${fpsOption}fps, ${targetWidth}x${targetHeight}, ${colors} colors: ${sizeKB}KB`,
          });

          if (data.length <= targetBytes) {
            return {
              data,
              sizeKB,
              scale,
              colors,
              fps: fpsOption,
              width: targetWidth,
              height: targetHeight,
            };
          }
        }
      }
  }

  // Could not find settings to meet target size
  return null;
}

export async function encodeWithSettings(
  frames: Frame[],
  settings: {
    width: number;
    height: number;
    colors: number;
    fps?: number;
    originalFps?: number;
  },
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  let workingFrames = frames;

  // Reduce FPS if needed
  if (settings.fps && settings.originalFps && settings.fps < settings.originalFps) {
    workingFrames = reduceFrameRateFast(frames, settings.fps, settings.originalFps);
  }

  // Scale frames
  if (
    settings.width !== frames[0]?.imageData.width ||
    settings.height !== frames[0]?.imageData.height
  ) {
    workingFrames = await scaleFramesFast(workingFrames, settings.width, settings.height);
  }

  // Encode with fast encoder
  return encodeGifFast(workingFrames, {
    width: settings.width,
    height: settings.height,
    colors: settings.colors,
  }, onProgress);
}
