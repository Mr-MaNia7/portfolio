import { toJsonLd } from '@/lib/structured-data';

/** Structured data for search engines and AI assistants. Server-rendered into the HTML. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(data) }} />;
}
