// URL fetching utilities for loading images from URLs

export class UrlFetchError extends Error {
  readonly code: string;
  readonly canRetry: boolean;

  constructor(message: string, code: string, canRetry: boolean = false) {
    super(message);
    this.name = 'UrlFetchError';
    this.code = code;
    this.canRetry = canRetry;
  }
}

export class InvalidUrlError extends UrlFetchError {
  constructor(message: string) {
    super(message, 'INVALID_URL', false);
  }
}

export class CorsBlockedError extends UrlFetchError {
  constructor() {
    super(
      `This image server doesn't allow direct access. Try downloading the image first and uploading it.`,
      'CORS_BLOCKED',
      false
    );
  }
}

export class NetworkError extends UrlFetchError {
  constructor() {
    super('Failed to connect. Check your internet connection.', 'NETWORK_ERROR', true);
  }
}

export class InvalidMimeTypeError extends UrlFetchError {
  constructor(mimeType: string) {
    super(
      `This URL doesn't point to a supported image format. Got: ${mimeType || 'unknown'}`,
      'INVALID_MIME_TYPE',
      false
    );
  }
}

export class FileTooLargeError extends UrlFetchError {
  constructor(sizeKB: number, maxKB: number) {
    super(
      `Image is too large (${Math.round(sizeKB)}KB). Maximum size is ${maxKB}KB.`,
      'FILE_TOO_LARGE',
      false
    );
  }
}

export class TimeoutError extends UrlFetchError {
  constructor() {
    super('Request timed out. The server may be slow or unavailable.', 'TIMEOUT', true);
  }
}

// Valid image MIME types
const VALID_MIME_TYPES = new Set([
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/apng',
]);

// Check if a MIME type is valid for images
function isValidImageMimeType(mimeType: string): boolean {
  // Normalize MIME type (remove parameters like charset)
  const normalized = mimeType.split(';')[0].trim().toLowerCase();
  return VALID_MIME_TYPES.has(normalized);
}

// Validate URL format and security
export function validateImageUrl(input: string): URL {
  // Trim whitespace
  const trimmed = input.trim();

  if (!trimmed) {
    throw new InvalidUrlError('Please enter a URL');
  }

  // Parse URL
  let url: URL;
  try {
    // Add protocol if missing
    const withProtocol = trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`;
    url = new URL(withProtocol);
  } catch {
    throw new InvalidUrlError('Invalid URL format. Example: https://example.com/image.gif');
  }

  // Require HTTPS (or localhost for dev)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !isLocalhost) {
    throw new InvalidUrlError('Only HTTPS URLs are supported for security');
  }

  // No credentials in URL
  if (url.username || url.password) {
    throw new InvalidUrlError('URLs with credentials are not allowed');
  }

  // Length limit
  if (url.href.length > 2048) {
    throw new InvalidUrlError('URL is too long (max 2048 characters)');
  }

  return url;
}

export interface FetchOptions {
  timeout?: number;
  maxSizeKB?: number;
  abortSignal?: AbortSignal;
}

export interface FetchResult {
  blob: Blob;
  mimeType: string;
  url: string;
}

// Fetch image from URL with CORS handling
export async function fetchImageFromUrl(
  urlString: string,
  options: FetchOptions = {}
): Promise<FetchResult> {
  const { timeout = 30000, maxSizeKB = 50000, abortSignal } = options;

  // Validate URL
  const url = validateImageUrl(urlString);

  // Create abort controller for timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  // Combine with external abort signal if provided
  const signal = abortSignal
    ? combineAbortSignals(abortSignal, timeoutController.signal)
    : timeoutController.signal;

  try {
    // Strategy 1: Direct fetch with CORS
    const response = await fetch(url.href, {
      mode: 'cors',
      signal,
      headers: {
        Accept: 'image/*',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new InvalidUrlError('Image not found (404)');
      }
      throw new NetworkError();
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!isValidImageMimeType(contentType)) {
      // Some servers don't send correct MIME types, so we'll check the blob later
      console.warn(`Unexpected content type: ${contentType}, will verify blob`);
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeKB = parseInt(contentLength, 10) / 1024;
      if (sizeKB > maxSizeKB) {
        throw new FileTooLargeError(sizeKB, maxSizeKB);
      }
    }

    const blob = await response.blob();

    // Verify blob size
    const blobSizeKB = blob.size / 1024;
    if (blobSizeKB > maxSizeKB) {
      throw new FileTooLargeError(blobSizeKB, maxSizeKB);
    }

    // Verify blob type (some servers lie about content-type)
    const blobType = blob.type || contentType;
    if (!isValidImageMimeType(blobType) && !blobType.startsWith('image/')) {
      throw new InvalidMimeTypeError(blobType);
    }

    return {
      blob,
      mimeType: blobType,
      url: url.href,
    };
  } catch (error) {
    if (error instanceof UrlFetchError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        if (abortSignal?.aborted) {
          throw new UrlFetchError('Request cancelled', 'CANCELLED', false);
        }
        throw new TimeoutError();
      }

      // CORS or network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new CorsBlockedError();
      }
    }

    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Try to load image via img element (works for some CORS scenarios)
export async function loadImageViaElement(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Draw to canvas to extract blob
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from image'));
          }
        },
        'image/png'
      );
    };

    img.onerror = () => {
      reject(new CorsBlockedError());
    };

    img.src = url;
  });
}

// Combine multiple abort signals
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort());
  }

  return controller.signal;
}

// Extract filename from URL
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'image';
    // Remove query params and decode
    const clean = decodeURIComponent(filename.split('?')[0]);
    // Ensure it has an extension
    if (!clean.match(/\.(gif|png|jpg|jpeg|webp)$/i)) {
      return clean + '.gif';
    }
    return clean;
  } catch {
    return 'image.gif';
  }
}
