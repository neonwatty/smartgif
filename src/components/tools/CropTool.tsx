import { useState, useRef, useEffect, useCallback } from 'react';
import type { Frame } from '../../types';
import {
  cropFrames,
  autoCrop,
  getAspectRatioRect,
  ASPECT_RATIOS,
  type CropRect,
} from '../../lib/transforms';

interface CropToolProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

type AspectRatioKey = keyof typeof ASPECT_RATIOS | 'free';

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;
  startX: number;
  startY: number;
  startRect: CropRect;
}

export function CropTool({ frames, onFramesChange }: CropToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropRect, setCropRect] = useState<CropRect>({
    x: 0,
    y: 0,
    width: frames[0]?.imageData.width || 100,
    height: frames[0]?.imageData.height || 100,
  });

  const [selectedAspect, setSelectedAspect] = useState<AspectRatioKey>('free');
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    startX: 0,
    startY: 0,
    startRect: { x: 0, y: 0, width: 0, height: 0 },
  });

  const [scale, setScale] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize crop rect to full image when frames change
  useEffect(() => {
    if (frames[0]) {
      const { width, height } = frames[0].imageData;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCropRect({ x: 0, y: 0, width, height });
    }
  }, [frames]);

  // Render canvas and crop overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !frames[0]) return;

    const { imageData } = frames[0];
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // Calculate scale to fit container
    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = 500; // max height
    const scaleX = containerWidth / imageData.width;
    const scaleY = containerHeight / imageData.height;
    const newScale = Math.min(scaleX, scaleY, 1);
    setScale(newScale);

    // Draw image
    ctx.putImageData(imageData, 0, 0);
  }, [frames]);

  // Generate preview of cropped result
  useEffect(() => {
    if (!frames[0]) return;

    const canvas = document.createElement('canvas');
    canvas.width = cropRect.width;
    canvas.height = cropRect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create temp canvas with full image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frames[0].imageData.width;
    tempCanvas.height = frames[0].imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.putImageData(frames[0].imageData, 0, 0);

    // Draw cropped portion
    ctx.drawImage(
      tempCanvas,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      cropRect.width,
      cropRect.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
    });

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [cropRect, frames]);

  const constrainRect = useCallback(
    (rect: CropRect): CropRect => {
      if (!frames[0]) return rect;
      const { width: maxW, height: maxH } = frames[0].imageData;

      return {
        x: Math.max(0, Math.min(rect.x, maxW - rect.width)),
        y: Math.max(0, Math.min(rect.y, maxH - rect.height)),
        width: Math.max(10, Math.min(rect.width, maxW)),
        height: Math.max(10, Math.min(rect.height, maxH)),
      };
    },
    [frames]
  );

  const handleAspectRatioChange = (aspect: AspectRatioKey) => {
    setSelectedAspect(aspect);

    if (aspect === 'free' || !frames[0]) return;

    const { width, height } = frames[0].imageData;
    const ratio = ASPECT_RATIOS[aspect];
    const newRect = getAspectRatioRect(width, height, ratio, true);
    setCropRect(newRect);
  };

  const handleAutoCrop = () => {
    if (!frames[0]) return;
    const rect = autoCrop(frames[0].imageData, 0);
    setCropRect(rect);
    setSelectedAspect('free');
  };

  const handleManualInput = (field: keyof CropRect, value: number) => {
    const newRect = { ...cropRect, [field]: Math.max(0, value) };
    setCropRect(constrainRect(newRect));
  };

  const handleApply = () => {
    const croppedFrames = cropFrames(frames, cropRect);
    onFramesChange(croppedFrames);
  };

  const getHandleRect = (handle: string): { x: number; y: number } => {
    const handleSize = 8;
    const offset = handleSize / 2;

    const positions = {
      nw: { x: cropRect.x - offset, y: cropRect.y - offset },
      ne: { x: cropRect.x + cropRect.width - offset, y: cropRect.y - offset },
      sw: { x: cropRect.x - offset, y: cropRect.y + cropRect.height - offset },
      se: {
        x: cropRect.x + cropRect.width - offset,
        y: cropRect.y + cropRect.height - offset,
      },
      n: { x: cropRect.x + cropRect.width / 2 - offset, y: cropRect.y - offset },
      s: {
        x: cropRect.x + cropRect.width / 2 - offset,
        y: cropRect.y + cropRect.height - offset,
      },
      e: {
        x: cropRect.x + cropRect.width - offset,
        y: cropRect.y + cropRect.height / 2 - offset,
      },
      w: { x: cropRect.x - offset, y: cropRect.y + cropRect.height / 2 - offset },
    };

    return positions[handle as keyof typeof positions] || { x: 0, y: 0 };
  };

  const isPointInHandle = (x: number, y: number, handle: string): boolean => {
    const handleRect = getHandleRect(handle);
    const handleSize = 8;
    return (
      x >= handleRect.x &&
      x <= handleRect.x + handleSize &&
      y >= handleRect.y &&
      y <= handleRect.y + handleSize
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check resize handles
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    for (const handle of handles) {
      if (isPointInHandle(x, y, handle)) {
        setDragState({
          isDragging: false,
          isResizing: true,
          resizeHandle: handle as DragState['resizeHandle'],
          startX: x,
          startY: y,
          startRect: { ...cropRect },
        });
        return;
      }
    }

    // Check if clicking inside crop rect for dragging
    if (
      x >= cropRect.x &&
      x <= cropRect.x + cropRect.width &&
      y >= cropRect.y &&
      y <= cropRect.y + cropRect.height
    ) {
      setDragState({
        isDragging: true,
        isResizing: false,
        resizeHandle: null,
        startX: x,
        startY: y,
        startRect: { ...cropRect },
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (!dragState.isDragging && !dragState.isResizing)) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (dragState.isDragging) {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;
      const newRect = {
        ...dragState.startRect,
        x: dragState.startRect.x + dx,
        y: dragState.startRect.y + dy,
      };
      setCropRect(constrainRect(newRect));
    } else if (dragState.isResizing && dragState.resizeHandle) {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;
      const { startRect } = dragState;
      const handle = dragState.resizeHandle;

      const newRect = { ...startRect };

      if (handle.includes('w')) {
        newRect.x = startRect.x + dx;
        newRect.width = startRect.width - dx;
      }
      if (handle.includes('e')) {
        newRect.width = startRect.width + dx;
      }
      if (handle.includes('n')) {
        newRect.y = startRect.y + dy;
        newRect.height = startRect.height - dy;
      }
      if (handle.includes('s')) {
        newRect.height = startRect.height + dy;
      }

      // Maintain aspect ratio if selected
      if (selectedAspect !== 'free') {
        const ratio = ASPECT_RATIOS[selectedAspect];
        const newWidth = newRect.width;
        const newHeight = newWidth / ratio;

        if (handle.includes('n')) {
          newRect.y = newRect.y + newRect.height - newHeight;
        }
        newRect.height = newHeight;
      }

      setCropRect(constrainRect(newRect));
    }
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      isResizing: false,
      resizeHandle: null,
      startX: 0,
      startY: 0,
      startRect: { x: 0, y: 0, width: 0, height: 0 },
    });
  };

  if (!frames[0]) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Crop Tool</h3>

        {/* Aspect Ratio Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Aspect Ratio</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAspectRatioChange('free')}
              className={`px-3 py-1.5 rounded text-sm ${
                selectedAspect === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Free
            </button>
            {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[])
              .filter((key) => ['1:1', '4:3', '16:9', '3:2', '2:1'].includes(key))
              .map((key) => (
                <button
                  key={key}
                  onClick={() => handleAspectRatioChange(key)}
                  className={`px-3 py-1.5 rounded text-sm ${
                    selectedAspect === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {key}
                </button>
              ))}
          </div>
        </div>

        {/* Manual Input */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">X</label>
            <input
              type="number"
              value={cropRect.x}
              onChange={(e) => handleManualInput('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Y</label>
            <input
              type="number"
              value={cropRect.y}
              onChange={(e) => handleManualInput('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Width</label>
            <input
              type="number"
              value={cropRect.width}
              onChange={(e) => handleManualInput('width', parseInt(e.target.value) || 10)}
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Height</label>
            <input
              type="number"
              value={cropRect.height}
              onChange={(e) => handleManualInput('height', parseInt(e.target.value) || 10)}
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAutoCrop}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-sm"
          >
            Auto Crop
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Apply to All Frames
          </button>
        </div>
      </div>

      {/* Canvas with Crop Overlay */}
      <div
        ref={containerRef}
        className="bg-gray-800 rounded-lg p-5 flex items-center justify-center"
      >
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              cursor: dragState.isDragging
                ? 'move'
                : dragState.isResizing
                  ? 'nwse-resize'
                  : 'crosshair',
            }}
            className="border border-gray-700"
          />
          {/* Crop overlay */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: frames[0].imageData.width * scale,
              height: frames[0].imageData.height * scale,
              pointerEvents: 'none',
            }}
          >
            {/* Darkened overlay outside crop */}
            <rect
              x={0}
              y={0}
              width={frames[0].imageData.width}
              height={frames[0].imageData.height}
              fill="black"
              opacity={0.5}
            />
            <rect
              x={cropRect.x}
              y={cropRect.y}
              width={cropRect.width}
              height={cropRect.height}
              fill="transparent"
            />

            {/* Crop rectangle border */}
            <rect
              x={cropRect.x}
              y={cropRect.y}
              width={cropRect.width}
              height={cropRect.height}
              stroke="white"
              strokeWidth={2}
              fill="none"
              strokeDasharray="5,5"
            />

            {/* Resize handles */}
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((handle) => {
              const pos = getHandleRect(handle);
              return (
                <rect
                  key={handle}
                  x={pos.x}
                  y={pos.y}
                  width={8}
                  height={8}
                  fill="white"
                  stroke="blue"
                  strokeWidth={1}
                  style={{ pointerEvents: 'auto', cursor: 'nwse-resize' }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Preview</label>
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Crop preview"
              className="max-w-full max-h-64 object-contain"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {cropRect.width} x {cropRect.height} pixels
          </p>
        </div>
      )}
    </div>
  );
}
