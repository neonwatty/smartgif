import type { Frame, InputFormat } from '../types';

export function detectFormat(file: File): InputFormat {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'webp') return 'webp';
  if (ext === 'gif') return 'gif';
  if (ext === 'mp4' || ext === 'webm' || ext === 'mov') return 'video';
  // Fallback based on mime
  if (file.type.includes('webp')) return 'webp';
  if (file.type.includes('gif')) return 'gif';
  if (file.type.includes('video')) return 'video';
  return 'webp'; // default
}

export async function decodeFile(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<{ frames: Frame[]; width: number; height: number; fps: number }> {
  const format = detectFormat(file);

  onProgress?.(0, `Decoding ${format.toUpperCase()}...`);

  if (format === 'video') {
    return decodeVideo(file, onProgress);
  }

  // Try ImageDecoder API first (modern browsers, supports animated WebP/GIF)
  if ('ImageDecoder' in window) {
    try {
      return await decodeWithImageDecoder(file, onProgress);
    } catch (e) {
      console.warn('ImageDecoder failed, falling back to canvas:', e);
    }
  }

  // Fallback for static images or older browsers
  return decodeStatic(file, onProgress);
}

async function decodeWithImageDecoder(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<{ frames: Frame[]; width: number; height: number; fps: number }> {
  const arrayBuffer = await file.arrayBuffer();

  // @ts-ignore - ImageDecoder is available in modern browsers
  const decoder = new ImageDecoder({
    data: arrayBuffer,
    type: file.type || 'image/webp',
  });

  await decoder.decode();
  await decoder.tracks.ready;

  const track = decoder.tracks.selectedTrack;
  const frameCount = track?.frameCount || 1;

  const frames: Frame[] = [];
  const canvas = document.createElement('canvas');
  let ctx: CanvasRenderingContext2D | null = null;

  for (let i = 0; i < frameCount; i++) {
    const result = await decoder.decode({ frameIndex: i });
    const frame = result.image;

    if (!ctx) {
      canvas.width = frame.displayWidth;
      canvas.height = frame.displayHeight;
      ctx = canvas.getContext('2d')!;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Duration is in microseconds
    const delay = Math.round((frame.duration || 100000) / 1000);

    frames.push({ imageData, delay });
    frame.close();

    onProgress?.(((i + 1) / frameCount) * 100, `Decoded frame ${i + 1}/${frameCount}`);
  }

  decoder.close();

  // Calculate FPS from average delay
  const avgDelay = frames.reduce((sum, f) => sum + f.delay, 0) / frames.length;
  const fps = Math.round(1000 / avgDelay);

  return {
    frames,
    width: canvas.width,
    height: canvas.height,
    fps,
  };
}

async function decodeStatic(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<{ frames: Frame[]; width: number; height: number; fps: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      onProgress?.(100, 'Decoded static image');

      resolve({
        frames: [{ imageData, delay: 100 }],
        width: img.width,
        height: img.height,
        fps: 10,
      });
    };
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = URL.createObjectURL(file);
  });
}

async function decodeVideo(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<{ frames: Frame[]; width: number; height: number; fps: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';

    video.onloadedmetadata = async () => {
      const { videoWidth, videoHeight, duration } = video;
      const targetFps = 15; // Default FPS for video conversion
      const frameDelay = Math.round(1000 / targetFps);
      const totalFrames = Math.floor(duration * targetFps);

      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d')!;

      const frames: Frame[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const time = i / targetFps;
        video.currentTime = time;

        await new Promise<void>(res => {
          video.onseeked = () => res();
        });

        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
        frames.push({ imageData, delay: frameDelay });

        onProgress?.(((i + 1) / totalFrames) * 100, `Extracted frame ${i + 1}/${totalFrames}`);
      }

      URL.revokeObjectURL(video.src);

      resolve({
        frames,
        width: videoWidth,
        height: videoHeight,
        fps: targetFps,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to decode video'));
    };

    video.src = URL.createObjectURL(file);
  });
}
