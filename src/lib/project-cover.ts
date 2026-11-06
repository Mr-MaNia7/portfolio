import type { Project } from '@/types/portfolio';

export const projectCover = (p: Project) =>
  p.cover || p.images[0]?.src || '/covers/default.svg';
