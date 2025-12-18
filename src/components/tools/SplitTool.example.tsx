/**
 * Example usage of SplitTool component
 *
 * This demonstrates how to integrate the SplitTool into your app
 * to extract and download individual frames from an animated image.
 */

import { useState } from 'react';
import { SplitTool } from './SplitTool';
import type { Frame } from '../../types';

/**
 * Example: Using SplitTool with decoded frames
 */
export function SplitToolExample() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(false);

  // Example: Load frames from a file
  const loadFramesFromFile = async (file: File) => {
    setLoading(true);
    try {
      // You would use your decoder here
      // const decoded = await decodeAnimatedImage(file);
      // setFrames(decoded.frames);

      // For demo purposes, create sample frames
      const sampleFrames = createSampleFrames(10);
      setFrames(sampleFrames);
    } catch (error) {
      console.error('Failed to load frames:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Frame Split Tool Demo</h1>

        {/* File input */}
        <div className="mb-8">
          <input
            type="file"
            accept="image/gif,image/webp,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFramesFromFile(file);
            }}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            Loading frames...
          </div>
        )}

        {/* SplitTool component */}
        {!loading && frames.length > 0 && (
          <SplitTool frames={frames} filename="my-animation" />
        )}
      </div>
    </div>
  );
}

/**
 * Helper: Create sample frames for demo
 */
function createSampleFrames(count: number): Frame[] {
  const frames: Frame[] = [];
  const width = 100;
  const height = 100;

  for (let i = 0; i < count; i++) {
    const imageData = new ImageData(width, height);
    const hue = (i / count) * 360;

    // Fill with gradient based on frame index
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (x + y) / (width + height);

        const [r, g, b] = hslToRgb(hue / 360, 1, brightness);
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
      }
    }

    frames.push({
      imageData,
      delay: 100, // 100ms per frame
    });
  }

  return frames;
}

/**
 * Helper: Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 1/6) {
    [r, g, b] = [c, x, 0];
  } else if (h < 2/6) {
    [r, g, b] = [x, c, 0];
  } else if (h < 3/6) {
    [r, g, b] = [0, c, x];
  } else if (h < 4/6) {
    [r, g, b] = [0, x, c];
  } else if (h < 5/6) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Example: Using SplitTool with existing frames
 */
export function SimpleSplitToolExample({ frames }: { frames: Frame[] }) {
  return (
    <div className="p-6 bg-gray-900">
      <SplitTool frames={frames} filename="animation" />
    </div>
  );
}
