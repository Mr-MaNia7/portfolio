import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';

/**
 * Header and footer for the static pages (case studies). Server components: the
 * pages around them stay plain HTML, with no chat code in their first load.
 */

export function SiteHeader() {
  const { personal, resume } = getConfig();
  return (
    <header className="nav nav--static">
      <div className="wrap">
        <Link href="/" className="press flex min-w-0 shrink-0 items-center gap-2.5" aria-label={`${personal.name}, home`}>
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <Image src={personal.avatar} alt="" fill sizes="32px" unoptimized className="object-cover" />
          </span>
          <span className="font-display truncate text-[18px] leading-none text-foreground">
            <span className="sm:hidden">{personal.shortName}</span>
            <span className="hidden sm:inline">{personal.name}</span>
          </span>
        </Link>
        <nav aria-label="Site" className="flex items-center gap-5">
          <Link href="/work" className="nav__word max-sm:!hidden">
            Case studies
          </Link>
          <a href={resume.downloadUrl} className="nav__word max-md:!hidden">
            Résumé
          </a>
          <Link href="/" className="btn btn--primary">
            Ask my AI twin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { personal, social, resume } = getConfig();
  const city = personal.location.split(',')[0];
  return (
    <footer className="closing closing--compact" aria-labelledby="close-heading">
      <div className="wrap">
        <div>
          <h2 id="close-heading" className="max-w-[18ch] text-[clamp(36px,1rem+3vw,64px)] leading-[1.02] font-medium tracking-[-0.04em]">
            Tell me what you need built
          </h2>
          <p className="mt-6 max-w-[62ch] text-[18px] leading-relaxed text-[var(--band-muted)]">
            Send a few lines about the project. I reply within 0–4 hours with questions and an honest read on whether I&apos;m the right fit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 max-sm:flex-col">
            <a href={`mailto:${personal.email}`} className="btn btn--primary">
              Email {personal.email}
            </a>
            <Link href="/" className="btn btn--secondary">
              Interview my AI twin
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6 border-t border-[var(--band-line)] pt-6 text-[14px] text-[var(--band-muted)]">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            <li><Link className="foot nav__word !text-[var(--band-ink)]" href="/work">Case studies</Link></li>
            {social.github && <li><a className="foot nav__word !text-[var(--band-ink)]" href={social.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" aria-hidden /></a></li>}
            {social.linkedin && <li><a className="foot nav__word !text-[var(--band-ink)]" href={social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" aria-hidden /></a></li>}
            {social.upwork && <li><a className="foot nav__word !text-[var(--band-ink)]" href={social.upwork} target="_blank" rel="noopener noreferrer">Upwork <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" aria-hidden /></a></li>}
            <li><a className="foot nav__word !text-[var(--band-ink)]" href={resume.downloadUrl}>Résumé</a></li>
          </ul>
          <p className="flex flex-wrap justify-between gap-x-6 gap-y-1">
            <span>© {new Date().getFullYear()} {personal.name}, {city}</span>
            <span>Product names and logos are trademarks of their owners</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
