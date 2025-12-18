import { useState, useCallback } from 'react';
import type { Frame } from '../../types';
import { downloadFramesAsZip, downloadSingleFrame } from '../../lib/splitUtils';

interface SplitToolProps {
  frames: Frame[];
  filename?: string;
}

export function SplitTool({ frames, filename = 'animation' }: SplitToolProps) {
  const [selectedFrames, setSelectedFrames] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

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

  if (frames.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No frames available. Load an animation first.
      </div>
    );
  }

  const totalDuration = frames.reduce((sum, frame) => sum + frame.delay, 0);
  const avgDelay = totalDuration / frames.length;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Frame Split Tool</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-gray-400 text-sm">Total Frames</div>
            <div className="text-white text-xl font-semibold">{frames.length}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Dimensions</div>
            <div className="text-white text-xl font-semibold">
              {frames[0].imageData.width}x{frames[0].imageData.height}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Avg Delay</div>
            <div className="text-white text-xl font-semibold">{avgDelay.toFixed(0)}ms</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Duration</div>
            <div className="text-white text-xl font-semibold">
              {(totalDuration / 1000).toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isDownloading ? 'Downloading...' : 'Download All as ZIP'}
          </button>

          <button
            onClick={handleDownloadSelected}
            disabled={isDownloading || selectedFrames.size === 0}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Download Selected ({selectedFrames.size})
          </button>

          <button
            onClick={selectAll}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Select All
          </button>

          <button
            onClick={deselectAll}
            disabled={selectedFrames.size === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Frames grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {frames.map((frame, index) => {
          const isSelected = selectedFrames.has(index);

          return (
            <div
              key={index}
              className={`relative bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-transparent hover:border-gray-600'
              }`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFrameSelection(index)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Frame preview */}
              <button
                onClick={() => toggleFrameSelection(index)}
                className="w-full aspect-square bg-gray-900 flex items-center justify-center p-2 cursor-pointer hover:bg-gray-850 transition-colors"
              >
                <FramePreview frame={frame} />
              </button>

              {/* Frame info */}
              <div className="p-2 bg-gray-750 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-300">
                    Frame {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {frame.delay}ms
                  </span>
                </div>

                {/* Download button */}
                <button
                  onClick={() => handleDownloadSingle(index)}
                  disabled={isDownloading}
                  className="w-full px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Download PNG
                </button>
              </div>
            </div>
          );
        })}
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
