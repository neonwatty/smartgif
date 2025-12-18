import { useState, useEffect, useRef } from 'react';
import type { Frame } from '../../types';
import { rotateFrames, flipFrames, type RotateAngle, type FlipDirection } from '../../lib/transforms';

interface RotateToolProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

export function RotateTool({ frames, onFramesChange }: RotateToolProps) {
  const [pendingRotation, setPendingRotation] = useState<RotateAngle>(0);
  const [pendingFlip, setPendingFlip] = useState<FlipDirection | null>(null);
  const [preview, setPreview] = useState<Frame[] | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate new dimensions after rotation
  const getNewDimensions = () => {
    if (frames.length === 0) return { width: 0, height: 0 };

    const { width, height } = frames[0].imageData;

    // 90° and 270° rotations swap dimensions
    if (pendingRotation === 90 || pendingRotation === 270) {
      return { width: height, height: width };
    }

    return { width, height };
  };

  // Update preview when rotation or flip changes
  useEffect(() => {
    if (frames.length === 0) return;

    let transformed = frames;

    // Apply rotation if any
    if (pendingRotation !== 0) {
      transformed = rotateFrames(transformed, pendingRotation);
    }

    // Apply flip if any
    if (pendingFlip) {
      transformed = flipFrames(transformed, pendingFlip);
    }

    setPreview(transformed);
  }, [frames, pendingRotation, pendingFlip]);

  // Render preview on canvas
  useEffect(() => {
    if (!canvasRef.current || !preview || preview.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const firstFrame = preview[0];
    canvas.width = firstFrame.imageData.width;
    canvas.height = firstFrame.imageData.height;
    ctx.putImageData(firstFrame.imageData, 0, 0);
  }, [preview]);

  const handleRotate = (angle: RotateAngle) => {
    // Calculate cumulative rotation (0-360)
    const newRotation = ((pendingRotation + angle) % 360) as RotateAngle;
    setPendingRotation(newRotation);
  };

  const handleFlip = (direction: FlipDirection) => {
    if (pendingFlip === direction) {
      // Toggle off if clicking the same direction
      setPendingFlip(null);
    } else if (pendingFlip === null) {
      // Set new flip direction
      setPendingFlip(direction);
    } else if (pendingFlip === 'horizontal' && direction === 'vertical') {
      // Combine horizontal + vertical = both
      setPendingFlip('both');
    } else if (pendingFlip === 'vertical' && direction === 'horizontal') {
      // Combine vertical + horizontal = both
      setPendingFlip('both');
    } else if (pendingFlip === 'both') {
      // If both is active, switch to the opposite of what was clicked
      setPendingFlip(direction === 'horizontal' ? 'vertical' : 'horizontal');
    }
  };

  const handleApply = async () => {
    if (!preview || (pendingRotation === 0 && !pendingFlip)) return;

    setIsApplying(true);
    try {
      // Use the preview frames (already transformed)
      onFramesChange(preview);

      // Reset pending transforms
      setPendingRotation(0);
      setPendingFlip(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    setPendingRotation(0);
    setPendingFlip(null);
  };

  const hasChanges = pendingRotation !== 0 || pendingFlip !== null;
  const newDimensions = getNewDimensions();
  const originalDimensions = frames.length > 0
    ? { width: frames[0].imageData.width, height: frames[0].imageData.height }
    : { width: 0, height: 0 };

  if (frames.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No frames loaded. Please load an image or GIF first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rotate Controls */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Rotate</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleRotate(90)}
            className="py-2 px-4 rounded-lg font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
            disabled={isApplying}
          >
            90° CW
          </button>
          <button
            onClick={() => handleRotate(270)}
            className="py-2 px-4 rounded-lg font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
            disabled={isApplying}
          >
            90° CCW
          </button>
          <button
            onClick={() => handleRotate(180)}
            className="py-2 px-4 rounded-lg font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
            disabled={isApplying}
          >
            180°
          </button>
        </div>
      </div>

      {/* Flip Controls */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Flip</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleFlip('horizontal')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              pendingFlip === 'horizontal' || pendingFlip === 'both'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
            disabled={isApplying}
          >
            Horizontal
          </button>
          <button
            onClick={() => handleFlip('vertical')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              pendingFlip === 'vertical' || pendingFlip === 'both'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            Vertical
          </button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
        <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border border-gray-600 rounded"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Dimensions Info */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Original:</span>
            <span className="ml-2 text-white font-mono">
              {originalDimensions.width} × {originalDimensions.height}
            </span>
          </div>
          <div>
            <span className="text-gray-400">New:</span>
            <span className="ml-2 text-white font-mono">
              {newDimensions.width} × {newDimensions.height}
            </span>
          </div>
        </div>
        {pendingRotation !== 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Current rotation: {pendingRotation}°
          </div>
        )}
        {pendingFlip && (
          <div className="mt-2 text-sm text-gray-400">
            Flipped: {pendingFlip}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          disabled={!hasChanges || isApplying}
          className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={!hasChanges || isApplying}
          className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </div>
  );
}
