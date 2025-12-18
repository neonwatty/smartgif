import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SpeedTool } from '../components/tools/SpeedTool';

export function SpeedPage() {
  return (
    <ToolPageWrapper
      title="Adjust Speed"
      description="Change the playback speed of your GIF"
    >
      {({ frames, onFramesChange }) => (
        <SpeedTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
