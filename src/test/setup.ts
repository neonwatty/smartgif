/**
 * Vitest test setup file
 * Provides polyfills for browser APIs not available in JSDOM
 */

import { vi } from 'vitest'

// Store canvas data for each canvas element
const canvasDataStore = new WeakMap<HTMLCanvasElement, ImageData>()

/**
 * Create a mock CanvasRenderingContext2D
 */
function createMockContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  let currentImageData: ImageData | null = null
  let fillStyleValue: string | CanvasGradient | CanvasPattern = '#000000'
  let strokeStyleValue: string | CanvasGradient | CanvasPattern = '#000000'
  let globalAlphaValue = 1
  let globalCompositeOperationValue: GlobalCompositeOperation = 'source-over'

  const ctx: Partial<CanvasRenderingContext2D> = {
    canvas,

    // Drawing methods
    drawImage: vi.fn((
      image: CanvasImageSource,
      sx: number,
      sy?: number,
      sWidth?: number,
      sHeight?: number,
      dx?: number,
      dy?: number,
      dWidth?: number,
      dHeight?: number
    ) => {
      // Handle different overloads
      if (typeof dy === 'undefined') {
        // drawImage(image, dx, dy) or drawImage(image, dx, dy, dWidth, dHeight)
        if (image instanceof ImageData) {
          currentImageData = image
          canvasDataStore.set(canvas, image)
        } else if ('width' in image && 'height' in image) {
          // ImageBitmap or other image source
          const width = dWidth ?? (image as { width: number }).width
          const height = dHeight ?? (image as { height: number }).height
          currentImageData = new ImageData(width, height)
          canvasDataStore.set(canvas, currentImageData)
        }
      } else {
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        const targetWidth = dWidth ?? canvas.width
        const targetHeight = dHeight ?? canvas.height
        currentImageData = new ImageData(targetWidth, targetHeight)
        canvasDataStore.set(canvas, currentImageData)
      }
    }),

    putImageData: vi.fn((imageData: ImageData, _dx: number, _dy: number) => {
      currentImageData = imageData
      canvasDataStore.set(canvas, imageData)
    }),

    getImageData: vi.fn((_sx: number, _sy: number, sw: number, sh: number): ImageData => {
      // Return stored data or create new empty ImageData
      const stored = canvasDataStore.get(canvas)
      if (stored && stored.width === sw && stored.height === sh) {
        return stored
      }
      // Create new ImageData with proper dimensions
      return new ImageData(sw, sh)
    }),

    createImageData: vi.fn((widthOrImageData: number | ImageData, height?: number): ImageData => {
      if (typeof widthOrImageData === 'number') {
        return new ImageData(widthOrImageData, height!)
      }
      return new ImageData(widthOrImageData.width, widthOrImageData.height)
    }),

    // Transform methods
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),

    // Path methods
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    ellipse: vi.fn(),

    // Drawing shapes
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    fillRect: vi.fn((_x: number, _y: number, w: number, h: number) => {
      // For clearRect/fillRect, create appropriate ImageData
      if (!currentImageData || currentImageData.width !== w || currentImageData.height !== h) {
        currentImageData = new ImageData(Math.max(1, w), Math.max(1, h))
        canvasDataStore.set(canvas, currentImageData)
      }
    }),
    strokeRect: vi.fn(),
    clearRect: vi.fn((_x: number, _y: number, w: number, h: number) => {
      currentImageData = new ImageData(Math.max(1, w), Math.max(1, h))
      canvasDataStore.set(canvas, currentImageData)
    }),

    // Text methods
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 } as TextMetrics)),

    // Gradient methods
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createPattern: vi.fn(() => null),
    createConicGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),

    // Line styles
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    lineDashOffset: 0,

    // Colors and styles
    get fillStyle() { return fillStyleValue },
    set fillStyle(value) { fillStyleValue = value },
    get strokeStyle() { return strokeStyleValue },
    set strokeStyle(value) { strokeStyleValue = value },

    // Compositing
    get globalAlpha() { return globalAlphaValue },
    set globalAlpha(value) { globalAlphaValue = value },
    get globalCompositeOperation() { return globalCompositeOperationValue },
    set globalCompositeOperation(value) { globalCompositeOperationValue = value },

    // Shadows
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,

    // Image smoothing
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low' as ImageSmoothingQuality,

    // Filters
    filter: 'none',

    // Other
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),
    getContextAttributes: vi.fn(() => ({
      alpha: true,
      colorSpace: 'srgb',
      desynchronized: false,
      willReadFrequently: false,
    })),
  }

  return ctx as CanvasRenderingContext2D
}

// Override HTMLCanvasElement.prototype.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function(
  contextId: string,
  options?: CanvasRenderingContext2DSettings
): RenderingContext | null {
  if (contextId === '2d') {
    // Create and cache the mock context
    const existingCtx = (this as HTMLCanvasElement & { _mockCtx?: CanvasRenderingContext2D })._mockCtx
    if (existingCtx) {
      return existingCtx
    }
    const ctx = createMockContext2D(this)
    ;(this as HTMLCanvasElement & { _mockCtx?: CanvasRenderingContext2D })._mockCtx = ctx
    return ctx
  }
  return originalGetContext.call(this, contextId, options)
}

// Mock canvas toBlob
HTMLCanvasElement.prototype.toBlob = function(
  callback: BlobCallback,
  type?: string,
  _quality?: number
) {
  const canvas = this
  const stored = canvasDataStore.get(canvas)

  setTimeout(() => {
    if (stored) {
      const blob = new Blob([stored.data], { type: type || 'image/png' })
      callback(blob)
    } else {
      // Create empty blob for empty canvas
      const emptyData = new Uint8ClampedArray(canvas.width * canvas.height * 4)
      const blob = new Blob([emptyData], { type: type || 'image/png' })
      callback(blob)
    }
  }, 0)
}

// Polyfill createImageBitmap for JSDOM
if (typeof globalThis.createImageBitmap === 'undefined') {
  globalThis.createImageBitmap = vi.fn(async (
    source: ImageBitmapSource,
    options?: ImageBitmapOptions
  ) => {
    let width: number
    let height: number

    if (source instanceof ImageData) {
      width = options?.resizeWidth ?? source.width
      height = options?.resizeHeight ?? source.height
    } else if (source instanceof HTMLCanvasElement) {
      width = options?.resizeWidth ?? source.width
      height = options?.resizeHeight ?? source.height
    } else {
      // Default dimensions for other sources
      width = options?.resizeWidth ?? 100
      height = options?.resizeHeight ?? 100
    }

    return {
      width,
      height,
      close: vi.fn(),
    } as unknown as ImageBitmap
  })
}

// Ensure ImageData is available globally with proper constructor
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    readonly data: Uint8ClampedArray
    readonly width: number
    readonly height: number
    readonly colorSpace: PredefinedColorSpace = 'srgb'

    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight: number,
      height?: number
    ) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth
        this.width = widthOrHeight
        this.height = height!
      } else {
        this.width = dataOrWidth
        this.height = widthOrHeight
        this.data = new Uint8ClampedArray(this.width * this.height * 4)
      }
    }
  }
}

// Export empty object to make this a module
export {}
