import { useState, useEffect, useMemo } from 'react';
import type { Frame } from '../../types';
import { resizeFrames } from '../../lib/transforms';

interface ResizeToolProps {
  frames: Frame[];
  originalWidth: number;
  originalHeight: number;
  onFramesChange: (frames: Frame[], newWidth: number, newHeight: number) => void;
}

type QualitySetting = 'low' | 'medium' | 'high';

export function ResizeTool({
  frames,
  originalWidth,
  originalHeight,
  onFramesChange,
}: ResizeToolProps) {
  const [width, setWidth] = useState(originalWidth);
  const [height, setHeight] = useState(originalHeight);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [scalePercent, setScalePercent] = useState(100);
  const [quality, setQuality] = useState<QualitySetting>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFrames, setPreviewFrames] = useState<Frame[] | null>(null);

  const aspectRatio = originalWidth / originalHeight;

  // Update dimensions when scale changes
  useEffect(() => {
    const newWidth = Math.round((originalWidth * scalePercent) / 100);
    const newHeight = Math.round((originalHeight * scalePercent) / 100);
    setWidth(newWidth);
    setHeight(newHeight);
  }, [scalePercent, originalWidth, originalHeight]);

  // Generate preview when dimensions or quality change
  useEffect(() => {
    let isCancelled = false;

    const generatePreview = async () => {
      if (width === originalWidth && height === originalHeight) {
        setPreviewFrames(null);
        return;
      }

      setIsProcessing(true);
      try {
        // Only preview first frame for performance
        const previewFrame = await resizeFrames([frames[0]], width, height, quality);
        if (!isCancelled) {
          setPreviewFrames(previewFrame);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    };

    const timeoutId = setTimeout(generatePreview, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [width, height, quality, frames, originalWidth, originalHeight]);

  const handleWidthChange = (newWidth: number) => {
    const clampedWidth = Math.max(10, Math.min(newWidth, originalWidth * 2));
    setWidth(clampedWidth);

    if (lockAspectRatio) {
      const newHeight = Math.round(clampedWidth / aspectRatio);
      setHeight(newHeight);
    }

    // Update scale percent
    const newScale = Math.round((clampedWidth / originalWidth) * 100);
    setScalePercent(newScale);
  };

  const handleHeightChange = (newHeight: number) => {
    const clampedHeight = Math.max(10, Math.min(newHeight, originalHeight * 2));
    setHeight(clampedHeight);

    if (lockAspectRatio) {
      const newWidth = Math.round(clampedHeight * aspectRatio);
      setWidth(newWidth);
    }

    // Update scale percent
    const newScale = Math.round((clampedHeight / originalHeight) * 100);
    setScalePercent(newScale);
  };

  const handleScaleChange = (newScale: number) => {
    setScalePercent(newScale);
  };

  const handleApply = async () => {
    if (width === originalWidth && height === originalHeight) {
      return;
    }

    setIsProcessing(true);
    try {
      const resizedFrames = await resizeFrames(frames, width, height, quality);
      onFramesChange(resizedFrames, width, height);
    } catch (error) {
      console.error('Error resizing frames:', error);
      alert('Error resizing frames. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create preview URL from preview frames
  const previewUrl = useMemo(() => {
    if (!previewFrames || previewFrames.length === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.putImageData(previewFrames[0].imageData, 0, 0);
    return canvas.toDataURL();
  }, [previewFrames, width, height]);

  const hasChanges = width !== originalWidth || height !== originalHeight;

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400">
        Original: {originalWidth}×{originalHeight}
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-gray-400">Width (px)</span>
          <input
            type="number"
            min="10"
            max={originalWidth * 2}
            value={width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            disabled={isProcessing}
            className="w-full mt-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-400">Height (px)</span>
          <input
            type="number"
            min="10"
            max={originalHeight * 2}
            value={height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            disabled={isProcessing}
            className="w-full mt-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
        </label>
      </div>

      {/* Lock Aspect Ratio */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={lockAspectRatio}
          onChange={(e) => setLockAspectRatio(e.target.checked)}
          disabled={isProcessing}
          className="w-4 h-4 rounded bg-gray-700 border-gray-600"
        />
        <span className="text-sm text-gray-300">Lock aspect ratio</span>
      </label>

      {/* Scale Percentage */}
      <label className="block">
        <span className="text-sm text-gray-400">Scale: {scalePercent}%</span>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={scalePercent}
          onChange={(e) => handleScaleChange(Number(e.target.value))}
          disabled={isProcessing}
          className="w-full mt-1"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      </label>

      {/* Quality Selector */}
      <div className="space-y-2">
        <span className="text-sm text-gray-400">Quality</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setQuality('low')}
            disabled={isProcessing}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              quality === 'low'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            Low
          </button>
          <button
            onClick={() => setQuality('medium')}
            disabled={isProcessing}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              quality === 'medium'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            Medium
          </button>
          <button
            onClick={() => setQuality('high')}
            disabled={isProcessing}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              quality === 'high'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            High
          </button>
        </div>
      </div>

      {/* Preview */}
      {hasChanges && (
        <div className="space-y-2">
          <span className="text-sm text-gray-400">Preview</span>
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
            {isProcessing && !previewUrl ? (
              <div className="text-gray-500">Generating preview...</div>
            ) : previewUrl ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Resize preview"
                  className="max-w-full max-h-[300px] object-contain rounded"
                />
                <div className="text-xs text-gray-500 text-center">
                  {width}×{height}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Preview unavailable</div>
            )}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={isProcessing || !hasChanges}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
      >
        {isProcessing ? 'Processing...' : hasChanges ? 'Apply Resize' : 'No Changes'}
      </button>
    </div>
  );
}
