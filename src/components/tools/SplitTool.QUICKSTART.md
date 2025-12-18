# SplitTool Quick Start Guide

## Installation
Already installed! Dependencies (jszip, file-saver) are in package.json.

## Basic Usage

```tsx
import { SplitTool } from './components/tools/SplitTool';

function App() {
  return <SplitTool frames={myFrames} filename="animation" />;
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `frames` | `Frame[]` | Yes | Array of frames to display |
| `filename` | `string` | No | Base name for downloads (default: "animation") |

## Exported Functions

### frameToBlob
```tsx
import { frameToBlob } from './components/tools/SplitTool';

const blob = await frameToBlob(frame);
// Returns: PNG Blob ready for download
```

### downloadFramesAsZip
```tsx
import { downloadFramesAsZip } from './components/tools/SplitTool';

await downloadFramesAsZip(frames, 'my-animation');
// Downloads: my-animation_frames.zip
```

## Features

✅ Grid display of all frames
✅ Click to select/deselect frames
✅ Download individual frames as PNG
✅ Download all frames as ZIP
✅ Download selected frames as ZIP
✅ Frame info (index, delay, dimensions)
✅ Statistics panel (total duration, avg FPS)
✅ Responsive layout (2-6 columns)
✅ Dark theme styling

## User Actions

1. **Select Frames:** Click frame thumbnail or checkbox
2. **Select All:** Click "Select All" button
3. **Deselect All:** Click "Deselect All" button
4. **Download One:** Click "Download PNG" on any frame
5. **Download All:** Click "Download All as ZIP"
6. **Download Selected:** Click "Download Selected (N)"

## File Naming

Individual: `animation_frame_1.png`
ZIP with all: `animation_frames.zip`
ZIP with selected: `animation_selected_frames.zip`

Frames in ZIP are zero-padded:
- 1-9 frames → `frame_1.png`
- 10-99 frames → `frame_01.png`
- 100+ frames → `frame_001.png`

## Testing

Open in browser:
```
src/components/tools/run-tests.html
```

Or check:
```
src/components/tools/SplitTool.test.ts
```

## Example

See complete example:
```
src/components/tools/SplitTool.example.tsx
```

## Full Documentation

Read comprehensive docs:
```
src/components/tools/SplitTool.README.md
```

## Build Status

✅ TypeScript: Passes
✅ ESLint: No errors
✅ Build: Success

```bash
npm run build
# ✓ built in 466ms
```

## Quick Integration Example

```tsx
import { useState } from 'react';
import { SplitTool } from './components/tools/SplitTool';
import { decodeAnimatedImage } from './lib/decoder';

function FrameExtractor() {
  const [frames, setFrames] = useState([]);

  const handleFile = async (file) => {
    const { frames } = await decodeAnimatedImage(file);
    setFrames(frames);
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFile(e.target.files[0])} />
      {frames.length > 0 && (
        <SplitTool frames={frames} filename="my-animation" />
      )}
    </div>
  );
}
```

## Browser Support

✅ Chrome/Edge
✅ Firefox
✅ Safari
✅ All modern browsers

Requires: Canvas API, Blob API

## Performance

- Handles 100+ frames efficiently
- Lazy blob conversion (only when downloading)
- Async ZIP generation with loading state
- Optimized canvas rendering

## Troubleshooting

**Download not working?**
- Check browser download permissions
- Verify file-saver is installed

**Memory issues with large animations?**
- Consider pagination for 1000+ frames
- Reduce preview size in grid

**Blank frames?**
- Verify ImageData is valid
- Check canvas context availability

## Next Steps

1. Import component into your app
2. Pass decoded frames
3. Users can now extract frames!

For more help, see `SplitTool.README.md`
