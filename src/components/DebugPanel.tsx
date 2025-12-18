import { useState } from 'react';
import { decodeFile } from '../lib/decoder';
import { encodeGif, scaleFrames } from '../lib/gifEncoder';
import { encodeGifFast, scaleFramesFast } from '../lib/gifEncoderFast';
import type { Frame } from '../types';

export function DebugPanel() {
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    setLog(prev => [...prev, `[${timestamp}] ${msg}`]);
    console.log(msg);
  };

  const runTest = async (
    file: File,
    maxFrames: number,
    colors: number,
    scale: number,
    useFastEncoder: boolean
  ) => {
    const label = useFastEncoder ? 'FAST' : 'STANDARD';

    try {
      addLog(`\n=== ${label} ENCODER TEST ===`);
      addLog(`Settings: ${maxFrames} frames, ${colors} colors, ${(scale * 100).toFixed(0)}% scale`);

      // Decode
      const decodeStart = performance.now();
      let frames: Frame[] = [];
      let width = 0;
      let height = 0;

      const result = await decodeFile(file, (percent) => {
        if (percent % 25 === 0) {
          addLog(`  Decode: ${percent.toFixed(0)}%`);
        }
      });

      frames = result.frames;
      width = result.width;
      height = result.height;

      const decodeTime = performance.now() - decodeStart;
      addLog(`Decoded ${frames.length} frames (${width}x${height}) in ${decodeTime.toFixed(0)}ms`);

      // Limit frames
      if (frames.length > maxFrames) {
        frames = frames.slice(0, maxFrames);
        addLog(`Limited to ${maxFrames} frames`);
      }

      // Scale
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);
      addLog(`Scaling to ${targetWidth}x${targetHeight}...`);

      const scaleStart = performance.now();
      const scaledFrames = useFastEncoder
        ? await scaleFramesFast(frames, targetWidth, targetHeight)
        : scaleFrames(frames, targetWidth, targetHeight);
      const scaleTime = performance.now() - scaleStart;
      addLog(`Scaled in ${scaleTime.toFixed(0)}ms`);

      // Encode
      addLog(`Encoding with ${label} encoder...`);
      const encodeStart = performance.now();

      let gifData: Uint8Array;
      if (useFastEncoder) {
        gifData = await encodeGifFast(scaledFrames, {
          width: targetWidth,
          height: targetHeight,
          colors,
        }, (percent) => {
          if (percent % 25 === 0) {
            addLog(`  Encode: ${percent.toFixed(0)}%`);
          }
        });
      } else {
        gifData = await encodeGif(scaledFrames, {
          width: targetWidth,
          height: targetHeight,
          colors,
        }, (percent) => {
          if (percent % 25 === 0) {
            addLog(`  Encode: ${percent.toFixed(0)}%`);
          }
        });
      }

      const encodeTime = performance.now() - encodeStart;
      const sizeKB = (gifData.length / 1024).toFixed(0);
      addLog(`Encoded in ${encodeTime.toFixed(0)}ms - Size: ${sizeKB}KB`);

      // Summary
      const totalTime = decodeTime + scaleTime + encodeTime;
      addLog(`--- ${label} TOTAL: ${totalTime.toFixed(0)}ms ---`);

      // Download
      const arrayBuffer = new ArrayBuffer(gifData.length);
      new Uint8Array(arrayBuffer).set(gifData);
      const blob = new Blob([arrayBuffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase()}-${maxFrames}f-${colors}c.gif`;
      a.click();
      URL.revokeObjectURL(url);

      return { decodeTime, scaleTime, encodeTime, totalTime, sizeKB };

    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      console.error(error);
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLog([]);
    setIsRunning(true);

    addLog(`File: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);

    // Run comparison tests
    const frames = 10;
    const colors = 128;
    const scale = 0.5;

    // Standard encoder
    const standardResult = await runTest(file, frames, colors, scale, false);

    // Fast encoder
    const fastResult = await runTest(file, frames, colors, scale, true);

    // Comparison
    if (standardResult && fastResult) {
      addLog('\n=== COMPARISON ===');
      addLog(`Standard: ${standardResult.totalTime.toFixed(0)}ms, ${standardResult.sizeKB}KB`);
      addLog(`Fast:     ${fastResult.totalTime.toFixed(0)}ms, ${fastResult.sizeKB}KB`);
      const speedup = (standardResult.encodeTime / fastResult.encodeTime).toFixed(1);
      addLog(`Encode speedup: ${speedup}x faster`);
    }

    setIsRunning(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-8">
      <h2 className="text-lg font-bold mb-4">Debug Panel - Encoder Comparison</h2>

      <div className="mb-4">
        <label className="block mb-2 text-sm text-gray-400">
          Select file to compare standard vs fast encoder (10 frames, 128 colors, 50% scale):
        </label>
        <input
          type="file"
          accept=".webp,.gif,.mp4,.webm"
          onChange={handleFileSelect}
          disabled={isRunning}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
        />
        {isRunning && (
          <p className="mt-2 text-yellow-400 text-sm">Running tests...</p>
        )}
      </div>

      <div className="bg-gray-900 rounded p-3 h-96 overflow-y-auto font-mono text-xs">
        {log.length === 0 ? (
          <span className="text-gray-600">Select a file to run comparison tests...</span>
        ) : (
          log.map((line, i) => (
            <div
              key={i}
              className={
                line.includes('ERROR') ? 'text-red-400' :
                line.includes('TOTAL') || line.includes('speedup') ? 'text-yellow-400 font-bold' :
                line.includes('===') ? 'text-blue-400' :
                'text-green-400'
              }
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
