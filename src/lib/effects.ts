/**
 * Image effects and filters for GIF processing
 * All effects operate on ImageData and return new ImageData
 */

export type EffectName =
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'hue'
  | 'blur'
  | 'sharpen';

export interface EffectOptions {
  intensity?: number; // 0-100, default 100
  value?: number; // For effects that need a specific value (brightness, hue, etc.)
}

/**
 * Apply grayscale effect
 */
export function grayscale(imageData: ImageData, intensity = 100): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    data[i] = r + (gray - r) * factor;
    data[i + 1] = g + (gray - g) * factor;
    data[i + 2] = b + (gray - b) * factor;
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply sepia effect
 */
export function sepia(imageData: ImageData, intensity = 100): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const newR = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
    const newG = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
    const newB = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);

    data[i] = r + (newR - r) * factor;
    data[i + 1] = g + (newG - g) * factor;
    data[i + 2] = b + (newB - b) * factor;
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Invert colors
 */
export function invert(imageData: ImageData, intensity = 100): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] + (255 - 2 * data[i]) * factor;
    data[i + 1] = data[i + 1] + (255 - 2 * data[i + 1]) * factor;
    data[i + 2] = data[i + 2] + (255 - 2 * data[i + 2]) * factor;
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Adjust brightness (-100 to 100)
 */
export function brightness(imageData: ImageData, value = 0): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const adjustment = (value / 100) * 255;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Adjust contrast (-100 to 100)
 */
export function contrast(imageData: ImageData, value = 0): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (value + 255)) / (255 * (259 - value));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Adjust saturation (-100 to 100)
 */
export function saturation(imageData: ImageData, value = 0): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = 1 + value / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    data[i] = Math.min(255, Math.max(0, gray + (r - gray) * factor));
    data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * factor));
    data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * factor));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Rotate hue (0-360 degrees)
 */
export function hueRotate(imageData: ImageData, degrees = 0): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const angle = (degrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert to YIQ, rotate, convert back
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const i_val = 0.596 * r - 0.274 * g - 0.322 * b;
    const q = 0.211 * r - 0.523 * g + 0.312 * b;

    const newI = i_val * cos - q * sin;
    const newQ = i_val * sin + q * cos;

    data[i] = Math.min(255, Math.max(0, y + 0.956 * newI + 0.621 * newQ));
    data[i + 1] = Math.min(255, Math.max(0, y - 0.272 * newI - 0.647 * newQ));
    data[i + 2] = Math.min(255, Math.max(0, y - 1.105 * newI + 1.702 * newQ));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply blur effect using box blur
 */
export function blur(imageData: ImageData, radius = 1): ImageData {
  const { width, height } = imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }
      }

      const idx = (y * width + x) * 4;
      result[idx] = r / count;
      result[idx + 1] = g / count;
      result[idx + 2] = b / count;
      result[idx + 3] = a / count;
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply sharpen effect
 */
export function sharpen(imageData: ImageData, intensity = 1): ImageData {
  const { width, height } = imageData;
  const data = imageData.data;
  const result = new Uint8ClampedArray(data.length);

  // Sharpen kernel
  const kernel = [
    0, -intensity, 0,
    -intensity, 1 + 4 * intensity, -intensity,
    0, -intensity, 0,
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        result[idx] = Math.min(255, Math.max(0, sum));
      }
      result[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
    }
  }

  // Copy edges
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      result[x * 4 + c] = data[x * 4 + c];
      result[((height - 1) * width + x) * 4 + c] = data[((height - 1) * width + x) * 4 + c];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let c = 0; c < 4; c++) {
      result[(y * width) * 4 + c] = data[(y * width) * 4 + c];
      result[(y * width + width - 1) * 4 + c] = data[(y * width + width - 1) * 4 + c];
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply effect by name
 */
export function applyEffect(
  imageData: ImageData,
  effect: EffectName,
  options: EffectOptions = {}
): ImageData {
  const { intensity = 100, value = 0 } = options;

  switch (effect) {
    case 'grayscale':
      return grayscale(imageData, intensity);
    case 'sepia':
      return sepia(imageData, intensity);
    case 'invert':
      return invert(imageData, intensity);
    case 'brightness':
      return brightness(imageData, value);
    case 'contrast':
      return contrast(imageData, value);
    case 'saturation':
      return saturation(imageData, value);
    case 'hue':
      return hueRotate(imageData, value);
    case 'blur':
      return blur(imageData, Math.max(1, Math.round(intensity / 20)));
    case 'sharpen':
      return sharpen(imageData, intensity / 100);
    default:
      return imageData;
  }
}
