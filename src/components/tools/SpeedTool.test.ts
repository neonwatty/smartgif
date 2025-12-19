/**
 * Speed Tool Tests
 * Tests speed multiplier and uniform delay functionality
 */

import { describe, it, expect } from 'vitest'
import {
  adjustSpeed,
  setUniformDelay,
  getTotalDuration,
  getAverageFps,
} from '../../lib/frameUtils'
import { createTestFrame, createMockFrames } from '../../test/testUtils'

describe('SpeedTool', () => {
  describe('adjustSpeed', () => {
    it('should double speed with 2x multiplier', () => {
      const frames = createMockFrames(5, 100)
      const originalDuration = getTotalDuration(frames)

      const faster = adjustSpeed(frames, 2)
      const fasterDuration = getTotalDuration(faster)

      expect(fasterDuration).toBeCloseTo(originalDuration / 2, -1)
    })

    it('should halve speed with 0.5x multiplier', () => {
      const frames = createMockFrames(5, 100)
      const originalDuration = getTotalDuration(frames)

      const slower = adjustSpeed(frames, 0.5)
      const slowerDuration = getTotalDuration(slower)

      expect(slowerDuration).toBeCloseTo(originalDuration * 2, -1)
    })

    it('should preserve duration with 1x multiplier', () => {
      const frames = createMockFrames(5, 100)
      const originalDuration = getTotalDuration(frames)

      const same = adjustSpeed(frames, 1)
      const sameDuration = getTotalDuration(same)

      expect(sameDuration).toBe(originalDuration)
    })

    it('should enforce minimum delay of 10ms', () => {
      const frames = createMockFrames(5, 5)
      const adjusted = adjustSpeed(frames, 10)

      const allHaveMinDelay = adjusted.every(f => f.delay >= 10)
      expect(allHaveMinDelay).toBe(true)
    })

    it('should preserve frame count across all presets', () => {
      const frames = createMockFrames(5, 100)
      const presets = [0.25, 0.5, 1, 1.5, 2, 4]

      for (const preset of presets) {
        const result = adjustSpeed(frames, preset)
        expect(result.length).toBe(frames.length)
      }
    })
  })

  describe('setUniformDelay', () => {
    it('should set all frames to the same delay', () => {
      const frames = createMockFrames(10, 100)
      const uniformDelay = 50

      const uniform = setUniformDelay(frames, uniformDelay)

      const allSameDelay = uniform.every(f => f.delay === uniformDelay)
      expect(allSameDelay).toBe(true)
    })

    it('should calculate correct total duration', () => {
      const frames = createMockFrames(10, 100)
      const uniformDelay = 50

      const uniform = setUniformDelay(frames, uniformDelay)
      const totalDuration = getTotalDuration(uniform)

      expect(totalDuration).toBe(frames.length * uniformDelay)
    })

    it('should enforce minimum delay of 10ms', () => {
      const frames = createMockFrames(10, 100)
      const belowMin = setUniformDelay(frames, 5)

      const hasMinDelay = belowMin.every(f => f.delay === 10)
      expect(hasMinDelay).toBe(true)
    })

    it('should apply large delays correctly', () => {
      const frames = createMockFrames(10, 100)
      const largeDelay = 5000

      const large = setUniformDelay(frames, largeDelay)

      const hasLargeDelay = large.every(f => f.delay === largeDelay)
      expect(hasLargeDelay).toBe(true)
    })
  })

  describe('getTotalDuration', () => {
    it('should calculate correct duration for mixed delays', () => {
      const frames = [
        createTestFrame(100, 100, [255, 0, 0, 255], 100),
        createTestFrame(100, 100, [0, 255, 0, 255], 200),
        createTestFrame(100, 100, [0, 0, 255, 255], 150),
      ]

      const duration = getTotalDuration(frames)
      expect(duration).toBe(450)
    })

    it('should return 0 for empty frames array', () => {
      const duration = getTotalDuration([])
      expect(duration).toBe(0)
    })

    it('should return correct duration for single frame', () => {
      const frames = [createTestFrame(100, 100, [128, 128, 128, 255], 100)]
      const duration = getTotalDuration(frames)
      expect(duration).toBe(100)
    })
  })

  describe('getAverageFps', () => {
    it('should calculate 10 fps for 100ms delay', () => {
      const frames = createMockFrames(10, 100)
      const fps = getAverageFps(frames)
      expect(fps).toBe(10)
    })

    it('should calculate correct fps for variable delays', () => {
      const frames = [
        createTestFrame(100, 100, [255, 0, 0, 255], 100),
        createTestFrame(100, 100, [0, 255, 0, 255], 50),
        createTestFrame(100, 100, [0, 0, 255, 255], 200),
      ]
      const fps = getAverageFps(frames)
      // Average delay = 350/3 = 116.67ms = ~8.57 fps, rounds to 9
      expect(fps).toBe(9)
    })

    it('should calculate correct fps for fast animation (~60fps)', () => {
      const frames = createMockFrames(10, 16)
      const fps = getAverageFps(frames)
      const expectedFps = Math.round(1000 / 16)
      expect(fps).toBe(expectedFps)
    })
  })

  describe('integration', () => {
    it('should maintain consistent duration ratios across multipliers', () => {
      const frames = createMockFrames(10, 100)
      const originalDuration = getTotalDuration(frames)
      const multipliers = [0.25, 0.5, 1, 1.5, 2, 4]

      for (const multiplier of multipliers) {
        const adjusted = adjustSpeed(frames, multiplier)
        const newDuration = getTotalDuration(adjusted)
        const expectedDuration = originalDuration / multiplier

        expect(newDuration).toBeCloseTo(expectedDuration, -1)
      }
    })

    it('should allow switching from speed multiplier to uniform delay', () => {
      const frames = createMockFrames(10, 100)
      const sped = adjustSpeed(frames, 2)
      const uniform = setUniformDelay(sped, 50)

      expect(getTotalDuration(uniform)).toBe(sped.length * 50)
    })

    it('should preserve frame quality after speed adjustment', () => {
      const frames = createMockFrames(5, 100)
      const adjusted = adjustSpeed(frames, 1.5)

      for (let i = 0; i < adjusted.length; i++) {
        expect(adjusted[i].imageData.width).toBe(frames[i].imageData.width)
        expect(adjusted[i].imageData.height).toBe(frames[i].imageData.height)
        expect(adjusted[i].imageData.data.length).toBe(frames[i].imageData.data.length)
      }
    })

    it('should handle rapid speed changes correctly', () => {
      const frames = createMockFrames(10, 100)
      let current = frames
      const changes = [2, 0.5, 1.5, 0.75, 1]

      for (const change of changes) {
        current = adjustSpeed(current, change)
        expect(current.length).toBe(frames.length)
        expect(getTotalDuration(current)).toBeGreaterThan(0)
      }
    })
  })
})
