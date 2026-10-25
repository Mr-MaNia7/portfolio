import { getConfig } from '@/lib/config-loader';
import { renderResumePdf } from '@/lib/resume-pdf';

// Rendered once at build time from portfolio-config.json, then served static.
export const dynamic = 'force-static';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abdulkarimg.com';
  const config = getConfig();
  const pdf = await renderResumePdf(config, siteUrl);
  const fileName = `${config.personal.name.replace(/[^A-Za-z]+/g, '-')}-Resume.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
    },
  });
}
