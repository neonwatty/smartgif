import { useState, useEffect, useRef } from 'react';
import type { Frame } from '../../types';
import {
  adjustSpeed,
  setUniformDelay,
  getTotalDuration,
  getAverageFps,
} from '../../lib/frameUtils';

interface SpeedToolProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

export function SpeedTool({ frames, onFramesChange }: SpeedToolProps) {
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [customDelay, setCustomDelay] = useState<string>('');
  const [previewFrames, setPreviewFrames] = useState<Frame[]>(frames);
  const [mode, setMode] = useState<'multiplier' | 'uniform'>('multiplier');

  // Animation state
  const [originalFrameIndex, setOriginalFrameIndex] = useState(0);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate current stats
  const currentDuration = getTotalDuration(frames);
  const newDuration = getTotalDuration(previewFrames);
  const newFps = getAverageFps(previewFrames);

  // Update preview when speed multiplier or mode changes
  useEffect(() => {
    // Use timeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      if (mode === 'multiplier') {
        const adjusted = adjustSpeed(frames, speedMultiplier);
        setPreviewFrames(adjusted);
      } else if (mode === 'uniform' && customDelay) {
        const delay = parseInt(customDelay, 10);
        if (!isNaN(delay) && delay >= 10) {
          const uniform = setUniformDelay(frames, delay);
          setPreviewFrames(uniform);
        }
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [speedMultiplier, customDelay, mode, frames]);

  // Animate original frames
  useEffect(() => {
    if (frames.length === 0) return;

    const frame = frames[originalFrameIndex];
    const timeout = setTimeout(() => {
      setOriginalFrameIndex((prev) => (prev + 1) % frames.length);
    }, frame.delay);

    return () => clearTimeout(timeout);
  }, [originalFrameIndex, frames]);

  // Animate preview frames
  useEffect(() => {
    if (previewFrames.length === 0) return;

    const frame = previewFrames[previewFrameIndex];
    const timeout = setTimeout(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % previewFrames.length);
    }, frame.delay);

    return () => clearTimeout(timeout);
  }, [previewFrameIndex, previewFrames]);

  // Draw original frame
  useEffect(() => {
    const canvas = originalCanvasRef.current;
    if (!canvas || frames.length === 0) return;

    const frame = frames[originalFrameIndex];
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }
  }, [originalFrameIndex, frames]);

  // Draw preview frame
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || previewFrames.length === 0) return;

    const frame = previewFrames[previewFrameIndex];
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }
  }, [previewFrameIndex, previewFrames]);

  const handleSpeedPreset = (multiplier: number) => {
    setSpeedMultiplier(multiplier);
    setMode('multiplier');
  };

  const handleCustomDelayChange = (value: string) => {
    setCustomDelay(value);
    setMode('uniform');
  };

  const handleApply = () => {
    onFramesChange(previewFrames);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const hasChanges = speedMultiplier !== 1 || (mode === 'uniform' && customDelay);

  // Calculate canvas display size
  const maxDisplaySize = 300;
  const displayScale = frames.length > 0
    ? Math.min(maxDisplaySize / frames[0].imageData.width, maxDisplaySize / frames[0].imageData.height, 1)
    : 1;
  const displayWidth = frames.length > 0 ? frames[0].imageData.width * displayScale : maxDisplaySize;
  const displayHeight = frames.length > 0 ? frames[0].imageData.height * displayScale : maxDisplaySize;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Mode Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('multiplier')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              mode === 'multiplier'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Speed Multiplier
          </button>
          <button
            onClick={() => setMode('uniform')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              mode === 'uniform'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Uniform Delay
          </button>
        </div>

        {mode === 'multiplier' ? (
          <>
            {/* Speed Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Speed:</span>
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSpeedPreset(preset)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    speedMultiplier === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>

            {/* Speed Slider */}
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono text-blue-400 w-16 text-right">{speedMultiplier.toFixed(2)}x</span>
            </div>
          </>
        ) : (
          /* Uniform Delay Input */
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Frame delay:</span>
            <input
              type="number"
              min="10"
              max="5000"
              step="10"
              value={customDelay}
              onChange={(e) => handleCustomDelayChange(e.target.value)}
              placeholder="100"
              className="w-24 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <span className="text-sm text-gray-400">ms</span>
            <span className="text-xs text-gray-500">(min: 10ms)</span>
          </div>
        )}

        {/* Duration Info Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Duration: <span className="text-white font-mono">{formatDuration(currentDuration)}</span>
            </span>
            <span className="text-gray-600">→</span>
            <span className={hasChanges ? 'text-blue-400 font-mono' : 'text-gray-400 font-mono'}>
              {formatDuration(newDuration)}
            </span>
          </div>
          <span className="text-gray-400">
            {newFps} fps
          </span>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={!hasChanges}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          {hasChanges ? 'Apply Speed Changes' : 'No Changes'}
        </button>
      </div>

      {/* Side-by-Side Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
            <span>Original (1x)</span>
            <span className="text-xs">{formatDuration(currentDuration)}</span>
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <canvas
              ref={originalCanvasRef}
              style={{
                width: displayWidth,
                height: displayHeight,
              }}
              className="object-contain"
            />
          </div>
        </div>

        {/* Adjusted Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
            <span>
              Preview ({mode === 'multiplier' ? `${speedMultiplier}x` : `${customDelay}ms delay`})
            </span>
            <span className={`text-xs ${hasChanges ? 'text-blue-400' : ''}`}>
              {formatDuration(newDuration)}
            </span>
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <canvas
              ref={previewCanvasRef}
              style={{
                width: displayWidth,
                height: displayHeight,
              }}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Speed Change Indicator */}
      {hasChanges && (
        <div className="text-center text-sm">
          {speedMultiplier > 1 ? (
            <span className="text-green-400">
              {((speedMultiplier - 1) * 100).toFixed(0)}% faster
            </span>
          ) : speedMultiplier < 1 ? (
            <span className="text-yellow-400">
              {((1 - speedMultiplier) * 100).toFixed(0)}% slower
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
