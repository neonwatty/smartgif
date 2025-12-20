import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

const BASE_URL = 'https://neonwatty.github.io/smartgif';
const SITE_NAME = 'SmartGIF';

export function useSEO({ title, description, canonicalPath }: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (ogUrl && canonicalPath) {
      ogUrl.setAttribute('content', `${BASE_URL}${canonicalPath}`);
    }

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');

    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} - Free Online GIF Tools`;
    };
  }, [title, description, canonicalPath]);
}
