import { getConfig } from '@/lib/config-loader';
import { absoluteUrl, CONTENT_LAST_MODIFIED, SITE_URL, snippet, workPath } from '@/lib/site';
import type { Project } from '@/types/portfolio';

/**
 * Schema.org JSON-LD for every page, as one connected graph. Each entity has a
 * stable @id, so the case-study pages point at the same Person the home page
 * describes instead of repeating it.
 */

const { personal, social, agency, education } = getConfig();

export const ids = {
  person: `${SITE_URL}/#person`,
  website: `${SITE_URL}/#website`,
  agency: `${agency.url.replace(/\/+$/, '')}/#organization`,
};

type Node = Record<string, unknown>;

// "Addis Ababa, Ethiopia" -> locality and an ISO country code.
const COUNTRY_CODES: Record<string, string> = { Ethiopia: 'ET' };

function personNode(): Node {
  const [locality, country] = personal.location.split(',').map((s) => s.trim());
  const isPlaceholderPhoto = /placeholder/i.test(personal.photo) || personal.photo.endsWith('.svg');

  return {
    '@type': 'Person',
    '@id': ids.person,
    name: personal.name,
    // Every form of the name used on other profiles, so they read as one person.
    alternateName: personal.alternateNames.filter((n) => n !== personal.name),
    jobTitle: personal.title,
    description: personal.tagline,
    url: absoluteUrl('/'),
    // Search engines want a raster photo of the person. Until the real headshot
    // lands, leave the field out rather than point at a placeholder drawing.
    ...(isPlaceholderPhoto ? {} : { image: absoluteUrl(personal.photo) }),
    email: `mailto:${personal.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      ...(country ? { addressCountry: COUNTRY_CODES[country] ?? country } : {}),
    },
    sameAs: [social.upwork, social.github, social.linkedin, social.twitter].filter(Boolean),
    alumniOf: { '@type': 'CollegeOrUniversity', name: education.institution },
    ...(personal.currently
      ? {
          worksFor: {
            '@type': 'Organization',
            name: personal.currently.company,
            ...(personal.currently.url ? { url: personal.currently.url } : {}),
          },
        }
      : {}),
    knowsAbout: [
      'Full-Stack Development',
      'AI Voice Agents',
      'Large Language Models',
      'Multi-tenant SaaS',
      'Multi-region infrastructure',
      'SOC 2',
      'Reinforcement learning',
      'Supabase',
      'PostgreSQL',
      'Kubernetes',
      'Terraform',
      'Next.js',
      'TypeScript',
      'Python',
      'Go',
    ],
  };
}

function agencyNode(): Node {
  return {
    '@type': 'Organization',
    '@id': ids.agency,
    name: agency.name,
    url: agency.url,
    founder: { '@id': ids.person },
  };
}

function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: absoluteUrl('/'),
    name: `${personal.name} · Portfolio`,
    inLanguage: 'en',
    publisher: { '@id': ids.person },
  };
}

/** The home page: the site, the profile page and the person it is about. */
export function homeGraph(): Node {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteNode(),
      {
        '@type': 'ProfilePage',
        '@id': `${absoluteUrl('/')}#profilepage`,
        url: absoluteUrl('/'),
        name: `${personal.name} — ${personal.title}`,
        isPartOf: { '@id': ids.website },
        mainEntity: { '@id': ids.person },
        dateModified: CONTENT_LAST_MODIFIED,
        inLanguage: 'en',
      },
      personNode(),
      agencyNode(),
    ],
  };
}

function breadcrumbs(items: Array<{ name: string; path: string }>): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** The case-study index: a collection page listing every project. */
export function workIndexGraph(projects: Project[]): Node {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${absoluteUrl('/work')}#page`,
        url: absoluteUrl('/work'),
        name: `Case studies · ${personal.name}`,
        isPartOf: { '@id': ids.website },
        about: { '@id': ids.person },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(workPath(p)),
            name: p.title,
          })),
        },
      },
      breadcrumbs([
        { name: personal.name, path: '/' },
        { name: 'Case studies', path: '/work' },
      ]),
    ],
  };
}

/** One case study: the work itself, credited to the person, plus its breadcrumb. */
export function projectGraph(project: Project): Node {
  const url = absoluteUrl(workPath(project));
  const isResearch = project.links.some((l) => l.url.includes('doi.org'));
  const cover = project.cover ?? project.images[0]?.src;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': isResearch ? 'ScholarlyArticle' : 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: project.title,
        headline: project.title,
        description: snippet(project.description, 300),
        ...(cover && !cover.endsWith('.svg') ? { image: absoluteUrl(cover) } : {}),
        // Built or co-authored by the person; client work is credited, never claimed.
        ...(isResearch ? { author: { '@id': ids.person } } : { creator: { '@id': ids.person } }),
        // "Upwork client" is an anonymised placeholder, not an organisation.
        ...(project.client && !/upwork client/i.test(project.client)
          ? { sourceOrganization: { '@type': 'Organization', name: project.client } }
          : {}),
        keywords: project.techStack.join(', '),
        genre: project.category,
        ...(project.links.length ? { sameAs: project.links.map((l) => l.url) } : {}),
        isPartOf: { '@id': ids.website },
        inLanguage: 'en',
      },
      breadcrumbs([
        { name: personal.name, path: '/' },
        { name: 'Case studies', path: '/work' },
        { name: project.title, path: workPath(project) },
      ]),
    ],
  };
}

/** Serialised for a <script type="application/ld+json">, with "<" escaped so no string can close the tag. */
export const toJsonLd = (data: Node) => JSON.stringify(data).replace(/</g, '\\u003c');
