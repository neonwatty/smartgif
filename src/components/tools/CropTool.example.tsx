/**
 * Example usage of CropTool component
 *
 * This example demonstrates how to integrate CropTool into your application.
 */

import { useState } from 'react';
import { CropTool } from './CropTool';
import type { Frame } from '../../types';

/**
 * Example: Load an image and use CropTool
 */
export function CropToolExample() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [croppedFrames, setCroppedFrames] = useState<Frame[]>([]);

  // Load an image file
  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const frame: Frame = {
        imageData,
        delay: 100,
      };

      setFrames([frame]);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">CropTool Example</h1>

          {/* File input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Load an image to crop
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileLoad}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        </div>

        {/* CropTool Component */}
        {frames.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <CropTool
              frames={frames}
              onFramesChange={(newFrames) => {
                setCroppedFrames(newFrames);
                console.log('Cropped frames:', newFrames);
              }}
            />
          </div>
        )}

        {/* Display cropped result */}
        {croppedFrames.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Cropped Result</h2>
            <div className="bg-gray-700 rounded p-4 flex items-center justify-center">
              <canvas
                ref={(canvas) => {
                  if (canvas && croppedFrames[0]) {
                    canvas.width = croppedFrames[0].imageData.width;
                    canvas.height = croppedFrames[0].imageData.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.putImageData(croppedFrames[0].imageData, 0, 0);
                    }
                  }
                }}
                className="max-w-full border border-gray-600"
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Dimensions: {croppedFrames[0].imageData.width} x{' '}
              {croppedFrames[0].imageData.height}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Using CropTool with multiple frames (GIF/animation)
 */
export function CropToolMultiFrameExample() {
  const [frames, setFrames] = useState<Frame[]>([]);

  // Create some sample animated frames
  const createSampleFrames = () => {
    const sampleFrames: Frame[] = [];

    for (let i = 0; i < 5; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d')!;

      // Draw different colored frames
      const hue = (i * 72) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(0, 0, 400, 300);

      // Draw frame number
      ctx.fillStyle = 'white';
      ctx.font = '48px sans-serif';
      ctx.fillText(`Frame ${i + 1}`, 150, 160);

      const imageData = ctx.getImageData(0, 0, 400, 300);
      sampleFrames.push({
        imageData,
        delay: 200,
      });
    }

    setFrames(sampleFrames);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Multi-Frame CropTool Example
          </h1>

          <button
            onClick={createSampleFrames}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Sample Animation Frames
          </button>
        </div>

        {frames.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-4">
              Loaded {frames.length} frames. Crop will be applied to all frames.
            </p>
            <CropTool
              frames={frames}
              onFramesChange={(croppedFrames) => {
                console.log(`Cropped ${croppedFrames.length} frames`);
                // Update your state with cropped frames
                setFrames(croppedFrames);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Programmatic cropping without UI
 */
export function ProgrammaticCropExample() {
  const runExample = async () => {
    // Import the utility functions
    const { cropFrames, autoCrop, getAspectRatioRect, ASPECT_RATIOS } = await import(
      '../../lib/transforms'
    );

    // Assume you have frames loaded
    const frames: Frame[] = []; // Your frames here

    // Example 1: Auto-crop to remove transparent edges
    if (frames[0]) {
      const autoCropRect = autoCrop(frames[0].imageData, 0);
      const autoCropped = cropFrames(frames, autoCropRect);
      console.log('Auto-cropped:', autoCropped);
    }

    // Example 2: Crop to 16:9 aspect ratio
    if (frames[0]) {
      const { width, height } = frames[0].imageData;
      const rect16x9 = getAspectRatioRect(width, height, ASPECT_RATIOS['16:9'], true);
      const cropped16x9 = cropFrames(frames, rect16x9);
      console.log('16:9 crop:', cropped16x9);
    }

    // Example 3: Manual crop coordinates
    const manualCrop = cropFrames(frames, {
      x: 100,
      y: 100,
      width: 400,
      height: 300,
    });
    console.log('Manual crop:', manualCrop);
  };

  // Example function available for documentation
  void runExample;
  return null;
}
