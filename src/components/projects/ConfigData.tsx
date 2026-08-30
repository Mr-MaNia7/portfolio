import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { projectData, getConfig } from '@/lib/config-loader';
import type { Project } from '@/types/portfolio';

const PROJECT_CONTENT = getConfig().projects;

const statusStyles: Record<string, string> = {
  Production: 'bg-clay-soft text-clay-strong',
  Live: 'bg-clay-soft text-clay-strong',
  Ongoing: 'bg-secondary text-foreground/70',
  Delivered: 'bg-secondary text-foreground/70',
  Published: 'bg-secondary text-foreground/70',
};

const ProjectContent = ({ project }: { project: { title: string } }) => {
  const data = PROJECT_CONTENT.find((p) => p.title === project.title) as
    | Project
    | undefined;

  if (!data) return null;

  return (
    <div className="max-w-2xl space-y-6 text-card-foreground">
      {/* Meta line */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
        {data.role && <span>{data.role}</span>}
        {data.client && (
          <>
            <span className="text-border-strong">·</span>
            <span>{data.client}</span>
          </>
        )}
        {data.date && (
          <>
            <span className="text-border-strong">·</span>
            <span>{data.date}</span>
          </>
        )}
        {data.status && (
          <span
            className={`rounded-sm px-2 py-0.5 text-[11px] ${
              statusStyles[data.status] ?? 'bg-secondary text-foreground/70'
            }`}
          >
            {data.status}
          </span>
        )}
      </div>

      <p className="text-[15px] leading-relaxed text-foreground/85">
        {data.description}
      </p>

      {/* Metrics */}
      {data.metrics && data.metrics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.metrics.map((m) => (
            <span
              key={m}
              className="rounded-sm border border-clay/30 bg-clay-soft px-3 py-1 text-xs font-medium text-clay-strong"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Highlights */}
      {data.highlights && data.highlights.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] tracking-wider text-muted-foreground uppercase">
            Highlights
          </h4>
          <ul className="space-y-1.5">
            {data.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-sm text-foreground/80">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-clay" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech stack */}
      {data.techStack && data.techStack.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] tracking-wider text-muted-foreground uppercase">
            Stack
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-sm border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground/75"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {data.links && data.links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {data.links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              {link.name}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}

      {/* Images */}
      {data.images && data.images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 pt-2">
          {data.images.map((image) => (
            <div
              key={image.src}
              className="overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={800}
                height={600}
                className="h-auto w-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Dynamically generated from config
export const data = projectData.map((project) => ({
  category: project.category,
  title: project.title,
  src: project.src,
  content: <ProjectContent project={{ title: project.title }} />,
}));
