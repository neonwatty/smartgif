import { useEffect } from 'react';
import type { FAQItem } from '../lib/faqData';

export function useFAQSchema(pageId: string, faqs: FAQItem[]) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `faq-schema-${pageId}`;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`faq-schema-${pageId}`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [pageId, faqs]);
}
