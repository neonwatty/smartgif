import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SplitTool } from '../components/tools/SplitTool';

export function SplitPage() {
  return (
    <ToolPageWrapper
      title="GIF to Frames"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Extract frames as PNG images"
    >
      {({ frames }) => <SplitTool frames={frames} />}
    </ToolPageWrapper>
  );
}
