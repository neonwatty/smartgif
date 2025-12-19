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
  const [previewFrames, setPreviewFrames] = useState<Frame[]>(frames);
  const [isApplying, setIsApplying] = useState(false);

  // Animation state
  const [originalFrameIndex, setOriginalFrameIndex] = useState(0);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update preview when rotation or flip changes
  useEffect(() => {
    if (frames.length === 0) return;

    let transformed = frames;

    if (pendingRotation !== 0) {
      transformed = rotateFrames(transformed, pendingRotation);
    }

    if (pendingFlip) {
      transformed = flipFrames(transformed, pendingFlip);
    }

    setPreviewFrames(transformed);
    setPreviewFrameIndex(0);
  }, [frames, pendingRotation, pendingFlip]);

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

  const handleRotate = (angle: RotateAngle) => {
    const newRotation = ((pendingRotation + angle) % 360) as RotateAngle;
    setPendingRotation(newRotation);
  };

  const handleFlip = (direction: FlipDirection) => {
    if (pendingFlip === direction) {
      setPendingFlip(null);
    } else if (pendingFlip === null) {
      setPendingFlip(direction);
    } else if (pendingFlip === 'horizontal' && direction === 'vertical') {
      setPendingFlip('both');
    } else if (pendingFlip === 'vertical' && direction === 'horizontal') {
      setPendingFlip('both');
    } else if (pendingFlip === 'both') {
      setPendingFlip(direction === 'horizontal' ? 'vertical' : 'horizontal');
    }
  };

  const handleApply = async () => {
    if (pendingRotation === 0 && !pendingFlip) return;

    setIsApplying(true);
    try {
      onFramesChange(previewFrames);
      setPendingRotation(0);
      setPendingFlip(null);
    } finally {
      setIsApplying(false);
    }
  };

  const hasChanges = pendingRotation !== 0 || pendingFlip !== null;

  const originalDimensions = frames.length > 0
    ? { width: frames[0].imageData.width, height: frames[0].imageData.height }
    : { width: 0, height: 0 };

  const newDimensions = previewFrames.length > 0
    ? { width: previewFrames[0].imageData.width, height: previewFrames[0].imageData.height }
    : originalDimensions;

  const dimensionsChanged = newDimensions.width !== originalDimensions.width ||
                           newDimensions.height !== originalDimensions.height;

  // Calculate canvas display size
  const maxDisplaySize = 300;
  const originalDisplayScale = frames.length > 0
    ? Math.min(maxDisplaySize / frames[0].imageData.width, maxDisplaySize / frames[0].imageData.height, 1)
    : 1;
  const originalDisplayWidth = frames.length > 0 ? frames[0].imageData.width * originalDisplayScale : maxDisplaySize;
  const originalDisplayHeight = frames.length > 0 ? frames[0].imageData.height * originalDisplayScale : maxDisplaySize;

  const previewDisplayScale = previewFrames.length > 0
    ? Math.min(maxDisplaySize / previewFrames[0].imageData.width, maxDisplaySize / previewFrames[0].imageData.height, 1)
    : 1;
  const previewDisplayWidth = previewFrames.length > 0 ? previewFrames[0].imageData.width * previewDisplayScale : maxDisplaySize;
  const previewDisplayHeight = previewFrames.length > 0 ? previewFrames[0].imageData.height * previewDisplayScale : maxDisplaySize;

  // Build transformation description
  const getTransformDescription = () => {
    const parts: string[] = [];
    if (pendingRotation !== 0) {
      parts.push(`${pendingRotation}°`);
    }
    if (pendingFlip === 'horizontal') {
      parts.push('H-Flip');
    } else if (pendingFlip === 'vertical') {
      parts.push('V-Flip');
    } else if (pendingFlip === 'both') {
      parts.push('H+V Flip');
    }
    return parts.length > 0 ? parts.join(' + ') : 'No changes';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Rotate Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-14">Rotate:</span>
          <button
            onClick={() => handleRotate(270)}
            disabled={isApplying}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              pendingRotation === 270
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            ↺ 90° CCW
          </button>
          <button
            onClick={() => handleRotate(180)}
            disabled={isApplying}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              pendingRotation === 180
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            ↻ 180°
          </button>
          <button
            onClick={() => handleRotate(90)}
            disabled={isApplying}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              pendingRotation === 90
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            ↻ 90° CW
          </button>
        </div>

        {/* Flip Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-14">Flip:</span>
          <button
            onClick={() => handleFlip('horizontal')}
            disabled={isApplying}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              pendingFlip === 'horizontal' || pendingFlip === 'both'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            ↔ Horizontal
          </button>
          <button
            onClick={() => handleFlip('vertical')}
            disabled={isApplying}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              pendingFlip === 'vertical' || pendingFlip === 'both'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            ↕ Vertical
          </button>
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {getTransformDescription()}
          </span>
          <span className="text-gray-400">
            {originalDimensions.width}×{originalDimensions.height}
            {dimensionsChanged && (
              <>
                <span className="mx-2">→</span>
                <span className="text-blue-400">{newDimensions.width}×{newDimensions.height}</span>
              </>
            )}
          </span>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={!hasChanges || isApplying}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          {isApplying ? 'Applying...' : hasChanges ? `Apply ${getTransformDescription()}` : 'No Changes'}
        </button>
      </div>

      {/* Side-by-Side Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
            <span>Original</span>
            <span className="text-xs">{originalDimensions.width}×{originalDimensions.height}</span>
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <canvas
              ref={originalCanvasRef}
              style={{
                width: originalDisplayWidth,
                height: originalDisplayHeight,
              }}
              className="object-contain"
            />
          </div>
        </div>

        {/* Transformed Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
            <span>{hasChanges ? getTransformDescription() : 'Preview'}</span>
            <span className={`text-xs ${dimensionsChanged ? 'text-blue-400' : ''}`}>
              {newDimensions.width}×{newDimensions.height}
            </span>
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <canvas
              ref={previewCanvasRef}
              style={{
                width: previewDisplayWidth,
                height: previewDisplayHeight,
              }}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
