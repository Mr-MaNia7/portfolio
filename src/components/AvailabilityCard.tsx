'use client';

import { motion } from 'framer-motion';
import { Clock, Globe, Layers, Zap, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { getConfig } from '@/lib/config-loader';

const AvailabilityCard = () => {
  const { personal, availability, social } = getConfig();

  const meta = [
    { icon: Zap, label: 'Engagements', value: availability.types.join(' · ') },
    { icon: Globe, label: 'Mode', value: `${availability.workMode} · ${availability.location}` },
    { icon: Clock, label: 'Start', value: `${availability.startDate} · ${availability.timezone}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto w-full max-w-3xl py-2"
    >
      <div className="overflow-hidden rounded-lg border border-border">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-full border border-border-strong">
              <Image
                src={personal.avatar}
                alt={personal.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">
                {personal.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {availability.headline}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="status-dot" />
            Available
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {meta.map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-6 py-4">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <p className="text-sm text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Focus areas */}
        <div className="border-t border-border px-6 py-5">
          <div className="mb-3 flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">
            <Layers className="h-3.5 w-3.5" /> Where I add the most value
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availability.focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-sm border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground/80"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* How I work */}
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground/85">
            {availability.workStyle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {availability.goals}
          </p>
          <p className="mt-3 text-[13px] text-muted-foreground italic">
            {availability.note}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-2 border-t border-border px-6 py-5">
          <a href={`mailto:${personal.email}`} className="btn-claude h-9 px-4 text-sm">
            {personal.email}
          </a>
          {social.upwork && (
            <a
              href={social.upwork}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border-strong px-4 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              Hire on Upwork
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AvailabilityCard;
