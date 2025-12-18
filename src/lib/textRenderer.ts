/**
 * Text rendering utilities for adding text overlays to images
 */

import type { Frame } from '../types';

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  outlineColor?: string;
  outlineWidth?: number;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  opacity?: number;
}

export interface ImageOverlay {
  imageData: ImageData;
  x: number;
  y: number;
  opacity?: number;
}

/**
 * Available web-safe fonts
 */
export const FONTS = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Georgia',
  'Impact',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'monospace',
  'sans-serif',
  'serif',
] as const;

/**
 * Render text onto an ImageData
 */
export function renderText(imageData: ImageData, overlay: TextOverlay): ImageData {
  const { width, height } = imageData;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw original image
  ctx.putImageData(imageData, 0, 0);

  // Set text properties
  ctx.font = `${overlay.fontSize}px "${overlay.fontFamily}"`;
  ctx.textAlign = overlay.align || 'left';
  ctx.textBaseline = overlay.baseline || 'top';
  ctx.globalAlpha = overlay.opacity ?? 1;

  // Draw outline if specified
  if (overlay.outlineColor && overlay.outlineWidth) {
    ctx.strokeStyle = overlay.outlineColor;
    ctx.lineWidth = overlay.outlineWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(overlay.text, overlay.x, overlay.y);
  }

  // Draw text
  ctx.fillStyle = overlay.color;
  ctx.fillText(overlay.text, overlay.x, overlay.y);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Render text onto all frames
 */
export function renderTextOnFrames(frames: Frame[], overlay: TextOverlay): Frame[] {
  return frames.map(frame => ({
    ...frame,
    imageData: renderText(frame.imageData, overlay),
  }));
}

/**
 * Render text with per-frame customization
 */
export function renderTextOnFramesCustom(
  frames: Frame[],
  overlayFn: (frameIndex: number, frame: Frame) => TextOverlay | null
): Frame[] {
  return frames.map((frame, index) => {
    const overlay = overlayFn(index, frame);
    if (!overlay) return frame;

    return {
      ...frame,
      imageData: renderText(frame.imageData, overlay),
    };
  });
}

/**
 * Render an image overlay onto ImageData
 */
export function renderImageOverlay(imageData: ImageData, overlay: ImageOverlay): ImageData {
  const { width, height } = imageData;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw original image
  ctx.putImageData(imageData, 0, 0);

  // Create overlay canvas
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = overlay.imageData.width;
  overlayCanvas.height = overlay.imageData.height;
  const overlayCtx = overlayCanvas.getContext('2d')!;
  overlayCtx.putImageData(overlay.imageData, 0, 0);

  // Draw overlay with opacity
  ctx.globalAlpha = overlay.opacity ?? 1;
  ctx.drawImage(overlayCanvas, overlay.x, overlay.y);

  return ctx.getImageData(0, 0, width, height);
}

/**
 * Render image overlay onto all frames
 */
export function renderImageOverlayOnFrames(frames: Frame[], overlay: ImageOverlay): Frame[] {
  return frames.map(frame => ({
    ...frame,
    imageData: renderImageOverlay(frame.imageData, overlay),
  }));
}

/**
 * Measure text dimensions
 */
export function measureText(
  text: string,
  fontSize: number,
  fontFamily: string
): { width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize}px "${fontFamily}"`;

  const metrics = ctx.measureText(text);
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  return {
    width: Math.ceil(metrics.width),
    height: Math.ceil(height || fontSize),
  };
}

/**
 * Load a custom font from URL
 */
export async function loadFont(fontName: string, fontUrl: string): Promise<void> {
  const font = new FontFace(fontName, `url(${fontUrl})`);
  const loadedFont = await font.load();
  document.fonts.add(loadedFont);
}

/**
 * Create a caption box overlay (white box with text)
 */
export function renderCaptionBox(
  imageData: ImageData,
  text: string,
  position: 'top' | 'bottom',
  options: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    padding?: number;
  } = {}
): ImageData {
  const {
    fontSize = 24,
    fontFamily = 'Arial',
    textColor = '#000000',
    backgroundColor = '#ffffff',
    padding = 10,
  } = options;

  const { width, height } = imageData;
  const textMetrics = measureText(text, fontSize, fontFamily);
  const boxHeight = textMetrics.height + padding * 2;

  // Extend canvas to fit caption
  const newHeight = height + boxHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;

  // Position based on top/bottom
  const imageY = position === 'top' ? boxHeight : 0;
  const boxY = position === 'top' ? 0 : height;

  // Draw caption background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, boxY, width, boxHeight);

  // Draw original image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(tempCanvas, 0, imageY);

  // Draw text centered in caption box
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, boxY + boxHeight / 2);

  return ctx.getImageData(0, 0, width, newHeight);
}

/**
 * Render caption box on all frames
 */
export function renderCaptionBoxOnFrames(
  frames: Frame[],
  text: string,
  position: 'top' | 'bottom',
  options?: Parameters<typeof renderCaptionBox>[3]
): Frame[] {
  return frames.map(frame => ({
    ...frame,
    imageData: renderCaptionBox(frame.imageData, text, position, options),
  }));
}
