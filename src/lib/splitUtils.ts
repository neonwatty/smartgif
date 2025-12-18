/**
 * Utilities for splitting GIFs into individual frames
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Frame } from '../types';

/**
 * Convert a Frame's ImageData to a PNG Blob
 */
export async function frameToBlob(frame: Frame): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    ctx.putImageData(frame.imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Download multiple frames as a ZIP file
 */
export async function downloadFramesAsZip(
  frames: Frame[],
  filename: string
): Promise<void> {
  const zip = new JSZip();
  const totalFrames = frames.length;
  const padding = totalFrames.toString().length;

  // Add each frame to the ZIP
  for (let i = 0; i < frames.length; i++) {
    const frameBlob = await frameToBlob(frames[i]);
    const frameNumber = (i + 1).toString().padStart(padding, '0');
    zip.file(`frame_${frameNumber}.png`, frameBlob);
  }

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${filename}_frames.zip`);
}

/**
 * Download a single frame as PNG
 */
export async function downloadSingleFrame(
  frame: Frame,
  frameIndex: number,
  filename: string
): Promise<void> {
  const blob = await frameToBlob(frame);
  saveAs(blob, `${filename}_frame_${frameIndex + 1}.png`);
}
