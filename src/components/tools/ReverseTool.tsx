import { useState, useEffect, useRef } from 'react';
import type { Frame } from '../../types';
import { reverseFrames, pingPongFrames, getTotalDuration } from '../../lib/frameUtils';

interface ReverseToolProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

type ReverseMode = 'reverse' | 'pingpong';

export function ReverseTool({ frames, onFramesChange }: ReverseToolProps) {
  const [mode, setMode] = useState<ReverseMode>('reverse');
  const [previewFrames, setPreviewFrames] = useState<Frame[]>(frames);

  // Animation state
  const [originalFrameIndex, setOriginalFrameIndex] = useState(0);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update preview when mode changes
  useEffect(() => {
    if (mode === 'reverse') {
      setPreviewFrames(reverseFrames(frames));
    } else {
      setPreviewFrames(pingPongFrames(frames));
    }
    setPreviewFrameIndex(0);
  }, [mode, frames]);

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

  const handleApply = () => {
    onFramesChange(previewFrames);
  };

  const originalDuration = getTotalDuration(frames);
  const previewDuration = getTotalDuration(previewFrames);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

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
        {/* Mode Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('reverse')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              mode === 'reverse'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Reverse
          </button>
          <button
            onClick={() => setMode('pingpong')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              mode === 'pingpong'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Ping-Pong (Boomerang)
          </button>
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {mode === 'reverse'
              ? 'Plays the animation backward'
              : 'Plays forward then backward (seamless loop)'
            }
          </span>
          <span className="text-gray-400">
            {frames.length} → {previewFrames.length} frames
            {mode === 'pingpong' && previewFrames.length > frames.length && (
              <span className="text-green-400 ml-1">(+{previewFrames.length - frames.length})</span>
            )}
          </span>
        </div>

        {/* Duration Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Duration: <span className="text-white font-mono">{formatDuration(originalDuration)}</span>
            </span>
            <span className="text-gray-600">→</span>
            <span className={previewDuration !== originalDuration ? 'text-blue-400 font-mono' : 'text-gray-400 font-mono'}>
              {formatDuration(previewDuration)}
            </span>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Apply {mode === 'reverse' ? 'Reverse' : 'Ping-Pong'} Effect
        </button>
      </div>

      {/* Side-by-Side Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
            <span>Original</span>
            <span className="text-xs">{frames.length} frames</span>
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

        {/* Effect Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
            <span>{mode === 'reverse' ? 'Reversed' : 'Ping-Pong'}</span>
            <span className={`text-xs ${previewFrames.length !== frames.length ? 'text-blue-400' : ''}`}>
              {previewFrames.length} frames
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

      {/* Effect Description */}
      {mode === 'pingpong' && (
        <div className="text-center text-sm text-green-400">
          Creates a seamless boomerang loop (+{previewFrames.length - frames.length} frames)
        </div>
      )}
    </div>
  );
}
