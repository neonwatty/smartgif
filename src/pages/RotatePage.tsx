import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { RotateTool } from '../components/tools/RotateTool';

export function RotatePage() {
  return (
    <ToolPageWrapper
      title="Rotate & Flip GIF"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Rotate/flip and export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <RotateTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
