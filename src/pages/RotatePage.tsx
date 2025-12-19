import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { RotateTool } from '../components/tools/RotateTool';

export function RotatePage() {
  return (
    <ToolPageWrapper
      title="Rotate & Flip"
      description="Rotate or flip images and videos • Export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <RotateTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
