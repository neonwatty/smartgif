import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SpeedTool } from '../components/tools/SpeedTool';

export function SpeedPage() {
  return (
    <ToolPageWrapper
      title="Change GIF Speed"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Adjust speed and export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <SpeedTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
