import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { RotateTool } from '../components/tools/RotateTool';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

export function RotatePage() {
  const seo = SEO_CONFIG.rotate;
  const faqData = FAQ_DATA.rotate;

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
        <RotateTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
