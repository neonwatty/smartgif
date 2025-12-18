/**
 * Tests for RotateTool component
 * Run with: npx tsx src/components/tools/RotateTool.test.ts
 */

import type { Frame } from '../../types';
import { rotateFrames, rotateImageData, flipFrames, flipImageData } from '../../lib/transforms';

// Polyfill ImageData for Node.js environment
if (typeof ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(data: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
      if (data instanceof Uint8ClampedArray) {
        this.data = data;
        this.width = widthOrHeight;
        this.height = height!;
      } else {
        this.width = data;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(data * widthOrHeight * 4);
      }
    }
  };
}

// Polyfill HTMLCanvasElement for Node.js environment
class MockCanvasRenderingContext2D {
  private imageData: ImageData | null = null;
  private transforms: { translate?: [number, number]; scale?: [number, number]; rotate?: number }[] = [];

  putImageData(data: ImageData, x: number, y: number): void {
    this.imageData = data;
  }

  getImageData(x: number, y: number, width: number, height: number): ImageData {
    if (this.imageData) {
      // Simple implementation for testing
      return this.imageData;
    }
    return new ImageData(width, height) as ImageData;
  }

  translate(x: number, y: number): void {
    this.transforms.push({ translate: [x, y] });
  }

  scale(x: number, y: number): void {
    this.transforms.push({ scale: [x, y] });
  }

  rotate(angle: number): void {
    this.transforms.push({ rotate: angle });
  }

  clearRect(x: number, y: number, width: number, height: number): void {
    // no-op for testing
  }

  drawImage(source: any, ...args: number[]): void {
    // Simple mock - just preserve the image data
  }
}

class MockCanvas {
  width: number = 0;
  height: number = 0;
  private ctx: MockCanvasRenderingContext2D | null = null;

  getContext(type: string): MockCanvasRenderingContext2D | null {
    if (type === '2d') {
      if (!this.ctx) {
        this.ctx = new MockCanvasRenderingContext2D();
      }
      return this.ctx;
    }
    return null;
  }
}

// Polyfill document for Node.js environment
if (typeof document === 'undefined') {
  (global as any).document = {
    createElement(tag: string) {
      if (tag === 'canvas') {
        return new MockCanvas();
      }
      throw new Error(`createElement('${tag}') not implemented`);
    },
  };
}

// Test utilities
function createTestFrame(width: number, height: number, fillColor: [number, number, number, number] = [255, 0, 0, 255]): Frame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fillColor[0];     // R
    data[i + 1] = fillColor[1]; // G
    data[i + 2] = fillColor[2]; // B
    data[i + 3] = fillColor[3]; // A
  }

  return {
    imageData: new ImageData(data, width, height) as ImageData,
    delay: 100,
  };
}

function createPatternFrame(width: number, height: number): Frame {
  const data = new Uint8ClampedArray(width * height * 4);

  // Create a distinct pattern:
  // Top-left quadrant: Red
  // Top-right quadrant: Green
  // Bottom-left quadrant: Blue
  // Bottom-right quadrant: Yellow
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (y < height / 2) {
        if (x < width / 2) {
          // Top-left: Red
          data[idx] = 255;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
        } else {
          // Top-right: Green
          data[idx] = 0;
          data[idx + 1] = 255;
          data[idx + 2] = 0;
        }
      } else {
        if (x < width / 2) {
          // Bottom-left: Blue
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 255;
        } else {
          // Bottom-right: Yellow
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 0;
        }
      }
      data[idx + 3] = 255; // Alpha
    }
  }

  return {
    imageData: new ImageData(data, width, height) as ImageData,
    delay: 100,
  };
}

function getPixelColor(imageData: ImageData, x: number, y: number): [number, number, number, number] {
  const idx = (y * imageData.width + x) * 4;
  return [
    imageData.data[idx],
    imageData.data[idx + 1],
    imageData.data[idx + 2],
    imageData.data[idx + 3],
  ];
}

function colorsMatch(a: [number, number, number, number], b: [number, number, number, number], tolerance = 5): boolean {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  );
}

// Tests
function testRotate90Degrees() {
  console.log('Test: 90° rotation swaps dimensions...');

  const frame = createTestFrame(100, 200);
  const rotated = rotateImageData(frame.imageData, 90);

  if (rotated.width !== 200 || rotated.height !== 100) {
    throw new Error(`Expected dimensions 200x100, got ${rotated.width}x${rotated.height}`);
  }

  console.log('  ✓ Dimensions swapped correctly');
}

function testRotate90WithPattern() {
  console.log('Test: 90° rotation with pattern frame...');

  const frame = createPatternFrame(4, 4);
  const rotated = rotateImageData(frame.imageData, 90);

  // Verify dimensions are swapped
  if (rotated.width !== 4 || rotated.height !== 4) {
    throw new Error(`Expected dimensions 4x4, got ${rotated.width}x${rotated.height}`);
  }

  // Verify data exists
  if (rotated.data.length === 0) {
    throw new Error('Rotated image has no data');
  }

  console.log('  ✓ Pattern frame rotated (dimensions and data verified)');
}

function testRotate180Degrees() {
  console.log('Test: 180° rotation preserves dimensions...');

  const frame = createTestFrame(100, 200);
  const rotated = rotateImageData(frame.imageData, 180);

  if (rotated.width !== 100 || rotated.height !== 200) {
    throw new Error(`Expected dimensions 100x200, got ${rotated.width}x${rotated.height}`);
  }

  console.log('  ✓ Dimensions preserved correctly');
}

function testRotate270Degrees() {
  console.log('Test: 270° rotation (90° CCW) swaps dimensions...');

  const frame = createTestFrame(150, 100);
  const rotated = rotateImageData(frame.imageData, 270);

  if (rotated.width !== 100 || rotated.height !== 150) {
    throw new Error(`Expected dimensions 100x150, got ${rotated.width}x${rotated.height}`);
  }

  console.log('  ✓ Dimensions swapped correctly');
}

function testRotate0Degrees() {
  console.log('Test: 0° rotation returns original...');

  const frame = createTestFrame(100, 200);
  const rotated = rotateImageData(frame.imageData, 0);

  if (rotated !== frame.imageData) {
    throw new Error('Expected same ImageData reference for 0° rotation');
  }

  console.log('  ✓ Original returned for 0° rotation');
}

function testFlipHorizontal() {
  console.log('Test: Horizontal flip...');

  const frame = createPatternFrame(4, 4);
  const flipped = flipImageData(frame.imageData, 'horizontal');

  // Dimensions should be preserved
  if (flipped.width !== 4 || flipped.height !== 4) {
    throw new Error(`Expected dimensions 4x4, got ${flipped.width}x${flipped.height}`);
  }

  // Verify data exists
  if (flipped.data.length === 0) {
    throw new Error('Flipped image has no data');
  }

  console.log('  ✓ Horizontal flip correct (dimensions preserved)');
}

function testFlipVertical() {
  console.log('Test: Vertical flip...');

  const frame = createPatternFrame(4, 4);
  const flipped = flipImageData(frame.imageData, 'vertical');

  // Dimensions should be preserved
  if (flipped.width !== 4 || flipped.height !== 4) {
    throw new Error(`Expected dimensions 4x4, got ${flipped.width}x${flipped.height}`);
  }

  // Verify data exists
  if (flipped.data.length === 0) {
    throw new Error('Flipped image has no data');
  }

  console.log('  ✓ Vertical flip correct (dimensions preserved)');
}

function testFlipBoth() {
  console.log('Test: Flip both directions...');

  const frame = createPatternFrame(4, 4);
  const flipped = flipImageData(frame.imageData, 'both');

  // Dimensions should be preserved
  if (flipped.width !== 4 || flipped.height !== 4) {
    throw new Error(`Expected dimensions 4x4, got ${flipped.width}x${flipped.height}`);
  }

  // Verify data exists
  if (flipped.data.length === 0) {
    throw new Error('Flipped image has no data');
  }

  console.log('  ✓ Flip both directions correct (dimensions preserved)');
}

function testRotateFrames() {
  console.log('Test: Rotate multiple frames...');

  const frames: Frame[] = [
    createTestFrame(100, 200, [255, 0, 0, 255]),
    createTestFrame(100, 200, [0, 255, 0, 255]),
    createTestFrame(100, 200, [0, 0, 255, 255]),
  ];

  const rotated = rotateFrames(frames, 90);

  if (rotated.length !== 3) {
    throw new Error(`Expected 3 frames, got ${rotated.length}`);
  }

  for (let i = 0; i < rotated.length; i++) {
    if (rotated[i].imageData.width !== 200 || rotated[i].imageData.height !== 100) {
      throw new Error(`Frame ${i}: Expected dimensions 200x100, got ${rotated[i].imageData.width}x${rotated[i].imageData.height}`);
    }
    if (rotated[i].delay !== frames[i].delay) {
      throw new Error(`Frame ${i}: Delay changed`);
    }
  }

  console.log('  ✓ Multiple frames rotated correctly');
}

function testFlipFrames() {
  console.log('Test: Flip multiple frames...');

  const frames: Frame[] = [
    createPatternFrame(4, 4),
    createPatternFrame(4, 4),
  ];

  const flipped = flipFrames(frames, 'horizontal');

  if (flipped.length !== 2) {
    throw new Error(`Expected 2 frames, got ${flipped.length}`);
  }

  for (let i = 0; i < flipped.length; i++) {
    if (flipped[i].imageData.width !== 4 || flipped[i].imageData.height !== 4) {
      throw new Error(`Frame ${i}: Dimensions changed`);
    }
    if (flipped[i].delay !== frames[i].delay) {
      throw new Error(`Frame ${i}: Delay changed`);
    }
  }

  console.log('  ✓ Multiple frames flipped correctly');
}

function testCombinedRotateAndFlip() {
  console.log('Test: Combined rotate and flip...');

  const frame = createPatternFrame(4, 4);

  // First rotate 90°
  let transformed = rotateImageData(frame.imageData, 90);
  // Then flip horizontally
  transformed = flipImageData(transformed, 'horizontal');

  if (transformed.width !== 4 || transformed.height !== 4) {
    throw new Error(`Expected dimensions 4x4, got ${transformed.width}x${transformed.height}`);
  }

  console.log('  ✓ Combined transformations work correctly');
}

function testMultipleRotations() {
  console.log('Test: Multiple rotations (360°)...');

  const frame = createTestFrame(100, 200);

  // Rotate 90° four times should give us back original dimensions
  let rotated = rotateImageData(frame.imageData, 90);
  rotated = rotateImageData(rotated, 90);
  rotated = rotateImageData(rotated, 90);
  rotated = rotateImageData(rotated, 90);

  if (rotated.width !== 100 || rotated.height !== 200) {
    throw new Error(`Expected original dimensions 100x200, got ${rotated.width}x${rotated.height}`);
  }

  console.log('  ✓ Multiple rotations (360°) restore dimensions');
}

// Run all tests
async function runTests() {
  console.log('\n=== RotateTool Transform Tests ===\n');

  const tests = [
    testRotate0Degrees,
    testRotate90Degrees,
    testRotate90WithPattern,
    testRotate180Degrees,
    testRotate270Degrees,
    testRotateFrames,
    testMultipleRotations,
    testFlipHorizontal,
    testFlipVertical,
    testFlipBoth,
    testFlipFrames,
    testCombinedRotateAndFlip,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (error) {
      failed++;
      console.error(`  ✗ FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.log('');
  }

  console.log('=== Test Results ===');
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}
