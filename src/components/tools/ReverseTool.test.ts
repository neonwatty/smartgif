/**
 * Test suite for ReverseTool component
 * Run with: npx tsx src/components/tools/ReverseTool.test.ts
 */

import { reverseFrames, pingPongFrames, getTotalDuration } from '../../lib/frameUtils';
import type { Frame } from '../../types';

// Mock ImageData for Node.js environment
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

// Use native ImageData if available (browser), otherwise use mock
const ImageDataConstructor = typeof ImageData !== 'undefined' ? ImageData : MockImageData;

// Test utilities
function createTestFrame(width: number, height: number, delay: number): Frame {
  const data = new Uint8ClampedArray(width * height * 4);
  // Fill with some test data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;     // R
    data[i + 1] = 0;   // G
    data[i + 2] = 0;   // B
    data[i + 3] = 255; // A
  }

  const imageData = new ImageDataConstructor(data, width, height) as ImageData;
  return { imageData, delay };
}

function createTestFrames(count: number, width = 100, height = 100): Frame[] {
  const frames: Frame[] = [];
  for (let i = 0; i < count; i++) {
    // Vary delay to test duration calculations
    const delay = 100 + i * 10;
    frames.push(createTestFrame(width, height, delay));
  }
  return frames;
}

// Test helpers
function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertArrayEqual(actual: any[], expected: any[], message: string) {
  if (actual.length !== expected.length) {
    throw new Error(`${message}: length mismatch - expected ${expected.length}, got ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`${message}: at index ${i} - expected ${expected[i]}, got ${actual[i]}`);
    }
  }
}

// Test Suite
function testReverseFrames() {
  console.log('\n=== Test: reverseFrames ===');

  // Test 1: Basic reverse
  const frames = createTestFrames(5);
  const reversed = reverseFrames(frames);

  assertEqual(reversed.length, frames.length, 'Frame count should match');
  assertEqual(reversed[0].delay, frames[4].delay, 'First frame should be last');
  assertEqual(reversed[4].delay, frames[0].delay, 'Last frame should be first');

  console.log('✓ Basic reverse works correctly');

  // Test 2: Single frame
  const singleFrame = createTestFrames(1);
  const reversedSingle = reverseFrames(singleFrame);

  assertEqual(reversedSingle.length, 1, 'Single frame should remain single');
  assertEqual(reversedSingle[0].delay, singleFrame[0].delay, 'Delay should be preserved');

  console.log('✓ Single frame reverse works correctly');

  // Test 3: Original should not be modified
  const original = createTestFrames(3);
  const originalFirstDelay = original[0].delay;
  reverseFrames(original);

  assertEqual(original[0].delay, originalFirstDelay, 'Original array should not be modified');

  console.log('✓ Original frames are not modified');
}

function testPingPongFrames() {
  console.log('\n=== Test: pingPongFrames ===');

  // Test 1: Basic ping-pong
  const frames = createTestFrames(5);
  const pingPong = pingPongFrames(frames);

  // Should be: [0, 1, 2, 3, 4, 3, 2, 1] (excludes first and last to avoid duplicates)
  const expectedLength = frames.length + (frames.length - 2);
  assertEqual(pingPong.length, expectedLength, 'Ping-pong should have correct frame count');

  // Verify forward portion
  assertEqual(pingPong[0].delay, frames[0].delay, 'First frame should match');
  assertEqual(pingPong[4].delay, frames[4].delay, 'Last forward frame should match');

  // Verify backward portion (should be frames[3], frames[2], frames[1])
  assertEqual(pingPong[5].delay, frames[3].delay, 'First backward frame should be second-to-last');
  assertEqual(pingPong[7].delay, frames[1].delay, 'Last backward frame should be second');

  console.log('✓ Ping-pong creates correct sequence');

  // Test 2: Two frames
  const twoFrames = createTestFrames(2);
  const pingPongTwo = pingPongFrames(twoFrames);

  assertEqual(pingPongTwo.length, 2, 'Two frames should stay as two (no middle frames)');

  console.log('✓ Two-frame ping-pong works correctly');

  // Test 3: Single frame
  const singleFrame = createTestFrames(1);
  const pingPongSingle = pingPongFrames(singleFrame);

  assertEqual(pingPongSingle.length, 1, 'Single frame should remain single');

  console.log('✓ Single-frame ping-pong works correctly');

  // Test 4: Three frames
  const threeFrames = createTestFrames(3);
  const pingPongThree = pingPongFrames(threeFrames);

  // Should be: [0, 1, 2, 1] (middle frame only)
  assertEqual(pingPongThree.length, 4, 'Three frames should become four');
  assertArrayEqual(
    [pingPongThree[0].delay, pingPongThree[1].delay, pingPongThree[2].delay, pingPongThree[3].delay],
    [threeFrames[0].delay, threeFrames[1].delay, threeFrames[2].delay, threeFrames[1].delay],
    'Three-frame ping-pong sequence'
  );

  console.log('✓ Three-frame ping-pong works correctly');
}

function testGetTotalDuration() {
  console.log('\n=== Test: getTotalDuration ===');

  // Test 1: Basic duration
  const frames = [
    createTestFrame(100, 100, 100),
    createTestFrame(100, 100, 150),
    createTestFrame(100, 100, 200),
  ];

  const duration = getTotalDuration(frames);
  assertEqual(duration, 450, 'Total duration should sum all delays');

  console.log('✓ Duration calculation is correct');

  // Test 2: Empty array
  const emptyDuration = getTotalDuration([]);
  assertEqual(emptyDuration, 0, 'Empty array should have zero duration');

  console.log('✓ Empty array duration is zero');
}

function testFrameCountChanges() {
  console.log('\n=== Test: Frame Count Changes ===');

  const originalFrames = createTestFrames(10);

  // Test reverse
  const reversed = reverseFrames(originalFrames);
  assertEqual(reversed.length, originalFrames.length, 'Reverse should not change frame count');

  console.log('✓ Reverse maintains frame count');

  // Test ping-pong
  const pingPong = pingPongFrames(originalFrames);
  const expectedPingPongCount = originalFrames.length + (originalFrames.length - 2);
  assertEqual(pingPong.length, expectedPingPongCount, 'Ping-pong should double frames (minus 2)');

  console.log('✓ Ping-pong correctly increases frame count');

  // Test duration
  const originalDuration = getTotalDuration(originalFrames);
  const pingPongDuration = getTotalDuration(pingPong);

  console.log(`  Original: ${originalFrames.length} frames, ${originalDuration}ms`);
  console.log(`  Ping-pong: ${pingPong.length} frames, ${pingPongDuration}ms`);
  console.log(`  Increase: +${pingPong.length - originalFrames.length} frames, +${pingPongDuration - originalDuration}ms`);

  if (pingPongDuration <= originalDuration) {
    throw new Error('Ping-pong duration should be longer than original');
  }

  console.log('✓ Ping-pong duration is longer than original');
}

// Real world test using the test image
async function testWithRealImage() {
  console.log('\n=== Test: Real Image Integration ===');
  console.log('Note: This test requires browser environment with ImageDecoder API');
  console.log('Skipping in Node.js environment...');

  // In a browser environment, this would load and test with the actual WebP file
  // For now, we validate that our utilities work with realistic frame counts

  const realisticFrames = createTestFrames(50, 800, 520); // Similar to kamal-quake-demo.webp size

  // Test reverse
  const reversed = reverseFrames(realisticFrames);
  assertEqual(reversed.length, 50, 'Should handle 50 frames');

  // Test ping-pong
  const pingPong = pingPongFrames(realisticFrames);
  assertEqual(pingPong.length, 98, 'Should create 98 frames from 50 (50 + 48)');

  // Test duration
  const originalDuration = getTotalDuration(realisticFrames);
  const pingPongDuration = getTotalDuration(pingPong);

  console.log(`  Original: 50 frames, ${originalDuration}ms (${(originalDuration/1000).toFixed(2)}s)`);
  console.log(`  Ping-pong: ${pingPong.length} frames, ${pingPongDuration}ms (${(pingPongDuration/1000).toFixed(2)}s)`);

  console.log('✓ Handles realistic frame counts correctly');
}

// Run all tests
async function runTests() {
  console.log('=== ReverseTool Test Suite ===');
  console.log('Testing frame utilities for the Reverse Tool component\n');

  try {
    testReverseFrames();
    testPingPongFrames();
    testGetTotalDuration();
    testFrameCountChanges();
    await testWithRealImage();

    console.log('\n=== All Tests Passed ✓ ===\n');
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
