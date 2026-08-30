'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, GraduationCap, FlaskConical } from 'lucide-react';
import { resumeDetails, getConfig } from '@/lib/config-loader';

export function Resume() {
  const { experience, education } = getConfig();

  const handleDownload = () => {
    window.open(resumeDetails.downloadUrl, '_blank');
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Résumé · updated {resumeDetails.lastUpdated}
          </span>
          <h2 className="font-display mt-1 text-2xl tracking-tight text-foreground sm:text-3xl">
            Experience
          </h2>
        </div>
        <button
          onClick={handleDownload}
          className="btn-claude h-9 px-4 text-sm"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {experience.map((exp, i) => (
          <motion.div
            key={exp.company + i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="grid grid-cols-1 gap-2 border-b border-border py-5 sm:grid-cols-[128px_1fr] sm:gap-6"
          >
            <div className="font-mono text-xs text-muted-foreground">
              {exp.duration}
              <div className="mt-1 hidden text-[11px] text-muted-foreground/70 sm:block">
                {exp.type}
              </div>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">
                {exp.position}
              </h3>
              <p className="text-sm text-clay">{exp.company}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {exp.description}
              </p>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {exp.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex gap-2 text-[13px] text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-clay" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {exp.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-sm border border-border bg-secondary/50 px-2 py-0.5 text-[11px] text-foreground/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Education & research */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-5">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-clay" />
            <span className="text-[13px] font-semibold text-foreground">
              Education
            </span>
          </div>
          <p className="text-sm text-foreground">{education.degree}</p>
          <p className="text-sm text-muted-foreground">{education.institution}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {education.stream && <span>{education.stream} stream</span>}
            {education.gpa && (
              <>
                <span className="text-border-strong">·</span>
                <span>GPA {education.gpa}</span>
              </>
            )}
          </div>
        </div>

        {education.research && (
          <div className="rounded-lg border border-border p-5">
            <div className="mb-2 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-clay" />
              <span className="text-[13px] font-semibold text-foreground">
                Research
              </span>
            </div>
            <p className="text-sm text-foreground">{education.research.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {education.research.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resume;
