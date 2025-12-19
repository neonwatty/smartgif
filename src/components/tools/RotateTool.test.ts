/**
 * Tests for RotateTool component - transform operations
 */

import { describe, it, expect } from 'vitest'
import type { Frame } from '../../types'
import { rotateFrames, rotateImageData, flipFrames, flipImageData } from '../../lib/transforms'
import { createTestFrame, createMockFrames } from '../../test/testUtils'

/**
 * Helper to create a frame with a distinct 4-quadrant pattern
 * Top-left: Red, Top-right: Green, Bottom-left: Blue, Bottom-right: Yellow
 */
function createPatternFrame(width: number, height: number): Frame {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      if (y < height / 2) {
        if (x < width / 2) {
          // Top-left: Red
          data[idx] = 255
          data[idx + 1] = 0
          data[idx + 2] = 0
        } else {
          // Top-right: Green
          data[idx] = 0
          data[idx + 1] = 255
          data[idx + 2] = 0
        }
      } else {
        if (x < width / 2) {
          // Bottom-left: Blue
          data[idx] = 0
          data[idx + 1] = 0
          data[idx + 2] = 255
        } else {
          // Bottom-right: Yellow
          data[idx] = 255
          data[idx + 1] = 255
          data[idx + 2] = 0
        }
      }
      data[idx + 3] = 255 // Alpha
    }
  }

  return {
    imageData: new ImageData(data, width, height),
    delay: 100,
  }
}

describe('rotateImageData', () => {
  it('should return original ImageData for 0° rotation', () => {
    const frame = createTestFrame(100, 200)
    const rotated = rotateImageData(frame.imageData, 0)

    expect(rotated).toBe(frame.imageData)
  })

  it('should swap dimensions for 90° rotation', () => {
    const frame = createTestFrame(100, 200)
    const rotated = rotateImageData(frame.imageData, 90)

    expect(rotated.width).toBe(200)
    expect(rotated.height).toBe(100)
  })

  it('should handle 90° rotation with pattern frame', () => {
    const frame = createPatternFrame(4, 4)
    const rotated = rotateImageData(frame.imageData, 90)

    expect(rotated.width).toBe(4)
    expect(rotated.height).toBe(4)
    expect(rotated.data.length).toBeGreaterThan(0)
  })

  it('should preserve dimensions for 180° rotation', () => {
    const frame = createTestFrame(100, 200)
    const rotated = rotateImageData(frame.imageData, 180)

    expect(rotated.width).toBe(100)
    expect(rotated.height).toBe(200)
  })

  it('should swap dimensions for 270° rotation', () => {
    const frame = createTestFrame(150, 100)
    const rotated = rotateImageData(frame.imageData, 270)

    expect(rotated.width).toBe(100)
    expect(rotated.height).toBe(150)
  })

  it('should restore original dimensions after 360° (four 90° rotations)', () => {
    const frame = createTestFrame(100, 200)

    let rotated = rotateImageData(frame.imageData, 90)
    rotated = rotateImageData(rotated, 90)
    rotated = rotateImageData(rotated, 90)
    rotated = rotateImageData(rotated, 90)

    expect(rotated.width).toBe(100)
    expect(rotated.height).toBe(200)
  })
})

describe('flipImageData', () => {
  it('should preserve dimensions for horizontal flip', () => {
    const frame = createPatternFrame(4, 4)
    const flipped = flipImageData(frame.imageData, 'horizontal')

    expect(flipped.width).toBe(4)
    expect(flipped.height).toBe(4)
    expect(flipped.data.length).toBeGreaterThan(0)
  })

  it('should preserve dimensions for vertical flip', () => {
    const frame = createPatternFrame(4, 4)
    const flipped = flipImageData(frame.imageData, 'vertical')

    expect(flipped.width).toBe(4)
    expect(flipped.height).toBe(4)
    expect(flipped.data.length).toBeGreaterThan(0)
  })

  it('should preserve dimensions for both directions flip', () => {
    const frame = createPatternFrame(4, 4)
    const flipped = flipImageData(frame.imageData, 'both')

    expect(flipped.width).toBe(4)
    expect(flipped.height).toBe(4)
    expect(flipped.data.length).toBeGreaterThan(0)
  })
})

describe('rotateFrames', () => {
  it('should rotate multiple frames', () => {
    const frames: Frame[] = [
      createTestFrame(100, 200, [255, 0, 0, 255]),
      createTestFrame(100, 200, [0, 255, 0, 255]),
      createTestFrame(100, 200, [0, 0, 255, 255]),
    ]

    const rotated = rotateFrames(frames, 90)

    expect(rotated).toHaveLength(3)

    rotated.forEach((frame, i) => {
      expect(frame.imageData.width).toBe(200)
      expect(frame.imageData.height).toBe(100)
      expect(frame.delay).toBe(frames[i].delay)
    })
  })

  it('should preserve frame delays when rotating', () => {
    const frames: Frame[] = [
      createTestFrame(100, 200, [255, 0, 0, 255], 50),
      createTestFrame(100, 200, [0, 255, 0, 255], 100),
      createTestFrame(100, 200, [0, 0, 255, 255], 150),
    ]

    const rotated = rotateFrames(frames, 90)

    expect(rotated[0].delay).toBe(50)
    expect(rotated[1].delay).toBe(100)
    expect(rotated[2].delay).toBe(150)
  })
})

describe('flipFrames', () => {
  it('should flip multiple frames', () => {
    const frames: Frame[] = [
      createPatternFrame(4, 4),
      createPatternFrame(4, 4),
    ]

    const flipped = flipFrames(frames, 'horizontal')

    expect(flipped).toHaveLength(2)

    flipped.forEach((frame, i) => {
      expect(frame.imageData.width).toBe(4)
      expect(frame.imageData.height).toBe(4)
      expect(frame.delay).toBe(frames[i].delay)
    })
  })

  it('should preserve frame delays when flipping', () => {
    const frames: Frame[] = [
      createPatternFrame(4, 4),
      createPatternFrame(4, 4),
    ]
    frames[0].delay = 75
    frames[1].delay = 125

    const flipped = flipFrames(frames, 'vertical')

    expect(flipped[0].delay).toBe(75)
    expect(flipped[1].delay).toBe(125)
  })
})

describe('combined transformations', () => {
  it('should handle combined rotate and flip operations', () => {
    const frame = createPatternFrame(4, 4)

    // First rotate 90°
    let transformed = rotateImageData(frame.imageData, 90)
    // Then flip horizontally
    transformed = flipImageData(transformed, 'horizontal')

    expect(transformed.width).toBe(4)
    expect(transformed.height).toBe(4)
  })

  it('should handle multiple sequential rotations', () => {
    const frame = createTestFrame(100, 200)

    // Rotate 90° twice = 180°
    let rotated = rotateImageData(frame.imageData, 90)
    rotated = rotateImageData(rotated, 90)

    expect(rotated.width).toBe(100)
    expect(rotated.height).toBe(200)
  })

  it('should handle rotate followed by flip on multiple frames', () => {
    const frames = createMockFrames(3)

    const rotated = rotateFrames(frames, 90)
    const flipped = flipFrames(rotated, 'horizontal')

    expect(flipped).toHaveLength(3)
    flipped.forEach((frame) => {
      expect(frame.imageData.width).toBe(100)
      expect(frame.imageData.height).toBe(100)
    })
  })
})
