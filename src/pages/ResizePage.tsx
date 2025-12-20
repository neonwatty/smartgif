import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { ResizeTool } from '../components/tools/ResizeTool';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

export function ResizePage() {
  const seo = SEO_CONFIG.resize;
  const faqData = FAQ_DATA.resize;

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
      {({ frames, onFramesChange, originalWidth, originalHeight }) => (
        <ResizeTool
          frames={frames}
          originalWidth={originalWidth}
          originalHeight={originalHeight}
          onFramesChange={onFramesChange}
        />
      )}
    </ToolPageWrapper>
  );
}
