export interface Frame {
  imageData: ImageData;
  delay: number; // in ms
}

export interface ConversionSettings {
  mode: 'auto' | 'manual';
  targetSizeKB: number;
  width: number;
  height: number;
  colors: number;
  fps: number;
  dithering: 'none' | 'ordered' | 'floyd-steinberg';
  loop: number; // 0 = infinite
}

export interface ConversionProgress {
  stage: 'decoding' | 'optimizing' | 'encoding' | 'done' | 'error';
  percent: number;
  message: string;
  currentAttempt?: {
    scale: number;
    colors: number;
    sizeKB: number;
  };
}

export interface ConversionResult {
  blob: Blob;
  url: string;
  sizeKB: number;
  width: number;
  height: number;
  frameCount: number;
  settings: {
    scale: number;
    colors: number;
    fps: number;
  };
}

export type InputFormat = 'webp' | 'gif' | 'video';
