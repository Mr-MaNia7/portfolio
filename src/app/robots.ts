import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// /_next/ stays crawlable: it holds the CSS, JavaScript and optimized images
// Google needs to render the page. Only the chat API is off limits.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
