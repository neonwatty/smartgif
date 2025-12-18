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
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Update preview when mode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mode === 'reverse') {
      setPreviewFrames(reverseFrames(frames));
    } else {
      setPreviewFrames(pingPongFrames(frames));
    }
    setCurrentFrameIndex(0);
  }, [mode, frames]);

  // Animate preview
  useEffect(() => {
    if (previewFrames.length === 0) return;

    let frameIndex = 0;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const elapsed = currentTime - lastTime;
      const currentFrame = previewFrames[frameIndex];

      if (elapsed >= currentFrame.delay) {
        // Draw current frame
        canvas.width = currentFrame.imageData.width;
        canvas.height = currentFrame.imageData.height;
        ctx.putImageData(currentFrame.imageData, 0, 0);

        setCurrentFrameIndex(frameIndex);

        // Move to next frame
        frameIndex = (frameIndex + 1) % previewFrames.length;
        lastTime = currentTime;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [previewFrames]);

  const handleApply = () => {
    onFramesChange(previewFrames);
  };

  const originalDuration = getTotalDuration(frames);
  const previewDuration = getTotalDuration(previewFrames);

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Reverse Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('reverse')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'reverse'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Reverse
          </button>
          <button
            onClick={() => setMode('pingpong')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'pingpong'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Ping-Pong
          </button>
        </div>
      </div>

      {/* Mode Description */}
      <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
        {mode === 'reverse' ? (
          <p>Reverses the frame order (plays backward)</p>
        ) : (
          <p>Creates a boomerang effect (plays forward then backward)</p>
        )}
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Preview
        </label>
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-64 border border-gray-700 rounded"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-xs text-gray-400">Original Frames</div>
          <div className="text-2xl font-bold text-white">{frames.length}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-xs text-gray-400">
            {mode === 'reverse' ? 'Reversed' : 'Ping-Pong'} Frames
          </div>
          <div className="text-2xl font-bold text-white">
            {previewFrames.length}
            {mode === 'pingpong' && previewFrames.length > frames.length && (
              <span className="text-sm text-green-400 ml-2">
                (+{previewFrames.length - frames.length})
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-xs text-gray-400">Original Duration</div>
          <div className="text-lg font-bold text-white">
            {(originalDuration / 1000).toFixed(2)}s
          </div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-xs text-gray-400">New Duration</div>
          <div className="text-lg font-bold text-white">
            {(previewDuration / 1000).toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Current Frame Indicator */}
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Current Frame</span>
          <span className="text-sm font-mono text-white">
            {currentFrameIndex + 1} / {previewFrames.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentFrameIndex + 1) / previewFrames.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
      >
        Apply {mode === 'reverse' ? 'Reverse' : 'Ping-Pong'} Effect
      </button>
    </div>
  );
}
