'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { MapPin } from 'lucide-react';
import { profileInfo } from '@/lib/config-loader';
import { UpworkBadge } from '@/components/ui/upwork-badge';

const TAGS = [
  'Next.js / NestJS',
  'LLM · RLHF',
  'System design',
  'TypeScript & Python',
  'Top Rated Plus',
];

export function Presentation() {
  const profile = profileInfo;

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr] sm:gap-8">
        {/* Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }}
          className="relative mx-auto aspect-square w-40 overflow-hidden rounded-lg border border-border-strong sm:mx-0 sm:w-full"
        >
          <Image
            src={profile.src}
            alt={profile.name}
            fill
            sizes="200px"
            className="object-cover"
          />
        </motion.div>

        {/* Text */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1.5 text-sm text-foreground/70">{profile.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
              <span className="text-border-strong">·</span>
              <UpworkBadge />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-[15px] leading-relaxed whitespace-pre-line text-foreground/90"
          >
            {profile.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-5 flex flex-wrap gap-1.5"
          >
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border bg-secondary/60 px-2.5 py-1 text-xs text-foreground/75"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Presentation;
