import { getConfig } from '@/lib/config-loader';
import { absoluteUrl, workPath } from '@/lib/site';

// A plain-text summary for AI assistants (llmstxt.org), built from the same config
// as the site, so the two never disagree. Rendered once at build time.
export const dynamic = 'force-static';

export function GET() {
  const { personal, availability, agency, projects, education, social, stats, resume } = getConfig();

  const lines = [
    `# ${personal.name}`,
    '',
    `> ${personal.fullName} (${personal.name}) is a freelance ${personal.title} based in ${personal.location} (${personal.timezone}), working hours that overlap US and EU teams. Takes AI products to production and gets them ready for enterprise buyers: AI voice agents, multi-tenant SaaS on Supabase and Postgres, multi-region infrastructure and SOC 2.`,
    '',
    `Also known as: ${personal.alternateNames.join(', ').replace(/\.$/, '')}.`,
    '',
    '## Key facts',
    ...stats.map((s) => `- ${s.label}: ${s.value}`),
    `- Upwork: ${personal.upworkBadge}`,
    `- Availability: ${availability.headline}. ${availability.workMode}, starting ${availability.startDate.toLowerCase()}.`,
    ...(personal.currently
      ? [`- Currently: ${personal.currently.role} at ${personal.currently.company}${personal.currently.url ? ` (${personal.currently.url})` : ''}`]
      : []),
    `- Founder of ${agency.name} (${agency.url}): ${agency.pitch}`,
    `- Education: ${education.degree}, ${education.institution} (${education.stream} stream)`,
    '',
    '## What I help with',
    ...availability.focusAreas.map((a) => `- ${a}`),
    '',
    '## Case studies',
    `- [All case studies](${absoluteUrl('/work')})`,
    ...projects.map((p) => `- [${p.title}](${absoluteUrl(workPath(p))}): ${p.category}, ${p.date}`),
    '',
    '## Profiles and contact',
    `- [Portfolio](${absoluteUrl('/')}): bio, experience, projects and an AI twin that answers questions`,
    `- [Résumé (PDF)](${absoluteUrl(resume.downloadUrl)})`,
    ...[
      social.upwork && `- [Upwork](${social.upwork})`,
      social.github && `- [GitHub](${social.github})`,
      social.linkedin && `- [LinkedIn](${social.linkedin})`,
    ].filter((l): l is string => Boolean(l)),
    `- Email: ${personal.email} (typical response 0–4 hours)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
