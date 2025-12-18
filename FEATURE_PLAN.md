# SmartGIF Feature Expansion Plan

## Current State
We have a working client-side GIF converter with:
- WebP/GIF/Video to GIF conversion
- Target size optimization (auto binary search)
- Manual controls (dimensions, colors, FPS)
- Fast encoder with global palette

---

## Feature Categories from ezgif.com Analysis

### TIER 1: HIGH PRIORITY - Core Tools (Client-Side Feasible)

#### 1.1 GIF Maker (Multi-Image to GIF)
**Complexity: Medium | Impact: High**
- Upload multiple images to create animation
- Drag-and-drop frame reordering
- Per-frame delay adjustment
- Crossfade transitions between frames
- Frame deletion/duplication
- **Tech:** Canvas API, existing gifenc

#### 1.2 GIF Optimizer
**Complexity: Low | Impact: High**
- Lossy compression slider
- Color reduction (256 → lower)
- Remove duplicate frames
- Remove every nth frame
- **Tech:** gifenc quantize, frame comparison

#### 1.3 Crop Tool
**Complexity: Low | Impact: High**
- Visual crop selection (drag box)
- Preset aspect ratios (16:9, 4:3, 1:1, etc.)
- Manual pixel input
- Autocrop (trim transparent edges)
- **Tech:** Canvas crop, bounding box detection

#### 1.4 Resize Tool
**Complexity: Low | Impact: High**
- Scale by percentage or dimensions
- Maintain aspect ratio option
- Stretch to fit option
- **Tech:** Canvas resize, createImageBitmap

#### 1.5 Speed/Duration Control
**Complexity: Low | Impact: Medium**
- Speed multiplier (0.5x, 2x, etc.)
- Custom frame delay input
- **Tech:** Modify frame delays

#### 1.6 Reverse GIF
**Complexity: Low | Impact: Medium**
- Reverse playback order
- Ping-pong/boomerang mode
- **Tech:** Array reverse, duplicate + reverse

---

### TIER 2: MEDIUM PRIORITY - Effects & Editing

#### 2.1 Basic Effects
**Complexity: Medium | Impact: High**
- Grayscale, Sepia, Invert
- Brightness/Contrast/Saturation
- Hue rotation
- **Tech:** Canvas ImageData manipulation, CSS filters

#### 2.2 Add Text Overlay
**Complexity: Medium | Impact: High**
- Text input with font selection
- Color and outline color
- Position (drag or coordinates)
- Apply to all frames or specific frames
- **Tech:** Canvas fillText, font loading

#### 2.3 Add Image Overlay (Watermark)
**Complexity: Medium | Impact: Medium**
- Upload overlay image
- Position control
- Opacity control
- Frame-specific application
- **Tech:** Canvas drawImage with alpha

#### 2.4 Cut/Trim Tool
**Complexity: Low | Impact: Medium**
- Remove frames from start/end
- Remove middle section
- Frame range selection
- **Tech:** Array slice

#### 2.5 Rotate/Flip
**Complexity: Low | Impact: Medium**
- 90°, 180°, 270° rotation
- Horizontal/vertical flip
- Custom angle rotation
- **Tech:** Canvas transform

#### 2.6 Frame Splitter/Extractor
**Complexity: Low | Impact: Medium**
- Extract all frames as images
- Download as ZIP
- Download individual frames
- **Tech:** JSZip library, Blob URLs

---

### TIER 3: ADVANCED FEATURES

#### 3.1 Artistic Filters
**Complexity: High | Impact: Medium**
- Blur, Sharpen
- Posterize, Solarize
- Oil paint, Emboss
- Instagram-style filters (Gotham, Lomo, etc.)
- **Tech:** Canvas convolution kernels, WebGL shaders

#### 3.2 Borders & Frames
**Complexity: Low | Impact: Low**
- Solid color borders
- Rounded corners
- Decorative frames
- **Tech:** Canvas strokeRect, clip paths

#### 3.3 Distortion Effects
**Complexity: High | Impact: Low**
- Swirl, Wave, Implode
- **Tech:** Pixel displacement, WebGL

#### 3.4 Fade In/Out
**Complexity: Medium | Impact: Medium**
- Gradual opacity at start/end
- Configurable frame count
- **Tech:** Alpha blending across frames

#### 3.5 Crossfade/Transitions
**Complexity: Medium | Impact: Medium**
- Smooth transitions between frames
- Interpolated intermediate frames
- **Tech:** Alpha blending, frame generation

---

### TIER 4: FORMAT CONVERSIONS

#### 4.1 Already Supported
- Animated WebP → GIF ✅
- GIF → GIF (re-optimize) ✅
- Video (MP4/WebM) → GIF ✅

#### 4.2 Feasible to Add
**Using Browser APIs:**
- GIF → WebP (Canvas toBlob)
- GIF → PNG sequence
- GIF → JPG sequence
- PNG sequence → GIF
- JPG sequence → GIF

**Using Libraries:**
- GIF → APNG (upng.js or similar)
- APNG → GIF (APNG decoder)

#### 4.3 Challenging/Limited
- GIF → MP4 (needs MediaRecorder, quality issues)
- HEIC support (needs heic2any library)
- AVIF/JXL (limited browser support)

---

### TIER 5: NOT FEASIBLE CLIENT-SIDE

- Server-side video transcoding (FFmpeg features)
- Very large file processing (>500MB)
- Audio extraction/merging (limited Web Audio)
- PDF generation (possible but complex)
- SVG vectorization (needs server-side tools)

---

## Implementation Phases

### Phase 1: Core Editing Tools (Parallel Development)
| Tool | Est. Complexity | Assignee |
|------|-----------------|----------|
| GIF Maker (multi-image) | Medium | Agent 1 |
| Crop Tool | Low | Agent 2 |
| Resize Tool | Low | Agent 3 |
| Speed Control | Low | Agent 4 |
| Reverse/Boomerang | Low | Agent 5 |
| Frame Splitter | Low | Agent 6 |

### Phase 2: Effects & Overlays
| Tool | Est. Complexity | Assignee |
|------|-----------------|----------|
| Basic Color Effects | Medium | Agent 1 |
| Text Overlay | Medium | Agent 2 |
| Image Overlay | Medium | Agent 3 |
| Rotate/Flip | Low | Agent 4 |
| Cut/Trim | Low | Agent 5 |

### Phase 3: Advanced Features
| Tool | Est. Complexity | Assignee |
|------|-----------------|----------|
| Artistic Filters | High | Agent 1 |
| Borders/Frames | Low | Agent 2 |
| Fade In/Out | Medium | Agent 3 |
| Format Conversions | Medium | Agent 4 |

---

## Technical Architecture

### Shared Libraries
```
src/lib/
├── decoder.ts          # Existing - decode WebP/GIF/video
├── gifEncoder.ts       # Existing - basic encoder
├── gifEncoderFast.ts   # Existing - optimized encoder
├── optimizer.ts        # Existing - size optimization
├── effects.ts          # NEW - color/filter effects
├── transforms.ts       # NEW - rotate/flip/crop
├── textRenderer.ts     # NEW - text overlay
├── frameUtils.ts       # NEW - frame manipulation
└── zipExport.ts        # NEW - ZIP download
```

### New Components
```
src/components/
├── tools/
│   ├── GifMaker.tsx      # Multi-image upload
│   ├── CropTool.tsx      # Visual crop
│   ├── ResizeTool.tsx    # Resize controls
│   ├── SpeedTool.tsx     # Speed adjustment
│   ├── ReverseTool.tsx   # Reverse/boomerang
│   ├── RotateTool.tsx    # Rotate/flip
│   ├── CutTool.tsx       # Trim frames
│   ├── SplitTool.tsx     # Extract frames
│   ├── EffectsTool.tsx   # Color effects
│   ├── TextTool.tsx      # Text overlay
│   └── OverlayTool.tsx   # Image overlay
├── shared/
│   ├── FrameTimeline.tsx # Frame strip UI
│   ├── CropBox.tsx       # Draggable crop
│   ├── ColorPicker.tsx   # Color selection
│   └── FontSelector.tsx  # Font dropdown
```

### Navigation Structure
```
/ (Home)
├── /convert     # Current converter (WebP/Video → GIF)
├── /maker       # GIF Maker (images → GIF)
├── /optimize    # Optimize existing GIF
├── /crop        # Crop tool
├── /resize      # Resize tool
├── /speed       # Speed adjustment
├── /reverse     # Reverse tool
├── /rotate      # Rotate/flip
├── /cut         # Cut/trim
├── /split       # Frame extraction
├── /effects     # Color effects
├── /text        # Add text
└── /overlay     # Add image overlay
```

---

## Parallel Development Strategy

### Option A: Spawn Claude Instances
Use `spawn_claude` to open multiple Ghostty terminals, each working on a different tool.

### Option B: Task Agents
Launch multiple Task agents in parallel, each implementing a specific tool.

### Recommended Approach
1. First, create shared utilities (effects.ts, transforms.ts, frameUtils.ts)
2. Then spawn 4-6 parallel agents for independent tools
3. Each agent creates their tool component in isolation
4. Final integration and testing

---

## Priority Ranking (by user value)

1. **GIF Maker** - Create GIFs from images (high demand)
2. **Crop** - Essential editing
3. **Resize** - Essential editing
4. **Effects** - Popular feature
5. **Speed** - Common need
6. **Text Overlay** - Meme creation
7. **Reverse** - Fun feature
8. **Rotate/Flip** - Basic editing
9. **Cut/Trim** - Editing
10. **Frame Split** - Utility
11. **Borders** - Polish
12. **Advanced filters** - Nice to have

---

## Dependencies to Add

```json
{
  "jszip": "^3.10.1",        // ZIP export
  "file-saver": "^2.0.5"     // Download helper
}
```

---

## Summary

**Total Features Identified:** 50+
**Feasible Client-Side:** ~35
**High Priority:** 12 tools
**Can Parallelize:** Yes, most tools are independent

Ready to begin parallel development?
