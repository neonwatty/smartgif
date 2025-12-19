/**
 * Shared test utilities for SmartGIF tests
 */

import type { Frame } from '../types'

/**
 * Create a test frame with solid color
 */
export function createTestFrame(
  width: number,
  height: number,
  color: [number, number, number, number] = [255, 0, 0, 255],
  delay = 100
): Frame {
  const data = new Uint8ClampedArray(width * height * 4)
  const [r, g, b, a] = color

  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = a
  }

  return {
    imageData: new ImageData(data, width, height),
    delay,
  }
}

/**
 * Create multiple test frames with different colors
 */
export function createMockFrames(count: number, delay = 100): Frame[] {
  const colors: [number, number, number, number][] = [
    [255, 0, 0, 255],    // Red
    [0, 255, 0, 255],    // Green
    [0, 0, 255, 255],    // Blue
    [255, 255, 0, 255],  // Yellow
    [255, 0, 255, 255],  // Magenta
    [0, 255, 255, 255],  // Cyan
  ]

  return Array.from({ length: count }, (_, i) =>
    createTestFrame(100, 100, colors[i % colors.length], delay)
  )
}

/**
 * Create a frame with a gradient pattern (for testing effects)
 */
export function createGradientFrame(
  width: number,
  height: number,
  delay = 100
): Frame {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      data[i] = Math.floor((x / width) * 255)     // R: horizontal gradient
      data[i + 1] = Math.floor((y / height) * 255) // G: vertical gradient
      data[i + 2] = 128                            // B: constant
      data[i + 3] = 255                            // A: opaque
    }
  }

  return {
    imageData: new ImageData(data, width, height),
    delay,
  }
}

/**
 * Create a frame with transparent edges (for testing autoCrop)
 */
export function createFrameWithTransparentEdges(
  width: number,
  height: number,
  padding: number,
  delay = 100
): Frame {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const isInner =
        x >= padding &&
        x < width - padding &&
        y >= padding &&
        y < height - padding

      if (isInner) {
        data[i] = 255     // R
        data[i + 1] = 0   // G
        data[i + 2] = 0   // B
        data[i + 3] = 255 // A: opaque
      } else {
        data[i] = 0       // R
        data[i + 1] = 0   // G
        data[i + 2] = 0   // B
        data[i + 3] = 0   // A: transparent
      }
    }
  }

  return {
    imageData: new ImageData(data, width, height),
    delay,
  }
}

/**
 * Get pixel color at coordinates
 */
export function getPixelAt(
  imageData: ImageData,
  x: number,
  y: number
): [number, number, number, number] {
  const i = (y * imageData.width + x) * 4
  return [
    imageData.data[i],
    imageData.data[i + 1],
    imageData.data[i + 2],
    imageData.data[i + 3],
  ]
}

/**
 * Check if two pixels are approximately equal
 */
export function pixelsMatch(
  a: [number, number, number, number],
  b: [number, number, number, number],
  tolerance = 1
): boolean {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  )
}

/**
 * Compare two ImageData objects
 */
export function compareImageData(
  a: ImageData,
  b: ImageData,
  tolerance = 0
): boolean {
  if (a.width !== b.width || a.height !== b.height) {
    return false
  }

  for (let i = 0; i < a.data.length; i++) {
    if (Math.abs(a.data[i] - b.data[i]) > tolerance) {
      return false
    }
  }

  return true
}

/**
 * Calculate average pixel value for an ImageData
 */
export function getAveragePixelValue(imageData: ImageData): {
  r: number
  g: number
  b: number
  a: number
} {
  let r = 0, g = 0, b = 0, a = 0
  const pixelCount = imageData.data.length / 4

  for (let i = 0; i < imageData.data.length; i += 4) {
    r += imageData.data[i]
    g += imageData.data[i + 1]
    b += imageData.data[i + 2]
    a += imageData.data[i + 3]
  }

  return {
    r: r / pixelCount,
    g: g / pixelCount,
    b: b / pixelCount,
    a: a / pixelCount,
  }
}
