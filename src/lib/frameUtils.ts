/**
 * Frame manipulation utilities for GIF processing
 * Handles frame reordering, speed adjustment, reversing, etc.
 */

import type { Frame } from '../types';

/**
 * Reverse the order of frames
 */
export function reverseFrames(frames: Frame[]): Frame[] {
  return [...frames].reverse();
}

/**
 * Create ping-pong (boomerang) effect - forward then backward
 */
export function pingPongFrames(frames: Frame[]): Frame[] {
  if (frames.length < 2) return frames;

  const reversed = [...frames].reverse().slice(1, -1); // Exclude first and last to avoid duplicates
  return [...frames, ...reversed];
}

/**
 * Adjust speed by changing all frame delays
 * @param multiplier - 2 = 2x faster, 0.5 = 2x slower
 */
export function adjustSpeed(frames: Frame[], multiplier: number): Frame[] {
  return frames.map(frame => ({
    ...frame,
    delay: Math.max(10, Math.round(frame.delay / multiplier)), // Min 10ms delay
  }));
}

/**
 * Set uniform delay for all frames
 * @param delayMs - Delay in milliseconds
 */
export function setUniformDelay(frames: Frame[], delayMs: number): Frame[] {
  return frames.map(frame => ({
    ...frame,
    delay: Math.max(10, delayMs),
  }));
}

/**
 * Set delay for a specific frame
 */
export function setFrameDelay(frames: Frame[], frameIndex: number, delayMs: number): Frame[] {
  return frames.map((frame, i) =>
    i === frameIndex ? { ...frame, delay: Math.max(10, delayMs) } : frame
  );
}

/**
 * Remove every nth frame to reduce frame count
 * @param n - Remove every nth frame (2 = remove half, 3 = remove 1/3, etc.)
 */
export function removeEveryNthFrame(frames: Frame[], n: number): Frame[] {
  if (n < 2) return frames;

  return frames.filter((_, index) => (index + 1) % n !== 0).map(frame => ({
    ...frame,
    // Adjust delay to maintain approximate duration
    delay: Math.round(frame.delay * n / (n - 1)),
  }));
}

/**
 * Remove duplicate/similar consecutive frames
 */
export function removeDuplicateFrames(
  frames: Frame[],
  threshold = 0.98 // Similarity threshold (0-1)
): Frame[] {
  if (frames.length < 2) return frames;

  const result: Frame[] = [frames[0]];
  let accumulatedDelay = frames[0].delay;

  for (let i = 1; i < frames.length; i++) {
    const similarity = compareFrames(frames[i - 1].imageData, frames[i].imageData);

    if (similarity < threshold) {
      // Frames are different enough, keep this one
      result[result.length - 1] = {
        ...result[result.length - 1],
        delay: accumulatedDelay,
      };
      result.push(frames[i]);
      accumulatedDelay = frames[i].delay;
    } else {
      // Frames are similar, accumulate delay
      accumulatedDelay += frames[i].delay;
    }
  }

  // Update last frame's delay
  result[result.length - 1] = {
    ...result[result.length - 1],
    delay: accumulatedDelay,
  };

  return result;
}

/**
 * Compare two frames and return similarity (0-1)
 */
function compareFrames(a: ImageData, b: ImageData): number {
  if (a.width !== b.width || a.height !== b.height) return 0;

  const sampleSize = Math.min(1000, a.data.length / 4);
  const step = Math.floor(a.data.length / 4 / sampleSize) * 4;

  let matches = 0;
  let samples = 0;

  for (let i = 0; i < a.data.length; i += step) {
    const diffR = Math.abs(a.data[i] - b.data[i]);
    const diffG = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const diffB = Math.abs(a.data[i + 2] - b.data[i + 2]);

    if (diffR < 10 && diffG < 10 && diffB < 10) {
      matches++;
    }
    samples++;
  }

  return matches / samples;
}

/**
 * Cut frames - remove from start, end, or middle
 */
export function cutFrames(
  frames: Frame[],
  start: number,
  end: number
): Frame[] {
  return frames.slice(start, end + 1);
}

/**
 * Remove a range of frames from the middle
 */
export function removeFrameRange(
  frames: Frame[],
  startIndex: number,
  endIndex: number
): Frame[] {
  return [
    ...frames.slice(0, startIndex),
    ...frames.slice(endIndex + 1),
  ];
}

/**
 * Reorder frames based on new index array
 */
export function reorderFrames(frames: Frame[], newOrder: number[]): Frame[] {
  return newOrder.map(i => frames[i]);
}

/**
 * Duplicate a frame
 */
export function duplicateFrame(frames: Frame[], index: number): Frame[] {
  const frame = frames[index];
  return [
    ...frames.slice(0, index + 1),
    { ...frame, imageData: new ImageData(new Uint8ClampedArray(frame.imageData.data), frame.imageData.width, frame.imageData.height) },
    ...frames.slice(index + 1),
  ];
}

/**
 * Delete a frame
 */
export function deleteFrame(frames: Frame[], index: number): Frame[] {
  return frames.filter((_, i) => i !== index);
}

/**
 * Add fade in effect (gradually increase opacity at start)
 */
export function addFadeIn(frames: Frame[], numFrames: number): Frame[] {
  return frames.map((frame, i) => {
    if (i >= numFrames) return frame;

    const opacity = (i + 1) / numFrames;
    const data = new Uint8ClampedArray(frame.imageData.data);

    for (let j = 3; j < data.length; j += 4) {
      data[j] = Math.round(data[j] * opacity);
    }

    return {
      ...frame,
      imageData: new ImageData(data, frame.imageData.width, frame.imageData.height),
    };
  });
}

/**
 * Add fade out effect (gradually decrease opacity at end)
 */
export function addFadeOut(frames: Frame[], numFrames: number): Frame[] {
  const startFade = frames.length - numFrames;

  return frames.map((frame, i) => {
    if (i < startFade) return frame;

    const framesFromEnd = frames.length - i;
    const opacity = framesFromEnd / numFrames;
    const data = new Uint8ClampedArray(frame.imageData.data);

    for (let j = 3; j < data.length; j += 4) {
      data[j] = Math.round(data[j] * opacity);
    }

    return {
      ...frame,
      imageData: new ImageData(data, frame.imageData.width, frame.imageData.height),
    };
  });
}

/**
 * Create crossfade transition between two frames
 */
export function crossfadeFrames(
  frameA: Frame,
  frameB: Frame,
  steps: number
): Frame[] {
  const result: Frame[] = [];
  const { width, height } = frameA.imageData;
  const delayPerStep = Math.round((frameA.delay + frameB.delay) / (steps + 2));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const data = new Uint8ClampedArray(frameA.imageData.data.length);

    for (let j = 0; j < data.length; j++) {
      data[j] = Math.round(
        frameA.imageData.data[j] * (1 - t) + frameB.imageData.data[j] * t
      );
    }

    result.push({
      imageData: new ImageData(data, width, height),
      delay: delayPerStep,
    });
  }

  return result;
}

/**
 * Get total duration of animation in milliseconds
 */
export function getTotalDuration(frames: Frame[]): number {
  return frames.reduce((sum, frame) => sum + frame.delay, 0);
}

/**
 * Get average FPS of animation
 */
export function getAverageFps(frames: Frame[]): number {
  const avgDelay = getTotalDuration(frames) / frames.length;
  return Math.round(1000 / avgDelay);
}

/**
 * Convert frame index to time position
 */
export function frameToTime(frames: Frame[], frameIndex: number): number {
  let time = 0;
  for (let i = 0; i < frameIndex && i < frames.length; i++) {
    time += frames[i].delay;
  }
  return time;
}

/**
 * Convert time position to frame index
 */
export function timeToFrame(frames: Frame[], timeMs: number): number {
  let accumulated = 0;
  for (let i = 0; i < frames.length; i++) {
    accumulated += frames[i].delay;
    if (accumulated > timeMs) return i;
  }
  return frames.length - 1;
}
