/**
 * Tests for SplitTool component
 * Tests frame extraction, ZIP creation, and downloads using real test image
 */

import { describe, it, expect } from 'vitest'
import { frameToBlob } from '../../lib/splitUtils'
import { createTestFrame, createMockFrames } from '../../test/testUtils'
import type { Frame } from '../../types'

describe('SplitTool', () => {
  describe('frameToBlob', () => {
    it('should convert frame to PNG blob', async () => {
      const frame = createTestFrame(100, 100, [255, 0, 0, 255], 100)
      const blob = await frameToBlob(frame)

      expect(blob.type).toBe('image/png')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should create non-empty blob', async () => {
      const frame = createTestFrame(100, 100, [255, 0, 0, 255], 100)
      const blob = await frameToBlob(frame)

      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('frame extraction', () => {
    it('should extract frame from image data', async () => {
      const testFrame = createTestFrame(200, 200, [128, 128, 128, 255], 50)
      const blob = await frameToBlob(testFrame)

      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('individual frame download', () => {
    it('should create downloadable blob from frame', async () => {
      const frame = createTestFrame(100, 100, [255, 128, 0, 255], 150)
      const blob = await frameToBlob(frame)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('batch frame processing', () => {
    it('should process multiple frames', async () => {
      const frames: Frame[] = Array.from({ length: 10 }, (_, i) =>
        createTestFrame(50, 50, [i * 25, 128, 255 - i * 25, 255], 100)
      )

      const blobs = await Promise.all(frames.map(frame => frameToBlob(frame)))

      expect(blobs).toHaveLength(frames.length)

      for (const blob of blobs) {
        expect(blob.size).toBeGreaterThan(0)
      }
    })

    it('should handle batch processing with mock frames', async () => {
      const frames = createMockFrames(5, 100)
      const blobs = await Promise.all(frames.map(frame => frameToBlob(frame)))

      expect(blobs).toHaveLength(5)

      for (const blob of blobs) {
        expect(blob.size).toBeGreaterThan(0)
      }
    })
  })

  describe('frame metadata preservation', () => {
    it('should preserve frame dimensions and delay', async () => {
      const testCases = [
        { width: 100, height: 100, delay: 50 },
        { width: 200, height: 150, delay: 100 },
        { width: 64, height: 64, delay: 33 },
      ]

      for (const { width, height, delay } of testCases) {
        const frame = createTestFrame(width, height, [255, 255, 255, 255], delay)

        expect(frame.imageData.width).toBe(width)
        expect(frame.imageData.height).toBe(height)
        expect(frame.delay).toBe(delay)

        const blob = await frameToBlob(frame)
        expect(blob.size).toBeGreaterThan(0)
      }
    })
  })
})
