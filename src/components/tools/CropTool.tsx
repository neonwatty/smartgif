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
type HandleType = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: HandleType;
  startX: number;
  startY: number;
  startRect: CropRect;
}

// Cursor mapping for resize handles
const HANDLE_CURSORS: Record<string, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
};

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
  const [hoveredHandle, setHoveredHandle] = useState<HandleType>(null);
  const [isOverCropArea, setIsOverCropArea] = useState(false);

  // Initialize crop rect to full image when frames change
  useEffect(() => {
    if (frames[0]) {
      const { width, height } = frames[0].imageData;
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

    // Calculate scale to fit container (max 400px height for side-by-side layout)
    const containerWidth = container.clientWidth;
    const maxHeight = 400;
    const scaleX = containerWidth / imageData.width;
    const scaleY = maxHeight / imageData.height;
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

      let newRect = { ...rect };

      // Ensure minimum size
      newRect.width = Math.max(10, newRect.width);
      newRect.height = Math.max(10, newRect.height);

      // Constrain to image bounds
      newRect.width = Math.min(newRect.width, maxW);
      newRect.height = Math.min(newRect.height, maxH);
      newRect.x = Math.max(0, Math.min(newRect.x, maxW - newRect.width));
      newRect.y = Math.max(0, Math.min(newRect.y, maxH - newRect.height));

      return newRect;
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
    const handleSize = 12;
    const offset = handleSize / 2;

    const positions: Record<string, { x: number; y: number }> = {
      nw: { x: cropRect.x - offset, y: cropRect.y - offset },
      ne: { x: cropRect.x + cropRect.width - offset, y: cropRect.y - offset },
      sw: { x: cropRect.x - offset, y: cropRect.y + cropRect.height - offset },
      se: { x: cropRect.x + cropRect.width - offset, y: cropRect.y + cropRect.height - offset },
      n: { x: cropRect.x + cropRect.width / 2 - offset, y: cropRect.y - offset },
      s: { x: cropRect.x + cropRect.width / 2 - offset, y: cropRect.y + cropRect.height - offset },
      e: { x: cropRect.x + cropRect.width - offset, y: cropRect.y + cropRect.height / 2 - offset },
      w: { x: cropRect.x - offset, y: cropRect.y + cropRect.height / 2 - offset },
    };

    return positions[handle] || { x: 0, y: 0 };
  };

  const isPointInHandle = (x: number, y: number, handle: string): boolean => {
    const handleRect = getHandleRect(handle);
    const handleSize = 12;
    const hitPadding = 6;
    return (
      x >= handleRect.x - hitPadding &&
      x <= handleRect.x + handleSize + hitPadding &&
      y >= handleRect.y - hitPadding &&
      y <= handleRect.y + handleSize + hitPadding
    );
  };

  const isPointInCropArea = (x: number, y: number): boolean => {
    return (
      x >= cropRect.x &&
      x <= cropRect.x + cropRect.width &&
      y >= cropRect.y &&
      y <= cropRect.y + cropRect.height
    );
  };

  const getHoveredHandle = (x: number, y: number): HandleType => {
    const handles: HandleType[] = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    for (const handle of handles) {
      if (isPointInHandle(x, y, handle)) {
        return handle;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check resize handles first
    const handle = getHoveredHandle(x, y);
    if (handle) {
      setDragState({
        isDragging: false,
        isResizing: true,
        resizeHandle: handle,
        startX: x,
        startY: y,
        startRect: { ...cropRect },
      });
      return;
    }

    // Check if clicking inside crop rect for dragging
    if (isPointInCropArea(x, y)) {
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
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Update hover state for cursor
    if (!dragState.isDragging && !dragState.isResizing) {
      const handle = getHoveredHandle(x, y);
      setHoveredHandle(handle);
      setIsOverCropArea(handle === null && isPointInCropArea(x, y));
    }

    // Handle dragging
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

  const handleMouseLeave = () => {
    handleMouseUp();
    setHoveredHandle(null);
    setIsOverCropArea(false);
  };

  // Determine cursor based on state
  const getCursor = (): string => {
    if (dragState.isResizing && dragState.resizeHandle) {
      return HANDLE_CURSORS[dragState.resizeHandle];
    }
    if (dragState.isDragging) {
      return 'move';
    }
    if (hoveredHandle) {
      return HANDLE_CURSORS[hoveredHandle];
    }
    if (isOverCropArea) {
      return 'move';
    }
    return 'crosshair';
  };

  if (!frames[0]) return null;

  const imageWidth = frames[0].imageData.width;
  const imageHeight = frames[0].imageData.height;

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Aspect Ratio Presets */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-400">Aspect Ratio:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAspectRatioChange('free')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                selectedAspect === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Free
            </button>
            {(['1:1', '4:3', '16:9', '3:2', '2:1'] as AspectRatioKey[]).map((key) => (
              <button
                key={key}
                onClick={() => handleAspectRatioChange(key)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
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

        {/* Manual Input & Actions */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(cropRect.x)}
                onChange={(e) => handleManualInput('x', parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(cropRect.y)}
                onChange={(e) => handleManualInput('y', parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Width</label>
              <input
                type="number"
                value={Math.round(cropRect.width)}
                onChange={(e) => handleManualInput('width', parseInt(e.target.value) || 10)}
                className="w-20 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Height</label>
              <input
                type="number"
                value={Math.round(cropRect.height)}
                onChange={(e) => handleManualInput('height', parseInt(e.target.value) || 10)}
                className="w-20 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAutoCrop}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-sm transition-colors"
            >
              Auto Crop
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-side: Crop Area and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crop Area */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-400 mb-3">
            Original ({imageWidth} x {imageHeight})
          </div>
          <div
            ref={containerRef}
            className="flex items-center justify-center overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  cursor: getCursor(),
                }}
                className="border border-gray-700"
              />
              {/* Crop overlay */}
              <svg
                viewBox={`0 0 ${imageWidth} ${imageHeight}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: imageWidth * scale,
                  height: imageHeight * scale,
                  pointerEvents: 'none',
                }}
              >
                {/* Darkened overlay outside crop - using clip path */}
                <defs>
                  <mask id="cropMask">
                    <rect x={0} y={0} width={imageWidth} height={imageHeight} fill="white" />
                    <rect
                      x={cropRect.x}
                      y={cropRect.y}
                      width={cropRect.width}
                      height={cropRect.height}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  x={0}
                  y={0}
                  width={imageWidth}
                  height={imageHeight}
                  fill="black"
                  opacity={0.6}
                  mask="url(#cropMask)"
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
                />

                {/* Rule of thirds grid */}
                <g stroke="white" strokeWidth={0.5} opacity={0.4}>
                  <line
                    x1={cropRect.x + cropRect.width / 3}
                    y1={cropRect.y}
                    x2={cropRect.x + cropRect.width / 3}
                    y2={cropRect.y + cropRect.height}
                  />
                  <line
                    x1={cropRect.x + (cropRect.width * 2) / 3}
                    y1={cropRect.y}
                    x2={cropRect.x + (cropRect.width * 2) / 3}
                    y2={cropRect.y + cropRect.height}
                  />
                  <line
                    x1={cropRect.x}
                    y1={cropRect.y + cropRect.height / 3}
                    x2={cropRect.x + cropRect.width}
                    y2={cropRect.y + cropRect.height / 3}
                  />
                  <line
                    x1={cropRect.x}
                    y1={cropRect.y + (cropRect.height * 2) / 3}
                    x2={cropRect.x + cropRect.width}
                    y2={cropRect.y + (cropRect.height * 2) / 3}
                  />
                </g>

                {/* Resize handles */}
                {(['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as const).map((handle) => {
                  const pos = getHandleRect(handle);
                  const isHovered = hoveredHandle === handle;
                  const isActive = dragState.resizeHandle === handle;
                  return (
                    <rect
                      key={handle}
                      x={pos.x}
                      y={pos.y}
                      width={12}
                      height={12}
                      fill={isActive ? '#3b82f6' : isHovered ? '#60a5fa' : 'white'}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      rx={2}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-400 mb-3">
            Preview ({Math.round(cropRect.width)} x {Math.round(cropRect.height)})
          </div>
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Crop preview"
                className="max-w-full max-h-80 object-contain border border-gray-700"
              />
            ) : (
              <div className="text-gray-500">Loading preview...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
