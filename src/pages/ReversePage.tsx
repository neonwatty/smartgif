import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ReverseTool } from '../components/tools/ReverseTool';

export function ReversePage() {
  return (
    <ToolPageWrapper
      title="Reverse"
      description="Reverse or create ping-pong boomerang effects • Export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <ReverseTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
