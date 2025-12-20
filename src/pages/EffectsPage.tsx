import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { EffectsTool } from '../components/tools/EffectsTool';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

export function EffectsPage() {
  const seo = SEO_CONFIG.effects;
  const faqData = FAQ_DATA.effects;

  return (
    <ToolPageWrapper
      title={seo.h1Title}
      description={seo.h1Description}
      seoTitle={seo.title}
      seoDescription={seo.description}
      canonicalPath={seo.canonicalPath}
      pageId={faqData.pageId}
      faqs={faqData.faqs}
    >
      {({ frames, onFramesChange }) => (
        <EffectsTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
