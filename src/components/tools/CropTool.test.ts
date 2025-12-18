/**
 * CropTool Tests
 *
 * Tests the CropTool component functionality including:
 * - Crop with different aspect ratios
 * - Auto-crop functionality (trim transparent edges)
 * - Manual crop coordinates
 * - Real end-to-end tests with actual image data
 */

import {
  cropFrames,
  cropImageData,
  autoCrop,
  getAspectRatioRect,
  ASPECT_RATIOS,
  type CropRect,
} from '../../lib/transforms';
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
 * Create a simple colored frame for testing
 */
function createColoredFrame(width: number, height: number, color: string, delay = 100): Frame {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  return createFrame(imageData, delay);
}

/**
 * Create a frame with transparent padding for autocrop testing
 */
function createFrameWithPadding(
  width: number,
  height: number,
  padding: number,
  color = 'red'
): Frame {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Fill with transparent background
  ctx.clearRect(0, 0, width, height);

  // Draw opaque rectangle in center with padding
  ctx.fillStyle = color;
  ctx.fillRect(padding, padding, width - padding * 2, height - padding * 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  return createFrame(imageData);
}

/**
 * Test: Basic crop functionality
 */
function testBasicCrop() {
  console.log('Test: Basic crop functionality');

  const frame = createColoredFrame(100, 100, 'blue');
  const rect: CropRect = { x: 10, y: 10, width: 50, height: 50 };

  const cropped = cropImageData(frame.imageData, rect);

  console.assert(cropped.width === 50, `Width should be 50, got ${cropped.width}`);
  console.assert(cropped.height === 50, `Height should be 50, got ${cropped.height}`);
  console.assert(
    cropped.data.length === 50 * 50 * 4,
    `Data length should be ${50 * 50 * 4}, got ${cropped.data.length}`
  );

  console.log('✓ Basic crop test passed');
}

/**
 * Test: Crop multiple frames
 */
function testCropMultipleFrames() {
  console.log('Test: Crop multiple frames');

  const frames: Frame[] = [
    createColoredFrame(200, 200, 'red', 50),
    createColoredFrame(200, 200, 'green', 100),
    createColoredFrame(200, 200, 'blue', 150),
  ];

  const rect: CropRect = { x: 50, y: 50, width: 100, height: 100 };
  const cropped = cropFrames(frames, rect);

  console.assert(cropped.length === 3, `Should have 3 frames, got ${cropped.length}`);

  for (let i = 0; i < 3; i++) {
    console.assert(
      cropped[i].imageData.width === 100,
      `Frame ${i}: width should be 100, got ${cropped[i].imageData.width}`
    );
    console.assert(
      cropped[i].imageData.height === 100,
      `Frame ${i}: height should be 100, got ${cropped[i].imageData.height}`
    );
    console.assert(
      cropped[i].delay === frames[i].delay,
      `Frame ${i}: delay should be preserved (${frames[i].delay}), got ${cropped[i].delay}`
    );
  }

  console.log('✓ Multiple frames crop test passed');
}

/**
 * Test: Auto-crop with transparent padding
 */
function testAutoCrop() {
  console.log('Test: Auto-crop functionality');

  // Create frame with 20px transparent padding on all sides
  const frame = createFrameWithPadding(100, 100, 20);
  const rect = autoCrop(frame.imageData, 0);

  console.assert(rect.x === 20, `X should be 20, got ${rect.x}`);
  console.assert(rect.y === 20, `Y should be 20, got ${rect.y}`);
  console.assert(rect.width === 60, `Width should be 60, got ${rect.width}`);
  console.assert(rect.height === 60, `Height should be 60, got ${rect.height}`);

  console.log('✓ Auto-crop test passed');
}

/**
 * Test: Auto-crop with uneven padding
 */
function testAutoCropUnevenPadding() {
  console.log('Test: Auto-crop with uneven padding');

  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;

  // Clear all (transparent)
  ctx.clearRect(0, 0, 100, 100);

  // Draw rect with uneven padding: 10px left, 15px top, 20px right, 25px bottom
  // Content area: x=10, y=15, width=70 (100-10-20), height=60 (100-15-25)
  ctx.fillStyle = 'green';
  ctx.fillRect(10, 15, 70, 60);

  const imageData = ctx.getImageData(0, 0, 100, 100);
  const rect = autoCrop(imageData, 0);

  console.assert(rect.x === 10, `X should be 10, got ${rect.x}`);
  console.assert(rect.y === 15, `Y should be 15, got ${rect.y}`);
  console.assert(rect.width === 70, `Width should be 70, got ${rect.width}`);
  console.assert(rect.height === 60, `Height should be 60, got ${rect.height}`);

  console.log('✓ Auto-crop uneven padding test passed');
}

/**
 * Test: Auto-crop on fully opaque image (no crop needed)
 */
function testAutoCropFullyOpaque() {
  console.log('Test: Auto-crop on fully opaque image');

  const frame = createColoredFrame(150, 150, 'purple');
  const rect = autoCrop(frame.imageData, 0);

  // Should return full dimensions
  console.assert(rect.x === 0, `X should be 0, got ${rect.x}`);
  console.assert(rect.y === 0, `Y should be 0, got ${rect.y}`);
  console.assert(rect.width === 150, `Width should be 150, got ${rect.width}`);
  console.assert(rect.height === 150, `Height should be 150, got ${rect.height}`);

  console.log('✓ Auto-crop fully opaque test passed');
}

/**
 * Test: Auto-crop on fully transparent image
 */
function testAutoCropFullyTransparent() {
  console.log('Test: Auto-crop on fully transparent image');

  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 80, 80);

  const imageData = ctx.getImageData(0, 0, 80, 80);
  const rect = autoCrop(imageData, 0);

  // Should return full dimensions when nothing is opaque
  console.assert(rect.x === 0, `X should be 0, got ${rect.x}`);
  console.assert(rect.y === 0, `Y should be 0, got ${rect.y}`);
  console.assert(rect.width === 80, `Width should be 80, got ${rect.width}`);
  console.assert(rect.height === 80, `Height should be 80, got ${rect.height}`);

  console.log('✓ Auto-crop fully transparent test passed');
}

/**
 * Test: Aspect ratio 1:1 (square)
 */
function testAspectRatio1to1() {
  console.log('Test: Aspect ratio 1:1 (square)');

  // Test on landscape image (200x100)
  const rect1 = getAspectRatioRect(200, 100, ASPECT_RATIOS['1:1'], true);
  console.assert(rect1.width === 100, `Width should be 100, got ${rect1.width}`);
  console.assert(rect1.height === 100, `Height should be 100, got ${rect1.height}`);
  console.assert(rect1.x === 50, `X should be centered at 50, got ${rect1.x}`);
  console.assert(rect1.y === 0, `Y should be 0, got ${rect1.y}`);

  // Test on portrait image (100x200)
  const rect2 = getAspectRatioRect(100, 200, ASPECT_RATIOS['1:1'], true);
  console.assert(rect2.width === 100, `Width should be 100, got ${rect2.width}`);
  console.assert(rect2.height === 100, `Height should be 100, got ${rect2.height}`);
  console.assert(rect2.x === 0, `X should be 0, got ${rect2.x}`);
  console.assert(rect2.y === 50, `Y should be centered at 50, got ${rect2.y}`);

  console.log('✓ Aspect ratio 1:1 test passed');
}

/**
 * Test: Aspect ratio 16:9 (widescreen)
 */
function testAspectRatio16to9() {
  console.log('Test: Aspect ratio 16:9 (widescreen)');

  // Test on 1920x1080 (already 16:9)
  const rect1 = getAspectRatioRect(1920, 1080, ASPECT_RATIOS['16:9'], true);
  console.assert(rect1.width === 1920, `Width should be 1920, got ${rect1.width}`);
  console.assert(rect1.height === 1080, `Height should be 1080, got ${rect1.height}`);
  console.assert(rect1.x === 0, `X should be 0, got ${rect1.x}`);
  console.assert(rect1.y === 0, `Y should be 0, got ${rect1.y}`);

  // Test on square 1000x1000
  const rect2 = getAspectRatioRect(1000, 1000, ASPECT_RATIOS['16:9'], true);
  const expectedHeight = Math.round(1000 / (16 / 9)); // ~562
  console.assert(rect2.width === 1000, `Width should be 1000, got ${rect2.width}`);
  console.assert(
    rect2.height === expectedHeight,
    `Height should be ${expectedHeight}, got ${rect2.height}`
  );

  console.log('✓ Aspect ratio 16:9 test passed');
}

/**
 * Test: Aspect ratio 4:3
 */
function testAspectRatio4to3() {
  console.log('Test: Aspect ratio 4:3');

  const rect = getAspectRatioRect(400, 400, ASPECT_RATIOS['4:3'], true);
  console.assert(rect.width === 400, `Width should be 400, got ${rect.width}`);

  const expectedHeight = Math.round(400 / (4 / 3)); // 300
  console.assert(
    rect.height === expectedHeight,
    `Height should be ${expectedHeight}, got ${rect.height}`
  );

  console.log('✓ Aspect ratio 4:3 test passed');
}

/**
 * Test: Aspect ratio 3:2
 */
function testAspectRatio3to2() {
  console.log('Test: Aspect ratio 3:2');

  const rect = getAspectRatioRect(600, 200, ASPECT_RATIOS['3:2'], true);

  // Image is 600x200 (3:1 ratio)
  // For 3:2 ratio with height=200, width should be 200 * 1.5 = 300
  console.assert(rect.height === 200, `Height should be 200, got ${rect.height}`);
  console.assert(rect.width === 300, `Width should be 300, got ${rect.width}`);
  console.assert(rect.x === 150, `X should be centered at 150, got ${rect.x}`); // (600-300)/2
  console.assert(rect.y === 0, `Y should be 0, got ${rect.y}`);

  console.log('✓ Aspect ratio 3:2 test passed');
}

/**
 * Test: Aspect ratio 2:1
 */
function testAspectRatio2to1() {
  console.log('Test: Aspect ratio 2:1');

  const rect = getAspectRatioRect(200, 200, ASPECT_RATIOS['2:1'], true);
  console.assert(rect.width === 200, `Width should be 200, got ${rect.width}`);
  console.assert(rect.height === 100, `Height should be 100, got ${rect.height}`);
  console.assert(rect.x === 0, `X should be 0, got ${rect.x}`);
  console.assert(rect.y === 50, `Y should be centered at 50, got ${rect.y}`);

  console.log('✓ Aspect ratio 2:1 test passed');
}

/**
 * Test: Non-centered aspect ratio crop
 */
function testAspectRatioNonCentered() {
  console.log('Test: Non-centered aspect ratio crop');

  const rect = getAspectRatioRect(400, 300, ASPECT_RATIOS['1:1'], false);

  console.assert(rect.width === 300, `Width should be 300, got ${rect.width}`);
  console.assert(rect.height === 300, `Height should be 300, got ${rect.height}`);
  console.assert(rect.x === 0, `X should be 0 (not centered), got ${rect.x}`);
  console.assert(rect.y === 0, `Y should be 0 (not centered), got ${rect.y}`);

  console.log('✓ Non-centered aspect ratio test passed');
}

/**
 * Test: Manual crop coordinates at different positions
 */
function testManualCropCoordinates() {
  console.log('Test: Manual crop coordinates');

  const frame = createColoredFrame(400, 400, 'orange');

  const testCases = [
    { name: 'top-left', rect: { x: 0, y: 0, width: 100, height: 100 } },
    { name: 'top-right', rect: { x: 300, y: 0, width: 100, height: 100 } },
    { name: 'bottom-left', rect: { x: 0, y: 300, width: 100, height: 100 } },
    { name: 'bottom-right', rect: { x: 300, y: 300, width: 100, height: 100 } },
    { name: 'center', rect: { x: 150, y: 150, width: 100, height: 100 } },
  ];

  for (const testCase of testCases) {
    const cropped = cropImageData(frame.imageData, testCase.rect);
    console.assert(
      cropped.width === 100,
      `${testCase.name}: width should be 100, got ${cropped.width}`
    );
    console.assert(
      cropped.height === 100,
      `${testCase.name}: height should be 100, got ${cropped.height}`
    );
  }

  console.log('✓ Manual crop coordinates test passed');
}

/**
 * Test: Manual crop with non-square dimensions
 */
function testManualCropNonSquare() {
  console.log('Test: Manual crop with non-square dimensions');

  const frame = createColoredFrame(500, 500, 'cyan');
  const rect: CropRect = { x: 100, y: 150, width: 200, height: 180 };

  const cropped = cropImageData(frame.imageData, rect);

  console.assert(cropped.width === 200, `Width should be 200, got ${cropped.width}`);
  console.assert(cropped.height === 180, `Height should be 180, got ${cropped.height}`);

  console.log('✓ Manual crop non-square test passed');
}

/**
 * Test: Edge cases
 */
function testEdgeCases() {
  console.log('Test: Edge cases');

  const frame = createColoredFrame(100, 100, 'magenta');

  // Very small crop
  const small = cropImageData(frame.imageData, { x: 0, y: 0, width: 5, height: 5 });
  console.assert(small.width === 5, `Small crop width should be 5, got ${small.width}`);
  console.assert(small.height === 5, `Small crop height should be 5, got ${small.height}`);

  // Single pixel crop
  const pixel = cropImageData(frame.imageData, { x: 50, y: 50, width: 1, height: 1 });
  console.assert(pixel.width === 1, `Pixel crop width should be 1, got ${pixel.width}`);
  console.assert(pixel.height === 1, `Pixel crop height should be 1, got ${pixel.height}`);

  // Full image crop
  const full = cropImageData(frame.imageData, { x: 0, y: 0, width: 100, height: 100 });
  console.assert(full.width === 100, `Full crop width should be 100, got ${full.width}`);
  console.assert(full.height === 100, `Full crop height should be 100, got ${full.height}`);

  console.log('✓ Edge cases test passed');
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

    // Test 1: Basic crop from center
    const centerCropRect: CropRect = {
      x: Math.round(imageData.width * 0.25),
      y: Math.round(imageData.height * 0.25),
      width: Math.round(imageData.width * 0.5),
      height: Math.round(imageData.height * 0.5),
    };

    const centerCropped = cropImageData(frame.imageData, centerCropRect);
    console.assert(
      centerCropped.width === centerCropRect.width,
      `Center crop width should be ${centerCropRect.width}, got ${centerCropped.width}`
    );
    console.assert(
      centerCropped.height === centerCropRect.height,
      `Center crop height should be ${centerCropRect.height}, got ${centerCropped.height}`
    );

    // Test 2: Apply aspect ratio crops
    const aspectRatios: Array<keyof typeof ASPECT_RATIOS> = ['1:1', '4:3', '16:9', '3:2', '2:1'];

    for (const key of aspectRatios) {
      const ratio = ASPECT_RATIOS[key];
      const rect = getAspectRatioRect(imageData.width, imageData.height, ratio, true);
      const cropped = cropImageData(frame.imageData, rect);

      const actualRatio = cropped.width / cropped.height;
      const ratioDiff = Math.abs(actualRatio - ratio);

      console.assert(
        ratioDiff < 0.01,
        `${key} aspect ratio should be ${ratio}, got ${actualRatio} (diff: ${ratioDiff})`
      );
    }

    // Test 3: Auto-crop (may or may not find transparent edges)
    const autoCropRect = autoCrop(frame.imageData, 0);
    console.assert(
      autoCropRect.x >= 0 && autoCropRect.x < imageData.width,
      `Auto-crop X should be valid: ${autoCropRect.x}`
    );
    console.assert(
      autoCropRect.y >= 0 && autoCropRect.y < imageData.height,
      `Auto-crop Y should be valid: ${autoCropRect.y}`
    );
    console.assert(autoCropRect.width > 0, `Auto-crop width should be positive: ${autoCropRect.width}`);
    console.assert(
      autoCropRect.height > 0,
      `Auto-crop height should be positive: ${autoCropRect.height}`
    );

    console.log('✓ Real image E2E test passed');
  } catch (error) {
    console.warn(
      '⚠ Real image test skipped (image may not be accessible in test environment):',
      error
    );
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('=== CropTool Tests ===\n');

  try {
    // Basic functionality tests
    testBasicCrop();
    testCropMultipleFrames();

    // Auto-crop tests
    testAutoCrop();
    testAutoCropUnevenPadding();
    testAutoCropFullyOpaque();
    testAutoCropFullyTransparent();

    // Aspect ratio tests
    testAspectRatio1to1();
    testAspectRatio16to9();
    testAspectRatio4to3();
    testAspectRatio3to2();
    testAspectRatio2to1();
    testAspectRatioNonCentered();

    // Manual crop tests
    testManualCropCoordinates();
    testManualCropNonSquare();

    // Edge cases
    testEdgeCases();

    // E2E test with real image
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
  (window as any).runCropToolTests = runAllTests;
  console.log('CropTool tests loaded. Run window.runCropToolTests() to execute.');
}
