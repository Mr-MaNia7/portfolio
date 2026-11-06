import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getConfig } from '@/lib/config-loader';
import { splitMetric } from '@/lib/metrics';
import { projectCover } from '@/lib/project-cover';
import { findProject, pageOpenGraph, pageTwitter, snippet, workPath } from '@/lib/site';
import { projectGraph } from '@/lib/structured-data';

/**
 * One case study as a real page: the same words as the landing page's dialog,
 * but in the HTML, at its own URL, so search engines and AI assistants can read
 * and cite it. Every project is prerendered at build time.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getConfig().projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};
  const { personal } = getConfig();
  // The project name and the person, inside Google's ~60-character title width.
  const title = `${project.title} | ${personal.name}`;
  const description = snippet(project.description);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: workPath(project) },
    openGraph: pageOpenGraph({ path: workPath(project), title, description, type: 'article' }),
    twitter: pageTwitter({ title, description }),
  };
}

export default async function CaseStudyPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const { projects, personal } = getConfig();
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const cover = projectCover(project);
  const subject = project.client && !/upwork client/i.test(project.client) ? project.client : project.title.split(' — ')[0];
  const askTwin = `/?query=${encodeURIComponent(`Tell me about your ${subject} work`)}`;
  const paragraphs = project.description.split(/\n{2,}/);

  return (
    <>
      <JsonLd data={projectGraph(project)} />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="bg-background">
        <article className="wrap pt-10 pb-20 sm:pt-14 lg:pb-28">
          <nav aria-label="Breadcrumb" className="text-[14px] text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="link font-normal">{personal.name}</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/work" className="link font-normal">Case studies</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground">{subject}</li>
            </ol>
          </nav>

          <header className="mt-8 max-w-[56rem]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-muted-foreground">
              <span className="font-medium text-brand-ink">{project.category}</span>
              <span aria-hidden>·</span>
              <span className="num">{project.date}</span>
              <span aria-hidden>·</span>
              <span>{project.status}</span>
            </p>
            <h1 className="mt-4 text-[clamp(34px,1rem+3vw,64px)] leading-[1.04] font-medium tracking-[-0.035em] text-foreground">
              {project.title}
            </h1>
            <p className="mt-5 text-[18px] leading-relaxed text-ink-soft">
              {project.role}
              {project.client && <> · for {project.client}</>}
            </p>
          </header>

          {project.metrics?.length ? (
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-border py-6 sm:grid-cols-4">
              {project.metrics.map((m) => {
                const { figure, caption } = splitMetric(m);
                return (
                  <div key={m} className="flex flex-col gap-1">
                    <dt className="text-[14px] leading-snug text-muted-foreground">{figure ? caption : 'Result'}</dt>
                    <dd className="num order-first text-[clamp(22px,1rem+1vw,32px)] leading-tight font-medium tracking-tight text-foreground">
                      {figure ?? caption}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : null}

          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-sunken">
            <Image
              src={cover}
              alt={`${project.title} cover`}
              fill
              priority
              sizes="(min-width: 1440px) 1360px, 100vw"
              className="object-contain"
              unoptimized={cover.endsWith('.svg')}
            />
          </div>

          <div className="grid-12 mt-12 lg:mt-16">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-display text-[26px] leading-tight text-foreground">The project</h2>
              {paragraphs.map((p) => (
                <p key={p.slice(0, 32)} className="mt-4 text-[18px] leading-relaxed text-ink-soft">{p}</p>
              ))}
              {project.highlights?.length ? (
                <>
                  <h2 className="mt-12 font-display text-[26px] leading-tight text-foreground">What I built</h2>
                  <ul className="mt-4 flex flex-col">
                    {project.highlights.map((h) => (
                      <li key={h} className="border-b border-border py-3 text-[17px] leading-relaxed text-foreground">{h}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:col-start-9" aria-label="Project details">
              <dl className="card gap-5 p-6">
                {project.role && (
                  <div>
                    <dt className="text-[14px] text-muted-foreground">Role</dt>
                    <dd className="mt-1 text-[16px] text-foreground">{project.role}</dd>
                  </div>
                )}
                {project.client && (
                  <div>
                    <dt className="text-[14px] text-muted-foreground">Client</dt>
                    <dd className="mt-1 text-[16px] text-foreground">{project.client}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[14px] text-muted-foreground">When</dt>
                  <dd className="num mt-1 text-[16px] text-foreground">{project.date}</dd>
                </div>
                <div>
                  <dt className="text-[14px] text-muted-foreground">Stack</dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-1.5">
                      {project.techStack.map((t) => (
                        <li key={t} className="rounded-full border border-border px-2.5 py-1 text-[13px] text-ink-soft">{t}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                {project.links.length > 0 && (
                  <div>
                    <dt className="text-[14px] text-muted-foreground">Links</dt>
                    <dd className="mt-1 flex flex-col gap-1">
                      {project.links.map((l) => (
                        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="link inline-flex w-fit items-center gap-1 text-[16px] text-foreground">
                          {l.name}
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <Link href={askTwin} className="btn btn--secondary mt-4 w-full">
                Ask my twin about this project
                <ArrowRight className="nudge h-4 w-4" aria-hidden />
              </Link>
            </aside>
          </div>

          {project.images.length > 0 && (
            <section aria-labelledby="gallery-heading" className="mt-16 lg:mt-20">
              <h2 id="gallery-heading" className="font-display text-[26px] leading-tight text-foreground">Screens</h2>
              <ul className="mt-6 grid gap-6 md:grid-cols-2">
                {project.images.map((img) => (
                  <li key={img.src}>
                    <figure>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-sunken">
                        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
                      </div>
                      <figcaption className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{img.alt}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav aria-label="More case studies" className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 lg:mt-20">
            <Link href="/work" className="link inline-flex items-center gap-1.5 text-[16px] text-foreground">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All case studies
            </Link>
            {next && next !== project && (
              <Link href={workPath(next)} className="link inline-flex items-center gap-1.5 text-right text-[16px] text-foreground">
                Next: {next.title}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
