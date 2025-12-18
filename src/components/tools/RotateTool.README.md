# RotateTool Component

A React component for rotating and flipping frames in the SmartGIF application.

## Features

- **Rotate**: 90° CW, 90° CCW (270°), 180°
- **Flip**: Horizontal, Vertical, or Both
- **Live Preview**: See changes before applying
- **Dimension Display**: Shows original and new dimensions
- **Batch Processing**: Apply transformations to all frames at once
- **Smart State Management**: Accumulates rotations and flips before applying

## Installation

The component is located at `/Users/jeremywatt/smartgif/src/components/tools/RotateTool.tsx`

## Usage

### Basic Usage

```tsx
import { RotateTool } from './components/tools/RotateTool';
import type { Frame } from './types';

function MyApp() {
  const [frames, setFrames] = useState<Frame[]>([]);

  return (
    <RotateTool
      frames={frames}
      onFramesChange={setFrames}
    />
  );
}
```

### With File Upload

See `RotateTool.example.tsx` for a complete example with file upload.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `frames` | `Frame[]` | Yes | Array of frames to transform |
| `onFramesChange` | `(frames: Frame[]) => void` | Yes | Callback when frames are updated |

## Frame Interface

```typescript
interface Frame {
  imageData: ImageData;  // Canvas ImageData containing pixel data
  delay: number;         // Frame delay in milliseconds
}
```

## Features in Detail

### Rotation

- **90° CW**: Rotates clockwise, swaps width/height
- **90° CCW (270°)**: Rotates counter-clockwise, swaps width/height
- **180°**: Rotates 180 degrees, preserves dimensions
- Rotations accumulate: multiple 90° rotations = full circle

### Flipping

- **Horizontal**: Mirror along vertical axis
- **Vertical**: Mirror along horizontal axis
- **Both**: Combines horizontal + vertical (equivalent to 180° rotation)
- Flips can be toggled on/off by clicking the same button again

### Preview

- Shows the first frame after applying all pending transformations
- Updates in real-time as you adjust rotation/flip settings
- No changes are applied to actual frames until "Apply" is clicked

### Dimensions Display

- Shows original dimensions (before any transformations)
- Shows new dimensions (after pending transformations)
- Displays current rotation angle and flip state

## Testing

Run tests with:

```bash
npx tsx src/components/tools/RotateTool.test.ts
```

Tests cover:
- 90°, 180°, 270° rotations
- Horizontal, vertical, and both flips
- Multiple frame transformations
- Dimension calculations
- Combined rotate + flip operations

## Implementation Notes

### Transform Utilities

The component uses transformation utilities from `/Users/jeremywatt/smartgif/src/lib/transforms.ts`:

- `rotateImageData(imageData, angle)` - Rotate single ImageData
- `rotateFrames(frames, angle)` - Rotate all frames
- `flipImageData(imageData, direction)` - Flip single ImageData
- `flipFrames(frames, direction)` - Flip all frames

### Performance

- Transformations use Canvas 2D API for efficient pixel manipulation
- Preview only processes the first frame for performance
- Apply operation processes all frames at once
- No intermediate allocations during preview

### Browser Compatibility

Requires:
- Canvas 2D API
- ImageData support
- Modern browser with ES6+ support

## Styling

Uses Tailwind CSS with dark theme:
- Background: `bg-gray-700`, `bg-gray-800`
- Text: `text-gray-300`, `text-gray-400`, `text-white`
- Buttons: `bg-blue-600` (primary), `bg-gray-700` (secondary)
- Hover states: `hover:bg-gray-600`, `hover:bg-blue-700`

## Examples

### Example 1: Simple Integration

```tsx
import { RotateTool } from './components/tools/RotateTool';

export function MyEditor({ frames, onUpdate }) {
  return (
    <div className="p-6 bg-gray-900">
      <h2 className="text-2xl mb-4">Edit Your GIF</h2>
      <RotateTool frames={frames} onFramesChange={onUpdate} />
    </div>
  );
}
```

### Example 2: With Undo/Redo

```tsx
import { useState } from 'react';
import { RotateTool } from './components/tools/RotateTool';

export function EditorWithHistory() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [history, setHistory] = useState<Frame[][]>([]);

  const handleFramesChange = (newFrames: Frame[]) => {
    setHistory([...history, frames]);
    setFrames(newFrames);
  };

  const undo = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setFrames(previous);
      setHistory(history.slice(0, -1));
    }
  };

  return (
    <div>
      <button onClick={undo} disabled={history.length === 0}>
        Undo
      </button>
      <RotateTool frames={frames} onFramesChange={handleFramesChange} />
    </div>
  );
}
```

## File Structure

```
src/components/tools/
├── RotateTool.tsx           # Main component
├── RotateTool.test.ts       # Unit tests
├── RotateTool.example.tsx   # Usage examples
└── RotateTool.README.md     # This file
```

## Related Components

- `SplitTool` - Extract individual frames
- Other transformation tools (coming soon)

## License

Part of the SmartGIF project.
