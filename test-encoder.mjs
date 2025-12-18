/**
 * End-to-end test for the GIF encoding pipeline
 * Run with: node test-encoder.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

// Simulated frame data for testing
function createTestFrames(count, width, height) {
  const frames = [];

  for (let i = 0; i < count; i++) {
    // Create gradient frames with varying colors
    const data = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Create animated gradient
        const hue = ((x / width) * 360 + i * 30) % 360;
        const rgb = hslToRgb(hue / 360, 0.7, 0.5);
        data[idx] = rgb[0];     // R
        data[idx + 1] = rgb[1]; // G
        data[idx + 2] = rgb[2]; // B
        data[idx + 3] = 255;    // A
      }
    }

    frames.push({ width, height, data, delay: 100 });
  }

  return frames;
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

async function testEncoding(frames, colors, label) {
  console.log(`\n[${label}] Testing ${frames.length} frames @ ${frames[0].width}x${frames[0].height}, ${colors} colors...`);

  const start = Date.now();
  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const frameStart = Date.now();

    // Quantize
    const quantizeStart = Date.now();
    const palette = quantize(frame.data, colors);
    const quantizeTime = Date.now() - quantizeStart;

    // Apply palette
    const paletteStart = Date.now();
    const index = applyPalette(frame.data, palette);
    const paletteTime = Date.now() - paletteStart;

    // Write frame
    const writeStart = Date.now();
    gif.writeFrame(index, frame.width, frame.height, {
      palette,
      delay: frame.delay,
    });
    const writeTime = Date.now() - writeStart;

    const frameTime = Date.now() - frameStart;
    console.log(`  Frame ${i + 1}/${frames.length}: ${frameTime}ms (quantize: ${quantizeTime}ms, palette: ${paletteTime}ms, write: ${writeTime}ms)`);
  }

  gif.finish();
  const bytes = gif.bytes();

  const timeMs = Date.now() - start;
  const sizeKB = Math.round(bytes.length / 1024);

  console.log(`  ✓ Done! Size: ${sizeKB}KB, Total time: ${timeMs}ms`);

  return { sizeKB, timeMs };
}

async function runTests() {
  console.log('=== GIF Encoder Test Suite ===');
  console.log('Testing gifenc performance at different sizes/colors\n');

  const results = [];

  // Test 1: Small frames, few colors
  console.log('--- Test 1: Small (100x100), 10 frames ---');
  const smallFrames = createTestFrames(10, 100, 100);
  results.push({ label: 'Small-64', ...await testEncoding(smallFrames, 64, 'Small-64') });
  results.push({ label: 'Small-256', ...await testEncoding(smallFrames, 256, 'Small-256') });

  // Test 2: Medium frames
  console.log('\n--- Test 2: Medium (400x300), 10 frames ---');
  const mediumFrames = createTestFrames(10, 400, 300);
  results.push({ label: 'Medium-64', ...await testEncoding(mediumFrames, 64, 'Medium-64') });
  results.push({ label: 'Medium-128', ...await testEncoding(mediumFrames, 128, 'Medium-128') });

  // Test 3: Large frames (similar to the webp: 800x520)
  console.log('\n--- Test 3: Large (800x520), 10 frames ---');
  const largeFrames = createTestFrames(10, 800, 520);
  results.push({ label: 'Large-64', ...await testEncoding(largeFrames, 64, 'Large-64') });
  results.push({ label: 'Large-128', ...await testEncoding(largeFrames, 128, 'Large-128') });
  results.push({ label: 'Large-256', ...await testEncoding(largeFrames, 256, 'Large-256') });

  // Summary
  console.log('\n\n=== Summary ===');
  console.log('Label\t\t\tSize\tTime');
  console.log('─'.repeat(40));
  for (const r of results) {
    console.log(`${r.label.padEnd(16)}\t${r.sizeKB}KB\t${r.timeMs}ms`);
  }

  console.log('\n=== All tests completed ===');
}

runTests().catch(console.error);
