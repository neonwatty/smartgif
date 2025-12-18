import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { RotateTool } from '../components/tools/RotateTool';

export function RotatePage() {
  return (
    <ToolPageWrapper
      title="Rotate & Flip"
      description="Rotate or flip your GIF horizontally/vertically"
    >
      {({ frames, onFramesChange }) => (
        <RotateTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
