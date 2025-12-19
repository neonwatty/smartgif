import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { CropTool } from '../components/tools/CropTool';

export function CropPage() {
  return (
    <ToolPageWrapper
      title="Crop GIF"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Crop and export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <CropTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
