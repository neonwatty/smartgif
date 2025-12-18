# CropTool Component

A complete, interactive crop tool for SmartGIF that allows users to crop images and GIF frames with precision.

## Features

- **Visual Crop Box**: Draggable and resizable crop overlay with handles
- **Aspect Ratio Presets**: Quick selection of common aspect ratios (1:1, 4:3, 16:9, 3:2, 2:1)
- **Manual Pixel Input**: Precise control with X, Y, Width, Height inputs
- **Auto-Crop**: Automatically trim transparent edges
- **Live Preview**: See the cropped result in real-time
- **Multi-Frame Support**: Apply crop to all frames in an animation
- **Dark Theme**: Consistent with SmartGIF's UI using Tailwind CSS

## Files

- **`CropTool.tsx`**: Main component implementation
- **`CropTool.test.ts`**: Comprehensive test suite
- **`CropTool.example.tsx`**: Usage examples
- **`test-crop-tool.html`**: Browser-based test runner

## Usage

### Basic Example

```tsx
import { CropTool } from './components/tools/CropTool';
import type { Frame } from './types';

function MyApp() {
  const [frames, setFrames] = useState<Frame[]>([]);

  return (
    <CropTool
      frames={frames}
      onFramesChange={(croppedFrames) => {
        setFrames(croppedFrames);
      }}
    />
  );
}
```

### Programmatic Cropping

```tsx
import { cropFrames, autoCrop, getAspectRatioRect, ASPECT_RATIOS } from './lib/transforms';

// Auto-crop transparent edges
const rect = autoCrop(frame.imageData, 0);
const cropped = cropFrames(frames, rect);

// Apply 16:9 aspect ratio
const rect16x9 = getAspectRatioRect(width, height, ASPECT_RATIOS['16:9'], true);
const cropped16x9 = cropFrames(frames, rect16x9);

// Manual crop
const manual = cropFrames(frames, { x: 100, y: 100, width: 400, height: 300 });
```

## Component Props

```typescript
interface CropToolProps {
  frames: Frame[];              // Array of frames to crop
  onFramesChange: (frames: Frame[]) => void;  // Callback when crop is applied
}
```

## Utility Functions

All utility functions are imported from `lib/transforms.ts`:

### `cropFrames(frames: Frame[], rect: CropRect): Frame[]`
Crops all frames to the specified rectangle.

### `cropImageData(imageData: ImageData, rect: CropRect): ImageData`
Crops a single ImageData to the specified rectangle.

### `autoCrop(imageData: ImageData, threshold?: number): CropRect`
Automatically detects and returns crop rectangle to remove transparent edges.

### `getAspectRatioRect(width: number, height: number, aspectRatio: number, centered?: boolean): CropRect`
Calculates crop rectangle for a specific aspect ratio.

### `ASPECT_RATIOS`
Common aspect ratio presets:
- `'1:1'`: 1 (Square)
- `'4:3'`: 1.333... (Classic)
- `'16:9'`: 1.777... (Widescreen)
- `'3:2'`: 1.5 (Photo)
- `'2:1'`: 2 (Panoramic)

## Types

```typescript
interface CropRect {
  x: number;      // X coordinate of top-left corner
  y: number;      // Y coordinate of top-left corner
  width: number;  // Width of crop area
  height: number; // Height of crop area
}
```

## Testing

### Run Tests in Browser

1. Start the dev server: `npm run dev`
2. Open `test-crop-tool.html` in your browser
3. Click "Run Tests" or wait for auto-run

### Test Coverage

The test suite includes:
- ✅ Basic crop functionality
- ✅ Multi-frame cropping with delay preservation
- ✅ Auto-crop with transparent padding detection
- ✅ All aspect ratio presets (1:1, 4:3, 16:9, 3:2, 2:1)
- ✅ Manual crop coordinates (all positions)
- ✅ Edge cases (very small crops, single pixel, full image)
- ✅ Real image E2E test with actual test asset

### Run Build Verification

```bash
npm run build
```

This will:
- Run TypeScript type checking
- Run ESLint
- Build the production bundle

## Implementation Details

### Interactive Features

1. **Drag to Move**: Click and drag inside the crop box to reposition
2. **Resize Handles**: 8 handles (corners + edges) for resizing
3. **Aspect Ratio Lock**: Maintains ratio when resizing with preset selected
4. **Visual Feedback**: Semi-transparent overlay shows non-cropped area

### Canvas Rendering

- Uses HTML5 Canvas for image display and manipulation
- Scales to fit container while maintaining image quality
- SVG overlay for crop rectangle and handles
- Real-time preview generation

### Performance

- Efficient canvas operations
- Debounced preview updates
- Minimal re-renders with React hooks
- Memory-safe URL cleanup

## Styling

Uses Tailwind CSS classes with SmartGIF's dark theme:
- Background: `bg-gray-800`
- Text: `text-gray-200`, `text-gray-400`
- Buttons: `bg-blue-600`, `bg-gray-700`
- Borders: `border-gray-600`, `border-gray-700`

## Future Enhancements

Possible additions:
- Rule of thirds grid overlay
- Rotation combined with crop
- Crop presets (social media sizes)
- Crop history/undo
- Keyboard shortcuts for fine adjustment
- Touch/gesture support for mobile

## Dependencies

- React 19.2.0+
- TypeScript
- Tailwind CSS 4.1+
- HTML5 Canvas API

## Browser Support

Works in all modern browsers that support:
- HTML5 Canvas
- ES6+
- CSS Grid/Flexbox

## License

Part of SmartGIF project.
