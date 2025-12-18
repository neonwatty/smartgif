/**
 * Speed Tool Tests
 * Tests speed multiplier and uniform delay functionality
 *
 * Run with: npx tsx src/components/tools/SpeedTool.test.ts
 * Or in browser console for real WebP testing
 */

import {
  adjustSpeed,
  setUniformDelay,
  getTotalDuration,
  getAverageFps,
} from '../../lib/frameUtils';
import type { Frame } from '../../types';

/**
 * Create a test frame with ImageData
 */
function createTestFrame(
  width: number,
  height: number,
  color: [number, number, number],
  delay: number
): Frame {
  // For Node.js environment, create a minimal ImageData-like object
  const size = width * height * 4;
  const data = new Uint8ClampedArray(size);
  const [r, g, b] = color;

  // Fill with solid color
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255; // alpha
  }

  // Create ImageData-like object
  const imageData = {
    data,
    width,
    height,
    colorSpace: 'srgb' as PredefinedColorSpace,
  } as ImageData;

  return { imageData, delay };
}

/**
 * Create mock frames for testing
 */
function createMockFrames(count: number, delay: number): Frame[] {
  return Array.from({ length: count }, (_, i) =>
    createTestFrame(100, 100, [i * 50, i * 30, i * 20], delay)
  );
}

/**
 * Test adjustSpeed with multipliers
 */
async function testAdjustSpeed(): Promise<void> {
  console.log('\n=== Testing adjustSpeed ===');

  const frames = createMockFrames(5, 100);
  const originalDuration = getTotalDuration(frames);
  console.log(`Original duration: ${originalDuration}ms`);

  // Test 2x speed (faster)
  const faster = adjustSpeed(frames, 2);
  const fasterDuration = getTotalDuration(faster);
  console.log(`2x speed duration: ${fasterDuration}ms (expected ~${originalDuration / 2}ms)`);
  if (Math.abs(fasterDuration - originalDuration / 2) > frames.length) {
    throw new Error('2x speed adjustment failed');
  }
  console.log('✓ 2x speed multiplier works correctly');

  // Test 0.5x speed (slower)
  const slower = adjustSpeed(frames, 0.5);
  const slowerDuration = getTotalDuration(slower);
  console.log(`0.5x speed duration: ${slowerDuration}ms (expected ~${originalDuration / 0.5}ms)`);
  if (Math.abs(slowerDuration - originalDuration / 0.5) > frames.length) {
    throw new Error('0.5x speed adjustment failed');
  }
  console.log('✓ 0.5x speed multiplier works correctly');

  // Test 1x speed (no change)
  const same = adjustSpeed(frames, 1);
  const sameDuration = getTotalDuration(same);
  if (sameDuration !== originalDuration) {
    throw new Error('1x speed should not change duration');
  }
  console.log('✓ 1x speed multiplier preserves duration');

  // Test minimum delay enforcement
  const tinyDelay = frames.map(f => ({ ...f, delay: 5 }));
  const adjusted = adjustSpeed(tinyDelay, 10);
  const hasMinDelay = adjusted.every(f => f.delay >= 10);
  if (!hasMinDelay) {
    throw new Error('Minimum delay of 10ms not enforced');
  }
  console.log('✓ Minimum delay of 10ms enforced');

  // Test frame count preservation
  const presets = [0.25, 0.5, 1, 1.5, 2, 4];
  for (const preset of presets) {
    const result = adjustSpeed(frames, preset);
    if (result.length !== frames.length) {
      throw new Error(`Frame count not preserved for ${preset}x speed`);
    }
  }
  console.log('✓ Frame count preserved across all presets');
}

/**
 * Test setUniformDelay
 */
async function testSetUniformDelay(): Promise<void> {
  console.log('\n=== Testing setUniformDelay ===');

  const frames = createMockFrames(10, 100);

  // Test uniform delay
  const uniformDelay = 50;
  const uniform = setUniformDelay(frames, uniformDelay);

  const allSameDelay = uniform.every(f => f.delay === uniformDelay);
  if (!allSameDelay) {
    throw new Error('Not all frames have uniform delay');
  }
  console.log(`✓ All frames set to ${uniformDelay}ms delay`);

  // Test duration calculation
  const totalDuration = getTotalDuration(uniform);
  const expectedDuration = frames.length * uniformDelay;
  if (totalDuration !== expectedDuration) {
    throw new Error('Duration calculation incorrect for uniform delay');
  }
  console.log(`✓ Total duration: ${totalDuration}ms (${frames.length} × ${uniformDelay}ms)`);

  // Test minimum delay
  const belowMin = setUniformDelay(frames, 5);
  const hasMinDelay = belowMin.every(f => f.delay === 10);
  if (!hasMinDelay) {
    throw new Error('Minimum delay not enforced for uniform delay');
  }
  console.log('✓ Minimum delay enforced for values < 10ms');

  // Test large delay
  const largeDelay = 5000;
  const large = setUniformDelay(frames, largeDelay);
  const hasLargeDelay = large.every(f => f.delay === largeDelay);
  if (!hasLargeDelay) {
    throw new Error('Large delay not applied correctly');
  }
  console.log(`✓ Large delay (${largeDelay}ms) applied correctly`);
}

/**
 * Test getTotalDuration
 */
async function testGetTotalDuration(): Promise<void> {
  console.log('\n=== Testing getTotalDuration ===');

  // Test with specific delays
  const frames: Frame[] = [
    createTestFrame(100, 100, [255, 0, 0], 100),
    createTestFrame(100, 100, [0, 255, 0], 200),
    createTestFrame(100, 100, [0, 0, 255], 150),
  ];

  const duration = getTotalDuration(frames);
  const expected = 450;
  if (duration !== expected) {
    throw new Error(`Expected ${expected}ms, got ${duration}ms`);
  }
  console.log(`✓ Correct duration: ${duration}ms`);

  // Test empty frames
  const emptyDuration = getTotalDuration([]);
  if (emptyDuration !== 0) {
    throw new Error('Empty frames should return 0 duration');
  }
  console.log('✓ Empty frames return 0 duration');

  // Test single frame
  const singleFrame = [createTestFrame(100, 100, [128, 128, 128], 100)];
  const singleDuration = getTotalDuration(singleFrame);
  if (singleDuration !== 100) {
    throw new Error('Single frame duration incorrect');
  }
  console.log('✓ Single frame duration correct');
}

/**
 * Test getAverageFps
 */
async function testGetAverageFps(): Promise<void> {
  console.log('\n=== Testing getAverageFps ===');

  // Test 10 fps (100ms per frame)
  const frames10fps = createMockFrames(10, 100);
  const fps10 = getAverageFps(frames10fps);
  if (fps10 !== 10) {
    throw new Error(`Expected 10 fps, got ${fps10} fps`);
  }
  console.log('✓ 10 fps calculated correctly');

  // Test variable delays
  const varFrames: Frame[] = [
    createTestFrame(100, 100, [255, 0, 0], 100), // 10 fps
    createTestFrame(100, 100, [0, 255, 0], 50),  // 20 fps
    createTestFrame(100, 100, [0, 0, 255], 200), // 5 fps
  ];
  const varFps = getAverageFps(varFrames);
  // Average delay = 350/3 = 116.67ms = 8.57 fps, rounds to 9
  if (varFps !== 9) {
    throw new Error(`Expected 9 fps for variable delays, got ${varFps} fps`);
  }
  console.log('✓ Variable delay FPS calculated correctly');

  // Test fast animation (~60 fps)
  const fastFrames = createMockFrames(10, 16);
  const fastFps = getAverageFps(fastFrames);
  const expectedFastFps = Math.round(1000 / 16);
  if (fastFps !== expectedFastFps) {
    throw new Error(`Expected ${expectedFastFps} fps, got ${fastFps} fps`);
  }
  console.log(`✓ Fast animation FPS calculated correctly: ${fastFps} fps`);
}

/**
 * Test Speed Tool integration scenarios
 */
async function testSpeedToolIntegration(): Promise<void> {
  console.log('\n=== Testing Speed Tool Integration ===');

  const frames = createMockFrames(10, 100);
  const originalDuration = getTotalDuration(frames);

  // Test consistency across multipliers
  const multipliers = [0.25, 0.5, 1, 1.5, 2, 4];
  for (const multiplier of multipliers) {
    const adjusted = adjustSpeed(frames, multiplier);
    const newDuration = getTotalDuration(adjusted);
    const expectedDuration = originalDuration / multiplier;
    const tolerance = frames.length; // Allow rounding error per frame

    if (Math.abs(newDuration - expectedDuration) > tolerance) {
      throw new Error(
        `Multiplier ${multiplier}x: expected ${expectedDuration}ms, got ${newDuration}ms`
      );
    }
  }
  console.log('✓ Speed multipliers maintain consistent duration ratios');

  // Test switching between modes
  const sped = adjustSpeed(frames, 2);
  const spedDuration = getTotalDuration(sped);

  const uniform = setUniformDelay(sped, 50);
  const uniformDuration = getTotalDuration(uniform);

  if (uniformDuration !== sped.length * 50) {
    throw new Error('Uniform delay after speed adjustment failed');
  }
  console.log('✓ Can switch from speed multiplier to uniform delay');

  // Test frame quality preservation
  const adjusted = adjustSpeed(frames, 1.5);
  for (let i = 0; i < adjusted.length; i++) {
    if (adjusted[i].imageData.width !== frames[i].imageData.width ||
        adjusted[i].imageData.height !== frames[i].imageData.height ||
        adjusted[i].imageData.data.length !== frames[i].imageData.data.length) {
      throw new Error('Frame quality not preserved');
    }
  }
  console.log('✓ Frame quality preserved after speed adjustment');

  // Test rapid speed changes
  let current = frames;
  const changes = [2, 0.5, 1.5, 0.75, 1];
  for (const change of changes) {
    current = adjustSpeed(current, change);
    if (current.length !== frames.length) {
      throw new Error('Frame count changed during rapid adjustments');
    }
    if (getTotalDuration(current) <= 0) {
      throw new Error('Invalid duration after rapid adjustments');
    }
  }
  console.log('✓ Handles rapid speed changes correctly');
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('🧪 Starting Speed Tool Tests...\n');

  try {
    await testAdjustSpeed();
    await testSetUniformDelay();
    await testGetTotalDuration();
    await testGetAverageFps();
    await testSpeedToolIntegration();

    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
