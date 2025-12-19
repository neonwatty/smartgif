import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ReverseTool } from '../components/tools/ReverseTool';

export function ReversePage() {
  return (
    <ToolPageWrapper
      title="Reverse GIF"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Reverse and export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <ReverseTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
