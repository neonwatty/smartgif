import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ResizeTool } from '../components/tools/ResizeTool';

export function ResizePage() {
  return (
    <ToolPageWrapper
      title="Resize GIF"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Resize and export as GIF"
    >
      {({ frames, onFramesChange, originalWidth, originalHeight }) => (
        <ResizeTool
          frames={frames}
          originalWidth={originalWidth}
          originalHeight={originalHeight}
          onFramesChange={onFramesChange}
        />
      )}
    </ToolPageWrapper>
  );
}
