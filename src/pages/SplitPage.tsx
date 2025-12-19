import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SplitTool } from '../components/tools/SplitTool';

export function SplitPage() {
  return (
    <ToolPageWrapper
      title="Split Frames"
      description="Extract individual frames as PNG images"
    >
      {({ frames }) => <SplitTool frames={frames} />}
    </ToolPageWrapper>
  );
}
