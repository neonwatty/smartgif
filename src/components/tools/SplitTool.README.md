# Frame Split/Extract Tool

A React component for extracting and downloading individual frames from animated images (GIF, WebP, video).

## Features

- **Grid Display**: Shows all frames as thumbnails in a responsive grid
- **Frame Selection**: Click to select/deselect individual frames
- **Batch Selection**: Select All / Deselect All buttons
- **Individual Download**: Download any frame as PNG with a single click
- **Batch Download**: Download selected frames or all frames as a ZIP file
- **Frame Info**: Display frame index, delay, and dimensions
- **ZIP Generation**: Uses JSZip for efficient compression
- **TypeScript**: Fully typed with proper interfaces

## Installation

The component uses the following dependencies (already in package.json):
```json
{
  "jszip": "^3.10.1",
  "file-saver": "^2.0.5"
}
```

## Usage

### Basic Usage

```tsx
import { SplitTool } from './components/tools/SplitTool';
import type { Frame } from './types';

function MyComponent({ frames }: { frames: Frame[] }) {
  return (
    <SplitTool
      frames={frames}
      filename="my-animation"
    />
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `frames` | `Frame[]` | Yes | - | Array of frames to display |
| `filename` | `string` | No | `'animation'` | Base filename for downloads |

### Frame Type

```typescript
interface Frame {
  imageData: ImageData;  // Canvas ImageData object
  delay: number;         // Frame delay in milliseconds
}
```

## Exported Functions

### `frameToBlob(frame: Frame): Promise<Blob>`

Converts a Frame's ImageData to a PNG Blob.

```typescript
import { frameToBlob } from './components/tools/SplitTool';

const frame = frames[0];
const blob = await frameToBlob(frame);
// Use blob for download, upload, etc.
```

### `downloadFramesAsZip(frames: Frame[], filename: string): Promise<void>`

Downloads multiple frames as a ZIP file.

```typescript
import { downloadFramesAsZip } from './components/tools/SplitTool';

await downloadFramesAsZip(frames, 'my-animation');
// Downloads: my-animation_frames.zip
```

## Features in Detail

### Frame Grid

- Responsive grid layout (2-6 columns based on screen size)
- Hover effects for better UX
- Selected frames highlighted with blue border
- Checkbox for selection in top-left corner

### Download Options

1. **Download All as ZIP**: Downloads all frames as PNG files in a ZIP
2. **Download Selected**: Downloads only selected frames as a ZIP
3. **Individual Download**: Each frame has its own download button

### Frame Naming

Frames in ZIP are named with zero-padded numbers:
- 1-9 frames: `frame_1.png`, `frame_2.png`, ...
- 10-99 frames: `frame_01.png`, `frame_02.png`, ...
- 100+ frames: `frame_001.png`, `frame_002.png`, ...

### Statistics Display

The component shows:
- Total frame count
- Frame dimensions (width × height)
- Average frame delay in milliseconds
- Total animation duration in seconds

## Styling

The component uses Tailwind CSS with a dark theme:
- Background: `bg-gray-900`, `bg-gray-800`
- Text: `text-white`, `text-gray-400`
- Buttons: `bg-blue-600`, `bg-green-600`, `bg-gray-700`
- Borders: `border-blue-500` for selection

## Performance

- Canvas rendering is optimized with `useCallback`
- Frames are converted to blobs on-demand
- ZIP generation is async and shows loading state
- Supports animations with hundreds of frames

## Testing

Run the test suite:

```bash
npm run test src/components/tools/SplitTool.test.ts
```

Tests cover:
- Frame to blob conversion
- ZIP creation
- Batch processing
- Metadata preservation
- Error handling

## Example Implementation

See `SplitTool.example.tsx` for a complete working example with:
- File loading
- Sample frame generation
- Loading states
- Integration patterns

## Browser Compatibility

- Requires Canvas API support (all modern browsers)
- Uses `canvas.toBlob()` for PNG conversion
- ZIP download requires Blob support
- File downloads use FileSaver.js for cross-browser compatibility

## Common Use Cases

### 1. Extract Frames from GIF

```tsx
import { decodeAnimatedImage } from './lib/decoder';
import { SplitTool } from './components/tools/SplitTool';

async function extractFromGif(file: File) {
  const { frames } = await decodeAnimatedImage(file);
  return <SplitTool frames={frames} filename={file.name} />;
}
```

### 2. Export Video Frames

```tsx
async function exportVideoFrames(videoFrames: Frame[]) {
  return <SplitTool frames={videoFrames} filename="video-export" />;
}
```

### 3. Custom Frame Selection

```tsx
import { downloadFramesAsZip } from './components/tools/SplitTool';

// Download only specific frames
const selectedIndices = [0, 5, 10, 15];
const selectedFrames = selectedIndices.map(i => allFrames[i]);
await downloadFramesAsZip(selectedFrames, 'key-frames');
```

## Troubleshooting

### Large File Downloads

For animations with many frames, ZIP generation may take time. The component shows a loading state during this process.

### Memory Usage

Each frame is an ImageData object. For very large animations (1000+ frames), consider:
- Limiting visible frames in the grid
- Adding pagination
- Implementing virtual scrolling

### Download Issues

If downloads fail:
- Check browser's download permissions
- Verify file-saver is properly installed
- Check console for errors
- Ensure frames have valid ImageData

## License

Part of SmartGIF project.
