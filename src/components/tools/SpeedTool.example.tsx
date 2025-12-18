/**
 * Example usage of SpeedTool component
 *
 * This demonstrates how to integrate the SpeedTool into your app
 * to adjust animation playback speed or set uniform frame delays.
 */

import { useState } from 'react';
import { SpeedTool } from './SpeedTool';
import type { Frame } from '../../types';

/**
 * Example: Using SpeedTool with decoded frames
 */
export function SpeedToolExample() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(false);

  // Example: Load frames from a file
  const loadFramesFromFile = async (file: File) => {
    setLoading(true);
    try {
      // You would use your decoder here
      // const decoded = await decodeFile(file);
      // setFrames(decoded.frames);

      // For demo purposes, create sample frames
      const sampleFrames = createSampleFrames(20, 100);
      setFrames(sampleFrames);
    } catch (error) {
      console.error('Failed to load frames:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFramesChange = (newFrames: Frame[]) => {
    setFrames(newFrames);
    console.log('Speed adjusted! New duration:', getTotalDuration(newFrames), 'ms');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Speed Tool Demo</h1>

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

        {/* SpeedTool component */}
        {!loading && frames.length > 0 && (
          <SpeedTool frames={frames} onFramesChange={handleFramesChange} />
        )}

        {/* Info */}
        {frames.length > 0 && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Animation Info</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>Total frames: {frames.length}</li>
              <li>Duration: {getTotalDuration(frames)}ms</li>
              <li>Average FPS: {getAverageFps(frames)}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Simple integration with existing frames
 */
export function SimpleSpeedToolExample({ frames }: { frames: Frame[] }) {
  const [modifiedFrames, setModifiedFrames] = useState<Frame[]>(frames);

  return (
    <div className="p-6 bg-gray-900">
      <SpeedTool frames={modifiedFrames} onFramesChange={setModifiedFrames} />
    </div>
  );
}

/**
 * Helper: Create sample frames for demo
 */
function createSampleFrames(count: number, delay: number): Frame[] {
  const frames: Frame[] = [];
  const width = 100;
  const height = 100;

  for (let i = 0; i < count; i++) {
    const imageData = new ImageData(width, height);
    const progress = i / count;

    // Create a simple gradient animation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const distance = Math.sqrt(
          Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
        );
        const wave = Math.sin(distance * 0.1 + progress * Math.PI * 2) * 0.5 + 0.5;

        imageData.data[idx] = Math.round(wave * 255); // R
        imageData.data[idx + 1] = Math.round((1 - wave) * 255); // G
        imageData.data[idx + 2] = Math.round(progress * 255); // B
        imageData.data[idx + 3] = 255; // A
      }
    }

    frames.push({
      imageData,
      delay,
    });
  }

  return frames;
}

/**
 * Helper: Get total duration of animation
 */
function getTotalDuration(frames: Frame[]): number {
  return frames.reduce((sum, frame) => sum + frame.delay, 0);
}

/**
 * Helper: Get average FPS
 */
function getAverageFps(frames: Frame[]): number {
  const avgDelay = getTotalDuration(frames) / frames.length;
  return Math.round(1000 / avgDelay);
}
