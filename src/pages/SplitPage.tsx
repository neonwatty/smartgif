import { ToolPageWrapper } from '../components/ToolPageWrapper';
import { SplitTool } from '../components/tools/SplitTool';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

export function SplitPage() {
  const seo = SEO_CONFIG.split;
  const faqData = FAQ_DATA.split;

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
      {({ frames }) => <SplitTool frames={frames} />}
    </ToolPageWrapper>
  );
}
