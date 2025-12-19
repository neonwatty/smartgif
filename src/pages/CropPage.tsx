import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { CropTool } from '../components/tools/CropTool';

export function CropPage() {
  return (
    <ToolPageWrapper
      title="Crop"
      description="Crop images or videos to a specific region • Export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <CropTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
