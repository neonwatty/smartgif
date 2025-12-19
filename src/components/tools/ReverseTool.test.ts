/**
 * Test suite for ReverseTool component
 * Tests the reverseFrames and pingPongFrames functions from frameUtils
 */

import { describe, it, expect } from 'vitest'
import { reverseFrames, pingPongFrames, getTotalDuration } from '../../lib/frameUtils'
import { createTestFrame, createMockFrames } from '../../test/testUtils'

describe('reverseFrames', () => {
  it('should reverse the order of frames', () => {
    const frames = [
      createTestFrame(100, 100, [255, 0, 0, 255], 100),
      createTestFrame(100, 100, [0, 255, 0, 255], 110),
      createTestFrame(100, 100, [0, 0, 255, 255], 120),
      createTestFrame(100, 100, [255, 255, 0, 255], 130),
      createTestFrame(100, 100, [255, 0, 255, 255], 140),
    ]

    const reversed = reverseFrames(frames)

    expect(reversed.length).toBe(frames.length)
    expect(reversed[0].delay).toBe(frames[4].delay)
    expect(reversed[4].delay).toBe(frames[0].delay)
  })

  it('should handle a single frame', () => {
    const singleFrame = [createTestFrame(100, 100, [255, 0, 0, 255], 100)]
    const reversed = reverseFrames(singleFrame)

    expect(reversed.length).toBe(1)
    expect(reversed[0].delay).toBe(singleFrame[0].delay)
  })

  it('should not modify the original array', () => {
    const frames = [
      createTestFrame(100, 100, [255, 0, 0, 255], 100),
      createTestFrame(100, 100, [0, 255, 0, 255], 110),
      createTestFrame(100, 100, [0, 0, 255, 255], 120),
    ]
    const originalFirstDelay = frames[0].delay

    reverseFrames(frames)

    expect(frames[0].delay).toBe(originalFirstDelay)
  })
})

describe('pingPongFrames', () => {
  it('should create a ping-pong sequence', () => {
    const frames = [
      createTestFrame(100, 100, [255, 0, 0, 255], 100),
      createTestFrame(100, 100, [0, 255, 0, 255], 110),
      createTestFrame(100, 100, [0, 0, 255, 255], 120),
      createTestFrame(100, 100, [255, 255, 0, 255], 130),
      createTestFrame(100, 100, [255, 0, 255, 255], 140),
    ]

    const pingPong = pingPongFrames(frames)

    // Should be: [0, 1, 2, 3, 4, 3, 2, 1] (excludes first and last to avoid duplicates)
    const expectedLength = frames.length + (frames.length - 2)
    expect(pingPong.length).toBe(expectedLength)

    // Verify forward portion
    expect(pingPong[0].delay).toBe(frames[0].delay)
    expect(pingPong[4].delay).toBe(frames[4].delay)

    // Verify backward portion (should be frames[3], frames[2], frames[1])
    expect(pingPong[5].delay).toBe(frames[3].delay)
    expect(pingPong[7].delay).toBe(frames[1].delay)
  })

  it('should handle two frames', () => {
    const twoFrames = [
      createTestFrame(100, 100, [255, 0, 0, 255], 100),
      createTestFrame(100, 100, [0, 255, 0, 255], 110),
    ]

    const pingPong = pingPongFrames(twoFrames)

    expect(pingPong.length).toBe(2)
  })

  it('should handle a single frame', () => {
    const singleFrame = [createTestFrame(100, 100, [255, 0, 0, 255], 100)]
    const pingPong = pingPongFrames(singleFrame)

    expect(pingPong.length).toBe(1)
  })

  it('should handle three frames correctly', () => {
    const threeFrames = [
      createTestFrame(100, 100, [255, 0, 0, 255], 100),
      createTestFrame(100, 100, [0, 255, 0, 255], 110),
      createTestFrame(100, 100, [0, 0, 255, 255], 120),
    ]

    const pingPong = pingPongFrames(threeFrames)

    // Should be: [0, 1, 2, 1] (middle frame only)
    expect(pingPong.length).toBe(4)
    expect(pingPong[0].delay).toBe(threeFrames[0].delay)
    expect(pingPong[1].delay).toBe(threeFrames[1].delay)
    expect(pingPong[2].delay).toBe(threeFrames[2].delay)
    expect(pingPong[3].delay).toBe(threeFrames[1].delay)
  })
})

describe('getTotalDuration', () => {
  it('should calculate total duration correctly', () => {
    const frames = [
      createTestFrame(100, 100, [255, 0, 0, 255], 100),
      createTestFrame(100, 100, [0, 255, 0, 255], 150),
      createTestFrame(100, 100, [0, 0, 255, 255], 200),
    ]

    const duration = getTotalDuration(frames)

    expect(duration).toBe(450)
  })

  it('should return zero for empty array', () => {
    const emptyDuration = getTotalDuration([])

    expect(emptyDuration).toBe(0)
  })
})

describe('Frame count and duration changes', () => {
  it('should maintain frame count when reversing', () => {
    const frames = createMockFrames(10)
    const reversed = reverseFrames(frames)

    expect(reversed.length).toBe(frames.length)
  })

  it('should increase frame count with ping-pong', () => {
    const frames = createMockFrames(10)
    const pingPong = pingPongFrames(frames)
    const expectedPingPongCount = frames.length + (frames.length - 2)

    expect(pingPong.length).toBe(expectedPingPongCount)
  })

  it('should increase duration with ping-pong', () => {
    const frames = createMockFrames(10)
    const pingPong = pingPongFrames(frames)

    const originalDuration = getTotalDuration(frames)
    const pingPongDuration = getTotalDuration(pingPong)

    expect(pingPongDuration).toBeGreaterThan(originalDuration)
  })
})

describe('Realistic frame counts', () => {
  it('should handle 50 frames', () => {
    const frames = Array.from({ length: 50 }, (_, i) =>
      createTestFrame(800, 520, [255, 0, 0, 255], 100 + i * 10)
    )

    const reversed = reverseFrames(frames)
    expect(reversed.length).toBe(50)

    const pingPong = pingPongFrames(frames)
    expect(pingPong.length).toBe(98) // 50 + 48

    const originalDuration = getTotalDuration(frames)
    const pingPongDuration = getTotalDuration(pingPong)

    expect(pingPongDuration).toBeGreaterThan(originalDuration)
  })
})
