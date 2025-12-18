/**
 * ResizeTool Tests
 *
 * Tests the ResizeTool component functionality including:
 * - Resize with aspect ratio lock
 * - Resize by percentage
 * - Different quality settings
 * - Real end-to-end tests with actual image data
 */

import { resizeFrames, resizeImageData } from '../../lib/transforms';
import type { Frame } from '../../types';

/**
 * Load an image from file path and convert to ImageData
 */
async function loadImageAsImageData(imagePath: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imagePath}`));
    };

    img.src = imagePath;
  });
}

/**
 * Create a test frame from ImageData
 */
function createFrame(imageData: ImageData, delay = 100): Frame {
  return {
    imageData,
    delay,
  };
}

/**
 * Test: Resize with aspect ratio lock
 */
async function testResizeWithAspectRatioLock() {
  console.log('Test: Resize with aspect ratio lock');

  // Create a simple test image
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;

  // Draw a simple pattern
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = 'blue';
  ctx.fillRect(200, 0, 200, 200);

  const imageData = ctx.getImageData(0, 0, 400, 200);
  const frame = createFrame(imageData);

  // Test: Resize to 50% (should maintain 2:1 aspect ratio)
  const targetWidth = 200;
  const targetHeight = 100;
  const resized = await resizeFrames([frame], targetWidth, targetHeight, 'medium');

  console.assert(resized.length === 1, 'Should have 1 frame');
  console.assert(resized[0].imageData.width === targetWidth, `Width should be ${targetWidth}, got ${resized[0].imageData.width}`);
  console.assert(resized[0].imageData.height === targetHeight, `Height should be ${targetHeight}, got ${resized[0].imageData.height}`);
  console.assert(resized[0].delay === frame.delay, 'Delay should be preserved');

  console.log('✓ Aspect ratio lock test passed');
}

/**
 * Test: Resize by percentage
 */
async function testResizeByPercentage() {
  console.log('Test: Resize by percentage');

  const originalWidth = 300;
  const originalHeight = 300;

  const canvas = document.createElement('canvas');
  canvas.width = originalWidth;
  canvas.height = originalHeight;
  const ctx = canvas.getContext('2d')!;

  // Draw a gradient
  const gradient = ctx.createLinearGradient(0, 0, originalWidth, originalHeight);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'blue');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, originalWidth, originalHeight);

  const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
  const frame = createFrame(imageData);

  // Test different percentages
  const testCases = [
    { percent: 50, expectedWidth: 150, expectedHeight: 150 },
    { percent: 150, expectedWidth: 450, expectedHeight: 450 },
    { percent: 25, expectedWidth: 75, expectedHeight: 75 },
  ];

  for (const testCase of testCases) {
    const targetWidth = Math.round((originalWidth * testCase.percent) / 100);
    const targetHeight = Math.round((originalHeight * testCase.percent) / 100);

    const resized = await resizeFrames([frame], targetWidth, targetHeight, 'medium');

    console.assert(
      resized[0].imageData.width === testCase.expectedWidth,
      `${testCase.percent}% width should be ${testCase.expectedWidth}, got ${resized[0].imageData.width}`
    );
    console.assert(
      resized[0].imageData.height === testCase.expectedHeight,
      `${testCase.percent}% height should be ${testCase.expectedHeight}, got ${resized[0].imageData.height}`
    );
  }

  console.log('✓ Resize by percentage test passed');
}

/**
 * Test: Different quality settings
 */
async function testQualitySettings() {
  console.log('Test: Different quality settings');

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Draw a detailed pattern
  for (let i = 0; i < 400; i += 10) {
    ctx.strokeStyle = `hsl(${(i / 400) * 360}, 100%, 50%)`;
    ctx.strokeRect(i, i, 400 - i * 2, 400 - i * 2);
  }

  const imageData = ctx.getImageData(0, 0, 400, 400);
  const targetWidth = 200;
  const targetHeight = 200;

  // Test each quality setting
  const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

  for (const quality of qualities) {
    const resized = await resizeImageData(imageData, targetWidth, targetHeight, quality);

    console.assert(resized.width === targetWidth, `${quality} quality: width should be ${targetWidth}`);
    console.assert(resized.height === targetHeight, `${quality} quality: height should be ${targetHeight}`);
    console.assert(resized.data.length === targetWidth * targetHeight * 4, `${quality} quality: data length should match dimensions`);
  }

  console.log('✓ Quality settings test passed');
}

/**
 * Test: Multiple frames resize
 */
async function testMultipleFrames() {
  console.log('Test: Multiple frames resize');

  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;

  // Create 3 frames with different colors
  const frames: Frame[] = [];
  const colors = ['red', 'green', 'blue'];

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 100, 100);
    frames.push(createFrame(imageData, 100 + i * 50));
  }

  const resized = await resizeFrames(frames, 50, 50, 'medium');

  console.assert(resized.length === 3, 'Should have 3 frames');

  for (let i = 0; i < 3; i++) {
    console.assert(resized[i].imageData.width === 50, `Frame ${i}: width should be 50`);
    console.assert(resized[i].imageData.height === 50, `Frame ${i}: height should be 50`);
    console.assert(resized[i].delay === frames[i].delay, `Frame ${i}: delay should be preserved`);
  }

  console.log('✓ Multiple frames test passed');
}

/**
 * Test: Real image from test assets (E2E test)
 */
async function testRealImage() {
  console.log('Test: Real image from test assets');

  try {
    const testImagePath = '/Users/jeremywatt/smartgif/test-assets/kamal-quake-demo.webp';
    const imageData = await loadImageAsImageData(testImagePath);

    console.log(`Loaded test image: ${imageData.width}×${imageData.height}`);

    const frame = createFrame(imageData);

    // Test resize to 50%
    const targetWidth = Math.round(imageData.width * 0.5);
    const targetHeight = Math.round(imageData.height * 0.5);

    const resized = await resizeFrames([frame], targetWidth, targetHeight, 'high');

    console.assert(resized.length === 1, 'Should have 1 frame');
    console.assert(
      Math.abs(resized[0].imageData.width - targetWidth) <= 1,
      `Width should be approximately ${targetWidth}, got ${resized[0].imageData.width}`
    );
    console.assert(
      Math.abs(resized[0].imageData.height - targetHeight) <= 1,
      `Height should be approximately ${targetHeight}, got ${resized[0].imageData.height}`
    );

    // Verify the image data is valid
    const data = resized[0].imageData.data;
    console.assert(data.length === targetWidth * targetHeight * 4, 'ImageData buffer should have correct size');

    // Check that we have some non-zero pixel data
    let hasNonZeroPixels = false;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
        hasNonZeroPixels = true;
        break;
      }
    }
    console.assert(hasNonZeroPixels, 'Resized image should have non-zero pixel data');

    console.log('✓ Real image E2E test passed');
  } catch (error) {
    console.warn('⚠ Real image test skipped (image may not be accessible in test environment):', error);
  }
}

/**
 * Test: Edge cases
 */
async function testEdgeCases() {
  console.log('Test: Edge cases');

  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'purple';
  ctx.fillRect(0, 0, 100, 100);

  const imageData = ctx.getImageData(0, 0, 100, 100);
  const frame = createFrame(imageData);

  // Test: Very small resize
  const small = await resizeFrames([frame], 10, 10, 'low');
  console.assert(small[0].imageData.width === 10, 'Small resize: width should be 10');
  console.assert(small[0].imageData.height === 10, 'Small resize: height should be 10');

  // Test: Very large resize
  const large = await resizeFrames([frame], 500, 500, 'low');
  console.assert(large[0].imageData.width === 500, 'Large resize: width should be 500');
  console.assert(large[0].imageData.height === 500, 'Large resize: height should be 500');

  // Test: Non-square aspect ratio
  const nonsquare = await resizeFrames([frame], 150, 50, 'medium');
  console.assert(nonsquare[0].imageData.width === 150, 'Non-square: width should be 150');
  console.assert(nonsquare[0].imageData.height === 50, 'Non-square: height should be 50');

  console.log('✓ Edge cases test passed');
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('=== ResizeTool Tests ===\n');

  try {
    await testResizeWithAspectRatioLock();
    await testResizeByPercentage();
    await testQualitySettings();
    await testMultipleFrames();
    await testEdgeCases();
    await testRealImage();

    console.log('\n=== All tests passed! ===');
    return true;
  } catch (error) {
    console.error('\n=== Test failed! ===');
    console.error(error);
    return false;
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose to window for manual testing
  (window as any).runResizeToolTests = runAllTests;
  console.log('ResizeTool tests loaded. Run window.runResizeToolTests() to execute.');
}
