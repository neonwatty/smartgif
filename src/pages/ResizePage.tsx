import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ResizeTool } from '../components/tools/ResizeTool';

export function ResizePage() {
  return (
    <ToolPageWrapper
      title="Resize"
      description="Scale images or videos to any size • Export as GIF"
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
