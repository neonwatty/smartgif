import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SpeedTool } from '../components/tools/SpeedTool';

export function SpeedPage() {
  return (
    <ToolPageWrapper
      title="Speed"
      description="Adjust playback speed of images or videos • Export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <SpeedTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
