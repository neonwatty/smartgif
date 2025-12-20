import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ReverseTool } from '../components/tools/ReverseTool';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

export function ReversePage() {
  const seo = SEO_CONFIG.reverse;
  const faqData = FAQ_DATA.reverse;

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
        <ReverseTool frames={frames} onFramesChange={onFramesChange} />
      )}
    </ToolPageWrapper>
  );
}
