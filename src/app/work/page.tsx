import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getConfig } from '@/lib/config-loader';
import { projectCover } from '@/lib/project-cover';
import { pageOpenGraph, pageTwitter, workPath } from '@/lib/site';
import { workIndexGraph } from '@/lib/structured-data';

const { personal, projects } = getConfig();

const title = 'Case studies: AI, SaaS and platform work';
const description = `${projects.length} projects ${personal.name} has shipped: AI voice agents at AIVI, Supabase SaaS, LLM training for Google via Turing, fintech, telecom and research.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/work' },
  openGraph: pageOpenGraph({ path: '/work', title, description }),
  twitter: pageTwitter({ title, description }),
};

export default function WorkIndexPage() {
  return (
    <>
      <JsonLd data={workIndexGraph(projects)} />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="bg-background">
        <div className="wrap pt-10 pb-20 sm:pt-14 lg:pb-28">
          <nav aria-label="Breadcrumb" className="text-[14px] text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li><Link href="/" className="link font-normal">{personal.name}</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground">Case studies</li>
            </ol>
          </nav>
          <header className="mt-8 max-w-[56rem]">
            <h1 className="text-[clamp(34px,1rem+3vw,64px)] leading-[1.04] font-medium tracking-[-0.035em] text-foreground">
              Case studies
            </h1>
            <p className="mt-5 text-[18px] leading-relaxed text-ink-soft">
              {projects.length} projects I&apos;ve shipped as a freelance full-stack and AI engineer: AI voice agents, multi-tenant SaaS on Supabase,
              LLM training, fintech, telecom and research. Each one lists what I built, the stack and the results.
            </p>
          </header>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => {
              const cover = projectCover(p);
              return (
                <li key={p.slug} className="flex">
                  <Link href={workPath(p)} className="card card--link w-full">
                    <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-border bg-sunken">
                      <Image
                        src={cover}
                        alt={`${p.title} cover`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="zoom object-cover"
                        priority={i < 3}
                        unoptimized={cover.endsWith('.svg')}
                      />
                    </span>
                    <span className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
                      <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[14px] text-muted-foreground">
                        <span className="font-medium text-brand-ink">{p.category}</span>
                        <span className="num shrink-0">{p.date}</span>
                      </span>
                      <span className="font-display text-[20px] leading-[1.2] text-foreground">{p.title}</span>
                      <span className="text-[16px] leading-relaxed text-ink-soft">{p.description.split('. ')[0]}.</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
