import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ReverseTool } from '../components/tools/ReverseTool';

export function ReversePage() {
  return (
    <ToolPageWrapper
      title="Reverse GIF"
      description="Reverse your GIF or create a ping-pong boomerang effect"
    >
      {({ frames, onFramesChange }) => (
        <ReverseTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
