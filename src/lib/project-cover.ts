import type { Project } from '@/types/portfolio';

export const projectCover = (p: Project) =>
  p.cover || p.images[0]?.src || '/covers/default.svg';

/** The one line a card shows: the project's summary, or the first sentence of its description. */
export const projectSummary = (p: Project) => p.summary ?? `${p.description.split('. ')[0].replace(/\.$/, '')}.`;
