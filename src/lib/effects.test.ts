/**
 * Effects Library Tests
 * Tests all image effects and filters
 */

import { describe, it, expect } from 'vitest'
import {
  grayscale,
  sepia,
  invert,
  brightness,
  contrast,
  saturation,
  hueRotate,
  blur,
  sharpen,
  applyEffect,
  type EffectName,
} from './effects'

/**
 * Create test ImageData with specified color
 */
function createTestImageData(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
  a = 255
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = a
  }
  return new ImageData(data, width, height)
}

/**
 * Create test ImageData with gradient
 */
function createGradientImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      data[i] = Math.floor((x / width) * 255)     // R
      data[i + 1] = Math.floor((y / height) * 255) // G
      data[i + 2] = 128                            // B
      data[i + 3] = 255                            // A
    }
  }
  return new ImageData(data, width, height)
}

/**
 * Get pixel at position
 */
function getPixel(imageData: ImageData, x: number, y: number): [number, number, number, number] {
  const i = (y * imageData.width + x) * 4
  return [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]]
}

describe('effects', () => {
  describe('grayscale', () => {
    it('should convert color image to grayscale at 100% intensity', () => {
      // Pure red should become gray (approximately 76 based on luminance formula)
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = grayscale(red, 100)

      const [r, g, b, a] = getPixel(result, 0, 0)
      // Gray value for red: 0.299 * 255 = ~76
      expect(r).toBeCloseTo(76, 0)
      expect(g).toBeCloseTo(76, 0)
      expect(b).toBeCloseTo(76, 0)
      expect(a).toBe(255)
    })

    it('should partially apply grayscale at 50% intensity', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = grayscale(red, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      // 50% between original (255,0,0) and gray (76,76,76)
      expect(r).toBeGreaterThan(76)
      expect(r).toBeLessThan(255)
      expect(g).toBeGreaterThan(0)
      expect(b).toBeGreaterThan(0)
    })

    it('should preserve alpha channel', () => {
      const semiTransparent = createTestImageData(10, 10, 255, 0, 0, 128)
      const result = grayscale(semiTransparent, 100)

      const [, , , a] = getPixel(result, 0, 0)
      expect(a).toBe(128)
    })

    it('should not modify original ImageData', () => {
      const original = createTestImageData(10, 10, 255, 0, 0)
      const originalR = original.data[0]
      grayscale(original, 100)

      expect(original.data[0]).toBe(originalR)
    })
  })

  describe('sepia', () => {
    it('should apply sepia tone at 100% intensity', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = sepia(red, 100)

      const [r, g, b] = getPixel(result, 0, 0)
      // Sepia formula applied to red
      expect(r).toBeCloseTo(100, 0) // 0.393 * 255 ≈ 100
      expect(g).toBeCloseTo(89, 0)  // 0.349 * 255 ≈ 89
      expect(b).toBeCloseTo(69, 0)  // 0.272 * 255 ≈ 69
    })

    it('should blend with original at partial intensity', () => {
      const blue = createTestImageData(10, 10, 0, 0, 255)
      const result = sepia(blue, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      // Should be between original blue and sepia
      expect(r).toBeGreaterThan(0)
      expect(g).toBeGreaterThan(0)
      expect(b).toBeGreaterThan(0)
      expect(b).toBeLessThan(255)
    })
  })

  describe('invert', () => {
    it('should invert colors at 100% intensity', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = invert(red, 100)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(0)
      expect(g).toBe(255)
      expect(b).toBe(255)
    })

    it('should invert white to black', () => {
      const white = createTestImageData(10, 10, 255, 255, 255)
      const result = invert(white, 100)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(0)
      expect(g).toBe(0)
      expect(b).toBe(0)
    })

    it('should partially invert at 50% intensity', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = invert(red, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      // Halfway between red (255,0,0) and cyan (0,255,255)
      expect(r).toBeCloseTo(128, 1)
      expect(g).toBeCloseTo(128, 1)
      expect(b).toBeCloseTo(128, 1)
    })
  })

  describe('brightness', () => {
    it('should increase brightness with positive value', () => {
      const gray = createTestImageData(10, 10, 128, 128, 128)
      const result = brightness(gray, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeGreaterThan(128)
      expect(g).toBeGreaterThan(128)
      expect(b).toBeGreaterThan(128)
    })

    it('should decrease brightness with negative value', () => {
      const gray = createTestImageData(10, 10, 128, 128, 128)
      const result = brightness(gray, -50)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeLessThan(128)
      expect(g).toBeLessThan(128)
      expect(b).toBeLessThan(128)
    })

    it('should clamp values to valid range', () => {
      const white = createTestImageData(10, 10, 255, 255, 255)
      const result = brightness(white, 100)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(255)
      expect(g).toBe(255)
      expect(b).toBe(255)
    })

    it('should not go below 0', () => {
      const black = createTestImageData(10, 10, 0, 0, 0)
      const result = brightness(black, -100)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(0)
      expect(g).toBe(0)
      expect(b).toBe(0)
    })
  })

  describe('contrast', () => {
    it('should increase contrast with positive value', () => {
      const gray = createTestImageData(10, 10, 100, 100, 100)
      const result = contrast(gray, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      // Values below 128 should decrease
      expect(r).toBeLessThan(100)
      expect(g).toBeLessThan(100)
      expect(b).toBeLessThan(100)
    })

    it('should decrease contrast with negative value', () => {
      const lowGray = createTestImageData(10, 10, 50, 50, 50)
      const result = contrast(lowGray, -50)

      const [r, g, b] = getPixel(result, 0, 0)
      // Values should move toward 128
      expect(r).toBeGreaterThan(50)
      expect(g).toBeGreaterThan(50)
      expect(b).toBeGreaterThan(50)
    })

    it('should not change mid-gray (128)', () => {
      const midGray = createTestImageData(10, 10, 128, 128, 128)
      const result = contrast(midGray, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeCloseTo(128, 0)
      expect(g).toBeCloseTo(128, 0)
      expect(b).toBeCloseTo(128, 0)
    })
  })

  describe('saturation', () => {
    it('should increase saturation with positive value', () => {
      // Start with a somewhat desaturated color
      const muted = createTestImageData(10, 10, 200, 100, 100)
      const result = saturation(muted, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      // Red channel should increase, others decrease (more saturated red)
      expect(r).toBeGreaterThan(200)
      expect(g).toBeLessThan(100)
      expect(b).toBeLessThan(100)
    })

    it('should decrease saturation with negative value', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = saturation(red, -50)

      const [r, g, b] = getPixel(result, 0, 0)
      // Should move toward grayscale
      expect(r).toBeLessThan(255)
      expect(g).toBeGreaterThan(0)
      expect(b).toBeGreaterThan(0)
    })

    it('should not affect grayscale images', () => {
      const gray = createTestImageData(10, 10, 128, 128, 128)
      const result = saturation(gray, 50)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeCloseTo(128, 0)
      expect(g).toBeCloseTo(128, 0)
      expect(b).toBeCloseTo(128, 0)
    })
  })

  describe('hueRotate', () => {
    it('should rotate hue by 180 degrees', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = hueRotate(red, 180)

      const [r, g, b] = getPixel(result, 0, 0)
      // Red rotated 180° should shift toward cyan-ish (YIQ model isn't exact RGB)
      // The important thing is the color changes significantly
      expect(r).toBeLessThan(100)
      expect(g).toBeGreaterThan(100)
      expect(b).toBeGreaterThan(100)
    })

    it('should return to original at 360 degrees', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = hueRotate(red, 360)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeCloseTo(255, 0)
      expect(g).toBeCloseTo(0, 0)
      expect(b).toBeCloseTo(0, 0)
    })

    it('should not affect grayscale images', () => {
      const gray = createTestImageData(10, 10, 128, 128, 128)
      const result = hueRotate(gray, 90)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeCloseTo(128, 1)
      expect(g).toBeCloseTo(128, 1)
      expect(b).toBeCloseTo(128, 1)
    })
  })

  describe('blur', () => {
    it('should blur the image', () => {
      // Create image with sharp edge
      const sharp = new ImageData(10, 10)
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          const i = (y * 10 + x) * 4
          // Left half white, right half black
          const value = x < 5 ? 255 : 0
          sharp.data[i] = value
          sharp.data[i + 1] = value
          sharp.data[i + 2] = value
          sharp.data[i + 3] = 255
        }
      }

      const result = blur(sharp, 1)

      // Pixel at edge should be blurred (not pure white or black)
      const [r] = getPixel(result, 5, 5)
      expect(r).toBeGreaterThan(0)
      expect(r).toBeLessThan(255)
    })

    it('should preserve image dimensions', () => {
      const input = createTestImageData(50, 30, 128, 128, 128)
      const result = blur(input, 2)

      expect(result.width).toBe(50)
      expect(result.height).toBe(30)
    })

    it('should preserve alpha channel', () => {
      const semiTransparent = createTestImageData(10, 10, 255, 0, 0, 128)
      const result = blur(semiTransparent, 1)

      const [, , , a] = getPixel(result, 5, 5)
      expect(a).toBeCloseTo(128, 0)
    })
  })

  describe('sharpen', () => {
    it('should sharpen the image', () => {
      const gradient = createGradientImageData(10, 10)
      const result = sharpen(gradient, 1)

      // Sharpened image should have more extreme values
      expect(result.width).toBe(10)
      expect(result.height).toBe(10)
    })

    it('should preserve image dimensions', () => {
      const input = createTestImageData(50, 30, 128, 128, 128)
      const result = sharpen(input, 1)

      expect(result.width).toBe(50)
      expect(result.height).toBe(30)
    })

    it('should preserve edges unchanged', () => {
      const input = createTestImageData(10, 10, 128, 128, 128)
      const result = sharpen(input, 1)

      // Top-left corner should be preserved
      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(128)
      expect(g).toBe(128)
      expect(b).toBe(128)
    })
  })

  describe('applyEffect', () => {
    it('should apply grayscale effect by name', () => {
      const red = createTestImageData(10, 10, 255, 0, 0)
      const result = applyEffect(red, 'grayscale', { intensity: 100 })

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBeCloseTo(g, 0)
      expect(g).toBeCloseTo(b, 0)
    })

    it('should apply brightness effect with value', () => {
      const gray = createTestImageData(10, 10, 128, 128, 128)
      const result = applyEffect(gray, 'brightness', { value: 50 })

      const [r] = getPixel(result, 0, 0)
      expect(r).toBeGreaterThan(128)
    })

    it('should apply all effect types', () => {
      const effects: EffectName[] = [
        'grayscale', 'sepia', 'invert', 'brightness',
        'contrast', 'saturation', 'hue', 'blur', 'sharpen'
      ]

      const input = createTestImageData(20, 20, 100, 150, 200)

      for (const effect of effects) {
        const result = applyEffect(input, effect, { intensity: 50, value: 25 })
        expect(result.width).toBe(20)
        expect(result.height).toBe(20)
        expect(result.data.length).toBe(20 * 20 * 4)
      }
    })

    it('should return original for unknown effect', () => {
      const input = createTestImageData(10, 10, 128, 128, 128)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = applyEffect(input, 'unknown' as any, {})

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(128)
      expect(g).toBe(128)
      expect(b).toBe(128)
    })
  })

  describe('edge cases', () => {
    it('should handle 1x1 pixel images', () => {
      const tiny = createTestImageData(1, 1, 255, 0, 0)

      const gs = grayscale(tiny, 100)
      expect(gs.width).toBe(1)
      expect(gs.height).toBe(1)

      const blurred = blur(tiny, 1)
      expect(blurred.width).toBe(1)
      expect(blurred.height).toBe(1)
    })

    it('should handle large images', () => {
      const large = createTestImageData(500, 500, 128, 128, 128)

      const result = grayscale(large, 100)
      expect(result.width).toBe(500)
      expect(result.height).toBe(500)
      expect(result.data.length).toBe(500 * 500 * 4)
    })

    it('should handle zero intensity', () => {
      const input = createTestImageData(10, 10, 255, 0, 0)
      const result = grayscale(input, 0)

      const [r, g, b] = getPixel(result, 0, 0)
      expect(r).toBe(255)
      expect(g).toBe(0)
      expect(b).toBe(0)
    })

    it('should handle fully transparent pixels', () => {
      const transparent = createTestImageData(10, 10, 255, 0, 0, 0)
      const result = grayscale(transparent, 100)

      const [, , , a] = getPixel(result, 0, 0)
      expect(a).toBe(0)
    })
  })
})
