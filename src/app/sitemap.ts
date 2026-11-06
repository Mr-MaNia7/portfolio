import type { MetadataRoute } from 'next';
import { getConfig } from '@/lib/config-loader';
import { absoluteUrl, CONTENT_LAST_MODIFIED, workPath } from '@/lib/site';

// lastModified is the content date from the config, not the build time, so it
// only changes when the content does. Google ignores changefreq and priority.
export default function sitemap(): MetadataRoute.Sitemap {
  const { projects } = getConfig();
  return [
    { url: absoluteUrl('/'), lastModified: CONTENT_LAST_MODIFIED },
    { url: absoluteUrl('/work'), lastModified: CONTENT_LAST_MODIFIED },
    ...projects.map((p) => ({ url: absoluteUrl(workPath(p)), lastModified: CONTENT_LAST_MODIFIED })),
  ];
}
