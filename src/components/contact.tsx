'use client';

import React from 'react';
import { ArrowUpRight, Briefcase, Mail } from 'lucide-react';
import { Github, Linkedin, Twitter } from '@/components/ui/brand-icons';
import { contactInfo, getConfig } from '@/lib/config-loader';
import { useLocalTime } from '@/hooks/use-local-time';
import { CopyEmail } from '@/components/artifact/copy-email';

const SOCIAL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Upwork: Briefcase,
  GitHub: Github,
  LinkedIn: Linkedin,
  X: Twitter,
};

/** A readable handle for each profile URL. */
function handleFor(name: string, url: string, upworkBadge: string) {
  if (name === 'Upwork') return upworkBadge.split('·')[0].trim();
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? '';
    if (name === 'LinkedIn') return `in/${last}`;
    return `@${last}`;
  } catch {
    return url;
  }
}

/** Contact sheet: one dark field for the invitation, then the direct lines. */
export function Contact() {
  const { personal, availability } = getConfig();
  const time = useLocalTime(personal.timezone);
  const city = personal.location.split(',')[0];

  return (
    <section
      aria-label="Contact"
      className="reveal-sheet w-full overflow-hidden bg-card"
    >
      {/* Invitation, on slate */}
      <div className="bg-field px-5 py-7 text-field-ink sm:px-7 sm:py-8">
        <h2 className="font-display text-[2.5rem] leading-[1.05] sm:text-[2.5rem]">
          Let&apos;s build something.
        </h2>
        <p className="measure mt-3 text-[16px] leading-relaxed text-field-ink">
          {availability.open ? availability.headline + '. ' : ''}Tell me what
          you&apos;re building and I&apos;ll come back with concrete next steps.
        </p>
        <p className="meta mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-field-muted">
          <span>{personal.location}</span>
          <span aria-hidden className="text-field-muted">
            /
          </span>
          <span>
            <span className="num text-field-ink" suppressHydrationWarning>
              {time?.label ?? '--:--'}
            </span>{' '}
            local · {personal.timezone.split('·').pop()?.trim()}
          </span>
        </p>
      </div>

      {/* Email — the direct line */}
      <div
        className="reveal flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5 sm:px-7"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <div className="min-w-0">
          <p className="meta text-muted-foreground">Email</p>
          <a
            href={`mailto:${contactInfo.email}`}
            className="mt-1 block truncate text-[1.25rem] font-semibold leading-snug text-foreground underline decoration-border-strong decoration-1 underline-offset-[5px] transition-colors hover:decoration-clay sm:text-[1.625rem]"
          >
            {contactInfo.email}
          </a>
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyEmail email={contactInfo.email} label="Copy" />
          <a
            href={`mailto:${contactInfo.email}`}
            className="btn-ink h-9 px-3.5 text-[13px]"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            Write
          </a>
        </div>
      </div>

      {/* Profiles */}
      <ul className="border-t border-border" aria-label="Profiles">
        {contactInfo.socials.map((social, i) => {
          const Icon = SOCIAL_ICONS[social.name] ?? ArrowUpRight;
          return (
            <li
              key={social.name}
              className="reveal border-b border-border-subtle last:border-b-0"
              style={{ '--i': i + 2 } as React.CSSProperties}
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-sunken sm:px-7"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="w-20 shrink-0 text-[16px] font-semibold text-foreground">
                  {social.name}
                </span>
                <span className="num min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                  {handleFor(social.name, social.url, personal.upworkBadge)}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="meta border-t border-border bg-sunken px-5 py-3 text-muted-foreground sm:px-7">
        {time
          ? time.isWorkingHours
            ? `It's ${time.label} in ${city} — I'm at the desk.`
            : `It's ${time.label} in ${city} — I'll reply first thing.`
          : `Replies from ${city}.`}
      </p>
    </section>
  );
}

export default Contact;
