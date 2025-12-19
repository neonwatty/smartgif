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

const SCALE_PRESETS = [25, 50, 75, 100, 125, 150, 200];

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

  // Create original preview URL
  const originalUrl = useMemo(() => {
    if (!frames || frames.length === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.putImageData(frames[0].imageData, 0, 0);
    return canvas.toDataURL();
  }, [frames, originalWidth, originalHeight]);

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
    const clampedWidth = Math.max(10, Math.min(newWidth, originalWidth * 4));
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
    const clampedHeight = Math.max(10, Math.min(newHeight, originalHeight * 4));
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

  const handlePresetClick = (preset: number) => {
    setScalePercent(preset);
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

  // Calculate display sizes for side-by-side comparison
  const maxDisplaySize = 350;
  const originalDisplayScale = Math.min(maxDisplaySize / originalWidth, maxDisplaySize / originalHeight, 1);
  const originalDisplayWidth = originalWidth * originalDisplayScale;
  const originalDisplayHeight = originalHeight * originalDisplayScale;

  const previewDisplayScale = Math.min(maxDisplaySize / width, maxDisplaySize / height, 1);
  const previewDisplayWidth = width * previewDisplayScale;
  const previewDisplayHeight = height * previewDisplayScale;

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Scale Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Scale:</span>
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              disabled={isProcessing}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                scalePercent === preset
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              {preset}%
            </button>
          ))}
        </div>

        {/* Scale Slider */}
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="10"
            max="400"
            step="5"
            value={scalePercent}
            onChange={(e) => handleScaleChange(Number(e.target.value))}
            disabled={isProcessing}
            className="flex-1"
          />
          <span className="text-sm text-gray-300 w-16 text-right">{scalePercent}%</span>
        </div>

        {/* Dimensions Row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">W:</span>
            <input
              type="number"
              min="10"
              max={originalWidth * 4}
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              disabled={isProcessing}
              className="w-20 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-white text-sm"
            />
          </div>

          <button
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`p-1 rounded transition-colors ${
              lockAspectRatio ? 'text-blue-400' : 'text-gray-500'
            }`}
            title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
          >
            {lockAspectRatio ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">H:</span>
            <input
              type="number"
              min="10"
              max={originalHeight * 4}
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              disabled={isProcessing}
              className="w-20 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-white text-sm"
            />
          </div>

          <div className="flex-1" />

          {/* Quality */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Quality:</span>
            {(['low', 'medium', 'high'] as QualitySetting[]).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                disabled={isProcessing}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  quality === q
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isProcessing || !hasChanges}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Processing...' : hasChanges ? 'Apply Resize' : 'No Changes'}
        </button>
      </div>

      {/* Side-by-Side Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3">
            Original ({originalWidth} × {originalHeight})
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            {originalUrl && (
              <img
                src={originalUrl}
                alt="Original"
                style={{
                  width: originalDisplayWidth,
                  height: originalDisplayHeight,
                }}
                className="object-contain"
              />
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3">
            Preview ({width} × {height})
            {hasChanges && (
              <span className="ml-2 text-xs text-gray-500">
                {scalePercent < 100 ? `${100 - scalePercent}% smaller` : scalePercent > 100 ? `${scalePercent - 100}% larger` : ''}
              </span>
            )}
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            {isProcessing && !previewUrl ? (
              <div className="text-gray-500">Generating preview...</div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Resize preview"
                style={{
                  width: previewDisplayWidth,
                  height: previewDisplayHeight,
                }}
                className="object-contain"
              />
            ) : originalUrl ? (
              <img
                src={originalUrl}
                alt="Original (no changes)"
                style={{
                  width: originalDisplayWidth,
                  height: originalDisplayHeight,
                }}
                className="object-contain"
              />
            ) : (
              <div className="text-gray-500">Preview unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Size Info */}
      {hasChanges && (
        <div className="text-center text-sm text-gray-500">
          {width * height < originalWidth * originalHeight ? (
            <span className="text-green-400">
              {Math.round((1 - (width * height) / (originalWidth * originalHeight)) * 100)}% fewer pixels
            </span>
          ) : (
            <span className="text-yellow-400">
              {Math.round(((width * height) / (originalWidth * originalHeight) - 1) * 100)}% more pixels
            </span>
          )}
        </div>
      )}
    </div>
  );
}
