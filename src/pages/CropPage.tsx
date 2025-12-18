import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { CropTool } from '../components/tools/CropTool';

export function CropPage() {
  return (
    <ToolPageWrapper
      title="Crop GIF"
      description="Crop your GIF to a specific region with aspect ratio presets"
    >
      {({ frames, onFramesChange }) => (
        <CropTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
