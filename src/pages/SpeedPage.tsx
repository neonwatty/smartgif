import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SpeedTool } from '../components/tools/SpeedTool';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

export function SpeedPage() {
  const seo = SEO_CONFIG.speed;
  const faqData = FAQ_DATA.speed;

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
        <SpeedTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
