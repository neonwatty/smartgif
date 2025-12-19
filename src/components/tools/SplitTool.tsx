import { useState, useCallback, useEffect, useRef } from 'react';
import type { Frame } from '../../types';
import { downloadFramesAsZip, downloadSingleFrame } from '../../lib/splitUtils';

interface SplitToolProps {
  frames: Frame[];
  filename?: string;
}

export function SplitTool({ frames, filename = 'animation' }: SplitToolProps) {
  const [selectedFrames, setSelectedFrames] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animate preview
  useEffect(() => {
    if (frames.length === 0) return;

    const frame = frames[previewFrameIndex];
    const timeout = setTimeout(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % frames.length);
    }, frame.delay);

    return () => clearTimeout(timeout);
  }, [previewFrameIndex, frames]);

  // Draw preview frame
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || frames.length === 0) return;

    const frame = frames[previewFrameIndex];
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }
  }, [previewFrameIndex, frames]);

  const toggleFrameSelection = useCallback((index: number) => {
    setSelectedFrames(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedFrames(new Set(frames.map((_, i) => i)));
  }, [frames]);

  const deselectAll = useCallback(() => {
    setSelectedFrames(new Set());
  }, []);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadFramesAsZip(frames, filename);
    } catch (error) {
      console.error('Error downloading frames:', error);
      alert('Failed to download frames. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [frames, filename]);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedFrames.size === 0) return;

    setIsDownloading(true);
    try {
      const selectedFramesList = Array.from(selectedFrames)
        .sort((a, b) => a - b)
        .map(i => frames[i]);

      await downloadFramesAsZip(selectedFramesList, `${filename}_selected`);
    } catch (error) {
      console.error('Error downloading selected frames:', error);
      alert('Failed to download selected frames. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [selectedFrames, frames, filename]);

  const handleDownloadSingle = useCallback(async (index: number) => {
    setIsDownloading(true);
    try {
      await downloadSingleFrame(frames[index], index, filename);
    } catch (error) {
      console.error('Error downloading frame:', error);
      alert('Failed to download frame. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [frames, filename]);

  const totalDuration = frames.reduce((sum, frame) => sum + frame.delay, 0);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Calculate preview display size
  const maxDisplaySize = 200;
  const displayScale = frames.length > 0
    ? Math.min(maxDisplaySize / frames[0].imageData.width, maxDisplaySize / frames[0].imageData.height, 1)
    : 1;
  const displayWidth = frames.length > 0 ? frames[0].imageData.width * displayScale : maxDisplaySize;
  const displayHeight = frames.length > 0 ? frames[0].imageData.height * displayScale : maxDisplaySize;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Preview and Stats Row */}
        <div className="flex items-start gap-4">
          {/* Mini animated preview */}
          <div className="flex-shrink-0 bg-gray-900 rounded overflow-hidden">
            <canvas
              ref={previewCanvasRef}
              style={{
                width: displayWidth,
                height: displayHeight,
              }}
              className="object-contain"
            />
          </div>

          {/* Stats and controls */}
          <div className="flex-1 space-y-3">
            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="text-gray-400">
                <span className="text-white font-mono">{frames.length}</span> frames
              </span>
              <span className="text-gray-400">
                <span className="text-white font-mono">{frames[0]?.imageData.width}×{frames[0]?.imageData.height}</span>
              </span>
              <span className="text-gray-400">
                <span className="text-white font-mono">{formatDuration(totalDuration)}</span> total
              </span>
              <span className="text-gray-400">
                Frame <span className="text-blue-400 font-mono">{previewFrameIndex + 1}</span>/{frames.length}
              </span>
            </div>

            {/* Selection controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                disabled={selectedFrames.size === 0}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 rounded transition-colors"
              >
                Deselect All
              </button>
              {selectedFrames.size > 0 && (
                <span className="text-sm text-blue-400">
                  {selectedFrames.size} selected
                </span>
              )}
            </div>

            {/* Download buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {isDownloading ? 'Downloading...' : 'Download All as ZIP'}
              </button>
              <button
                onClick={handleDownloadSelected}
                disabled={isDownloading || selectedFrames.size === 0}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Download Selected ({selectedFrames.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Frames grid */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {frames.map((frame, index) => {
            const isSelected = selectedFrames.has(index);
            const isCurrent = index === previewFrameIndex;

            return (
              <div
                key={index}
                className={`relative group cursor-pointer rounded overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500'
                    : isCurrent
                    ? 'border-yellow-500'
                    : 'border-transparent hover:border-gray-600'
                }`}
                onClick={() => toggleFrameSelection(index)}
              >
                {/* Frame preview */}
                <div className="aspect-square bg-gray-900 flex items-center justify-center">
                  <FramePreview frame={frame} />
                </div>

                {/* Frame number overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center py-0.5">
                  <span className="text-xs text-gray-300">{index + 1}</span>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Download on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingle(index);
                  }}
                  disabled={isDownloading}
                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 w-5 h-5 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center transition-opacity"
                  title="Download this frame"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-gray-500">
        Click frames to select • Hover for download • All frames exported as PNG
      </div>
    </div>
  );
}

/**
 * Frame preview component - renders ImageData to canvas
 */
function FramePreview({ frame }: { frame: Frame }) {
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }
  }, [frame]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full max-h-full object-contain"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
