import type { Metadata } from 'next';
import { getConfig } from '@/lib/config-loader';
import type { Project } from '@/types/portfolio';

/**
 * Where the site lives, and what it calls itself in search results. A plain
 * module (no 'use client'), so server files get the values, not client references.
 */

// The site serves from www; the bare domain only 308-redirects there. Search
// engines must only ever be told the www address, so the bare domain is
// upgraded even if NEXT_PUBLIC_SITE_URL is set to it.
const CANONICAL_ORIGIN = 'https://www.abdulkarimg.com';

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (!raw || /^https?:\/\/abdulkarimg\.com$/i.test(raw)) return CANONICAL_ORIGIN;
  return raw;
}

export const SITE_URL = resolveSiteUrl();

/** An absolute URL on this site, e.g. absoluteUrl('/work/aivi'). */
export const absoluteUrl = (path = '/') => new URL(path, `${SITE_URL}/`).toString();

const { personal, projects, meta } = getConfig();

// Title and description written for the search result, not the page: the name
// people search for, the role, and the proof, inside Google's display limits.
export const SEO_TITLE = `${personal.name} — Freelance AI & Full-Stack Engineer`;
export const SEO_DESCRIPTION =
  'Freelance senior full-stack & AI engineer. I build AI voice agents, multi-tenant Supabase SaaS and SOC 2-ready platforms. Top Rated Plus, 100% Job Success.';

/** When the site's content last changed, from the config. Used for sitemap dates. */
export const CONTENT_LAST_MODIFIED = meta.lastUpdated;

/**
 * Open Graph for one page. Next merges metadata shallowly, so a page that sets
 * openGraph replaces the layout's whole object: every page builds it here.
 */
export function pageOpenGraph({
  path,
  title = SEO_TITLE,
  description = SEO_DESCRIPTION,
  type = 'website',
}: {
  path: string;
  title?: string;
  description?: string;
  type?: 'website' | 'article';
}): NonNullable<Metadata['openGraph']> {
  return {
    type,
    locale: 'en_US',
    siteName: `${personal.name} · Portfolio`,
    url: path,
    title,
    description,
  };
}

export function pageTwitter({
  title = SEO_TITLE,
  description = SEO_DESCRIPTION,
}: { title?: string; description?: string } = {}): NonNullable<Metadata['twitter']> {
  return { card: 'summary_large_image', title, description };
}

/** Case-study pages, in the order the config lists them. */
export const workPath = (p: Pick<Project, 'slug'>) => `/work/${p.slug}`;
export const findProject = (slug: string) => projects.find((p) => p.slug === slug);

/** The description cut at a sentence boundary to fit a search snippet. */
export function snippet(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let out = '';
  for (const s of sentences) {
    if ((out + ' ' + s).trim().length > max) break;
    out = (out + ' ' + s).trim();
  }
  // A first sentence that is too short to describe the page runs on to a word boundary instead.
  if (out.length >= 110) return out;
  return `${clean.slice(0, max - 1).replace(/[\s,;:]+\S*$/, '')}…`;
}
