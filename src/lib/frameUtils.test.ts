/**
 * FrameUtils Library Tests
 * Tests frame manipulation utilities
 */

import { describe, it, expect } from 'vitest'
import {
  reverseFrames,
  pingPongFrames,
  adjustSpeed,
  setUniformDelay,
  setFrameDelay,
  removeEveryNthFrame,
  removeDuplicateFrames,
  cutFrames,
  removeFrameRange,
  reorderFrames,
  duplicateFrame,
  deleteFrame,
  addFadeIn,
  addFadeOut,
  crossfadeFrames,
  getTotalDuration,
  getAverageFps,
  frameToTime,
  timeToFrame,
} from './frameUtils'
import type { Frame } from '../types'

/**
 * Create test frame with specified color and alpha
 */
function createTestFrame(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
  a = 255,
  delay = 100
): Frame {
  const data = new Uint8ClampedArray(width * height * 4)
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
 * Create test frames array
 */
function createTestFrames(count: number, delay = 100): Frame[] {
  const colors: Array<[number, number, number]> = [
    [255, 0, 0],   // red
    [0, 255, 0],   // green
    [0, 0, 255],   // blue
    [255, 255, 0], // yellow
    [255, 0, 255], // magenta
  ]

  return Array.from({ length: count }, (_, i) => {
    const [r, g, b] = colors[i % colors.length]
    return createTestFrame(10, 10, r, g, b, 255, delay)
  })
}

describe('frameUtils', () => {
  describe('reverseFrames', () => {
    it('should reverse frame order', () => {
      const frames = createTestFrames(3)
      const reversed = reverseFrames(frames)

      expect(reversed.length).toBe(3)
      expect(reversed[0].imageData.data[0]).toBe(frames[2].imageData.data[0])
      expect(reversed[2].imageData.data[0]).toBe(frames[0].imageData.data[0])
    })

    it('should not modify original array', () => {
      const frames = createTestFrames(3)
      const firstR = frames[0].imageData.data[0]
      reverseFrames(frames)

      expect(frames[0].imageData.data[0]).toBe(firstR)
    })
  })

  describe('pingPongFrames', () => {
    it('should create ping-pong effect', () => {
      const frames = createTestFrames(4)
      const pingPong = pingPongFrames(frames)

      // Should be: 0, 1, 2, 3, 2, 1 (6 frames)
      expect(pingPong.length).toBe(6)
    })

    it('should return unchanged for less than 2 frames', () => {
      const frame = createTestFrames(1)
      const result = pingPongFrames(frame)

      expect(result.length).toBe(1)
    })

    it('should exclude duplicates at boundaries', () => {
      const frames = createTestFrames(3)
      const pingPong = pingPongFrames(frames)

      // Should be: 0, 1, 2, 1 (4 frames - no duplicate of frame 0 and 2)
      expect(pingPong.length).toBe(4)
    })
  })

  describe('setFrameDelay', () => {
    it('should set delay for specific frame', () => {
      const frames = createTestFrames(3)
      const result = setFrameDelay(frames, 1, 200)

      expect(result[0].delay).toBe(100)
      expect(result[1].delay).toBe(200)
      expect(result[2].delay).toBe(100)
    })

    it('should enforce minimum delay of 10ms', () => {
      const frames = createTestFrames(3)
      const result = setFrameDelay(frames, 1, 5)

      expect(result[1].delay).toBe(10)
    })
  })

  describe('removeEveryNthFrame', () => {
    it('should remove every 2nd frame', () => {
      const frames = createTestFrames(6)
      const result = removeEveryNthFrame(frames, 2)

      // Removes frames at index 1, 3, 5 (every 2nd)
      expect(result.length).toBe(3)
    })

    it('should remove every 3rd frame', () => {
      const frames = createTestFrames(9)
      const result = removeEveryNthFrame(frames, 3)

      // Removes frames at index 2, 5, 8
      expect(result.length).toBe(6)
    })

    it('should return unchanged for n < 2', () => {
      const frames = createTestFrames(5)
      const result = removeEveryNthFrame(frames, 1)

      expect(result.length).toBe(5)
    })

    it('should adjust delays to maintain duration', () => {
      const frames = createTestFrames(4, 100)
      const result = removeEveryNthFrame(frames, 2)

      // Remaining frames should have increased delay
      expect(result[0].delay).toBeGreaterThan(100)
    })
  })

  describe('removeDuplicateFrames', () => {
    it('should remove similar consecutive frames', () => {
      // Create frames where some are identical
      const frame1 = createTestFrame(10, 10, 255, 0, 0, 255, 100)
      const frame2 = createTestFrame(10, 10, 255, 0, 0, 255, 100) // duplicate
      const frame3 = createTestFrame(10, 10, 0, 255, 0, 255, 100) // different

      const frames = [frame1, frame2, frame3]
      const result = removeDuplicateFrames(frames, 0.98)

      expect(result.length).toBe(2) // frame1 (with accumulated delay) and frame3
    })

    it('should accumulate delays from removed frames', () => {
      const frame1 = createTestFrame(10, 10, 255, 0, 0, 255, 100)
      const frame2 = createTestFrame(10, 10, 255, 0, 0, 255, 100) // duplicate
      const frame3 = createTestFrame(10, 10, 0, 255, 0, 255, 100) // different

      const frames = [frame1, frame2, frame3]
      const result = removeDuplicateFrames(frames, 0.98)

      expect(result[0].delay).toBe(200) // accumulated from frame1 and frame2
    })

    it('should handle single frame', () => {
      const frames = createTestFrames(1)
      const result = removeDuplicateFrames(frames)

      expect(result.length).toBe(1)
    })
  })

  describe('cutFrames', () => {
    it('should cut frames from start to end', () => {
      const frames = createTestFrames(10)
      const result = cutFrames(frames, 2, 5)

      expect(result.length).toBe(4) // frames 2, 3, 4, 5
    })

    it('should handle cutting from start', () => {
      const frames = createTestFrames(5)
      const result = cutFrames(frames, 0, 2)

      expect(result.length).toBe(3)
    })

    it('should handle cutting to end', () => {
      const frames = createTestFrames(5)
      const result = cutFrames(frames, 3, 4)

      expect(result.length).toBe(2)
    })
  })

  describe('removeFrameRange', () => {
    it('should remove frames from middle', () => {
      const frames = createTestFrames(10)
      const result = removeFrameRange(frames, 3, 6)

      expect(result.length).toBe(6) // Removed 4 frames (indices 3-6)
    })

    it('should remove frames from start', () => {
      const frames = createTestFrames(5)
      const result = removeFrameRange(frames, 0, 1)

      expect(result.length).toBe(3)
    })

    it('should remove frames from end', () => {
      const frames = createTestFrames(5)
      const result = removeFrameRange(frames, 3, 4)

      expect(result.length).toBe(3)
    })
  })

  describe('reorderFrames', () => {
    it('should reorder frames based on index array', () => {
      const frames = createTestFrames(4)
      const result = reorderFrames(frames, [3, 2, 1, 0])

      expect(result[0].imageData.data[0]).toBe(frames[3].imageData.data[0])
      expect(result[3].imageData.data[0]).toBe(frames[0].imageData.data[0])
    })

    it('should handle partial reordering', () => {
      const frames = createTestFrames(4)
      const result = reorderFrames(frames, [0, 2])

      expect(result.length).toBe(2)
    })
  })

  describe('duplicateFrame', () => {
    it('should duplicate frame at index', () => {
      const frames = createTestFrames(3)
      const result = duplicateFrame(frames, 1)

      expect(result.length).toBe(4)
      expect(result[1].imageData.data[0]).toBe(result[2].imageData.data[0])
    })

    it('should create independent copy', () => {
      const frames = createTestFrames(3)
      const result = duplicateFrame(frames, 1)

      // Modify the duplicate
      result[2].imageData.data[0] = 128

      // Original should be unchanged
      expect(result[1].imageData.data[0]).not.toBe(128)
    })
  })

  describe('deleteFrame', () => {
    it('should delete frame at index', () => {
      const frames = createTestFrames(5)
      const result = deleteFrame(frames, 2)

      expect(result.length).toBe(4)
    })

    it('should delete first frame', () => {
      const frames = createTestFrames(3)
      const originalSecond = frames[1].imageData.data[0]
      const result = deleteFrame(frames, 0)

      expect(result.length).toBe(2)
      expect(result[0].imageData.data[0]).toBe(originalSecond)
    })

    it('should delete last frame', () => {
      const frames = createTestFrames(3)
      const result = deleteFrame(frames, 2)

      expect(result.length).toBe(2)
    })
  })

  describe('addFadeIn', () => {
    it('should gradually increase opacity at start', () => {
      const frames = createTestFrames(5)
      const result = addFadeIn(frames, 3)

      // First frame should have lowest opacity
      const firstAlpha = result[0].imageData.data[3]
      const secondAlpha = result[1].imageData.data[3]
      const thirdAlpha = result[2].imageData.data[3]

      expect(firstAlpha).toBeLessThan(secondAlpha)
      expect(secondAlpha).toBeLessThan(thirdAlpha)
    })

    it('should not affect frames after fade count', () => {
      const frames = createTestFrames(5)
      const result = addFadeIn(frames, 2)

      // Frame 3 (index 2) should be unaffected
      expect(result[2].imageData.data[3]).toBe(255)
      expect(result[3].imageData.data[3]).toBe(255)
    })
  })

  describe('addFadeOut', () => {
    it('should gradually decrease opacity at end', () => {
      const frames = createTestFrames(5)
      const result = addFadeOut(frames, 3)

      // Last frame should have lowest opacity
      const lastAlpha = result[4].imageData.data[3]
      const secondLastAlpha = result[3].imageData.data[3]

      expect(lastAlpha).toBeLessThan(secondLastAlpha)
    })

    it('should not affect frames before fade', () => {
      const frames = createTestFrames(5)
      const result = addFadeOut(frames, 2)

      // First 3 frames should be unaffected
      expect(result[0].imageData.data[3]).toBe(255)
      expect(result[1].imageData.data[3]).toBe(255)
      expect(result[2].imageData.data[3]).toBe(255)
    })
  })

  describe('crossfadeFrames', () => {
    it('should create transition frames between two frames', () => {
      const frameA = createTestFrame(10, 10, 255, 0, 0, 255, 100)
      const frameB = createTestFrame(10, 10, 0, 0, 255, 255, 100)

      const result = crossfadeFrames(frameA, frameB, 3)

      expect(result.length).toBe(4) // 0, 1, 2, 3 = 4 frames
    })

    it('should blend colors between frames', () => {
      const frameA = createTestFrame(10, 10, 255, 0, 0, 255, 100)
      const frameB = createTestFrame(10, 10, 0, 0, 255, 255, 100)

      const result = crossfadeFrames(frameA, frameB, 2)

      // Middle frame should have blended colors
      const midR = result[1].imageData.data[0]
      const midB = result[1].imageData.data[2]

      expect(midR).toBeGreaterThan(0)
      expect(midR).toBeLessThan(255)
      expect(midB).toBeGreaterThan(0)
      expect(midB).toBeLessThan(255)
    })
  })

  describe('getTotalDuration', () => {
    it('should calculate total duration', () => {
      const frames = createTestFrames(5, 100)
      const duration = getTotalDuration(frames)

      expect(duration).toBe(500)
    })

    it('should handle variable delays', () => {
      const frames = [
        createTestFrame(10, 10, 255, 0, 0, 255, 50),
        createTestFrame(10, 10, 0, 255, 0, 255, 100),
        createTestFrame(10, 10, 0, 0, 255, 255, 150),
      ]

      const duration = getTotalDuration(frames)
      expect(duration).toBe(300)
    })

    it('should return 0 for empty frames', () => {
      expect(getTotalDuration([])).toBe(0)
    })
  })

  describe('getAverageFps', () => {
    it('should calculate correct fps', () => {
      const frames = createTestFrames(10, 100)
      const fps = getAverageFps(frames)

      expect(fps).toBe(10) // 100ms delay = 10 fps
    })

    it('should handle fast animation', () => {
      const frames = createTestFrames(10, 16)
      const fps = getAverageFps(frames)

      expect(fps).toBe(63) // ~60fps
    })
  })

  describe('frameToTime', () => {
    it('should convert frame index to time', () => {
      const frames = createTestFrames(5, 100)
      const time = frameToTime(frames, 3)

      expect(time).toBe(300) // 3 frames * 100ms
    })

    it('should handle variable delays', () => {
      const frames = [
        createTestFrame(10, 10, 255, 0, 0, 255, 50),
        createTestFrame(10, 10, 0, 255, 0, 255, 100),
        createTestFrame(10, 10, 0, 0, 255, 255, 150),
      ]

      expect(frameToTime(frames, 0)).toBe(0)
      expect(frameToTime(frames, 1)).toBe(50)
      expect(frameToTime(frames, 2)).toBe(150)
    })

    it('should handle out of bounds index', () => {
      const frames = createTestFrames(3, 100)
      const time = frameToTime(frames, 10)

      expect(time).toBe(300) // Total duration
    })
  })

  describe('timeToFrame', () => {
    it('should convert time to frame index', () => {
      const frames = createTestFrames(5, 100)

      expect(timeToFrame(frames, 0)).toBe(0)
      expect(timeToFrame(frames, 50)).toBe(0)
      expect(timeToFrame(frames, 150)).toBe(1)
      expect(timeToFrame(frames, 250)).toBe(2)
    })

    it('should handle time beyond duration', () => {
      const frames = createTestFrames(3, 100)
      const frameIndex = timeToFrame(frames, 1000)

      expect(frameIndex).toBe(2) // Last frame
    })

    it('should handle variable delays', () => {
      const frames = [
        createTestFrame(10, 10, 255, 0, 0, 255, 50),
        createTestFrame(10, 10, 0, 255, 0, 255, 100),
        createTestFrame(10, 10, 0, 0, 255, 255, 150),
      ]

      expect(timeToFrame(frames, 40)).toBe(0)
      expect(timeToFrame(frames, 60)).toBe(1)
      expect(timeToFrame(frames, 160)).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty frames array', () => {
      const empty: Frame[] = []

      expect(reverseFrames(empty)).toEqual([])
      expect(cutFrames(empty, 0, 0)).toEqual([])
      expect(getTotalDuration(empty)).toBe(0)
    })

    it('should handle single frame', () => {
      const single = createTestFrames(1)

      expect(reverseFrames(single).length).toBe(1)
      expect(pingPongFrames(single).length).toBe(1)
      expect(duplicateFrame(single, 0).length).toBe(2)
    })
  })
})
