import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SplitTool } from '../components/tools/SplitTool';

export function SplitPage() {
  return (
    <ToolPageWrapper
      title="Split GIF"
      description="Extract individual frames from your GIF as images"
    >
      {({ frames }) => <SplitTool frames={frames} />}
    </ToolPageWrapper>
  );
}
