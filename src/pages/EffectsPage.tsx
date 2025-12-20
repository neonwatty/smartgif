import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { EffectsTool } from '../components/tools/EffectsTool';

export function EffectsPage() {
  return (
    <ToolPageWrapper
      title="Effects & Filters"
      description="Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Apply effects and export as GIF"
    >
      {({ frames, onFramesChange }) => (
        <EffectsTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
