'use client';

import React from 'react';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  Copy,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
  Briefcase,
} from 'lucide-react';
import { contactInfo, getConfig } from '@/lib/config-loader';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Upwork: Briefcase,
  GitHub: Github,
  LinkedIn: Linkedin,
  X: Twitter,
};

export function Contact() {
  const { personal, availability } = getConfig();

  const copyEmail = () => {
    navigator.clipboard
      ?.writeText(contactInfo.email)
      .then(() => toast.success('Email copied'))
      .catch(() => toast.error('Could not copy'));
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      <div className="overflow-hidden rounded-lg border border-border">
        {/* Header on slate — the alternating ivory ↔ near-black rhythm */}
        <div className="bg-primary px-6 py-8 text-primary-foreground sm:px-8">
          <span className="font-mono text-[10px] tracking-wider text-primary-foreground/50 uppercase">
            Contact
          </span>
          <h2 className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">
            Let&apos;s build something.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/70">
            {availability.open ? availability.headline + '. ' : ''}Tell me what
            you&apos;re building and I&apos;ll come back with concrete next steps.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-foreground/60">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {personal.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {personal.timezone}
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4 sm:px-8">
          <a
            href={`mailto:${contactInfo.email}`}
            className="group flex min-w-0 items-center gap-3"
          >
            <Mail className="h-4 w-4 shrink-0 text-clay" />
            <span className="truncate text-[15px] font-medium text-foreground group-hover:text-clay">
              {contactInfo.email}
            </span>
          </a>
          <button
            onClick={copyEmail}
            aria-label="Copy email"
            className="flex shrink-0 items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>

        {/* Socials */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {contactInfo.socials.map((social, i) => {
            const Icon = SOCIAL_ICONS[social.name] ?? ArrowUpRight;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-secondary sm:px-8 ${
                  i % 2 === 0 ? 'sm:border-r' : ''
                } border-border ${i < contactInfo.socials.length - (contactInfo.socials.length % 2 === 0 ? 2 : 1) ? 'border-b' : ''}`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-sm text-foreground">{social.name}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Contact;
