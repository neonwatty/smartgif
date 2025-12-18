import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ResizeTool } from '../components/tools/ResizeTool';

export function ResizePage() {
  return (
    <ToolPageWrapper
      title="Resize GIF"
      description="Scale your GIF to specific dimensions with quality control"
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
