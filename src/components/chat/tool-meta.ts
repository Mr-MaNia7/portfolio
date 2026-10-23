import { getConfig } from '@/lib/config-loader';

/**
 * How each tool presents itself in the transcript: the artifact "file" it
 * renders and a short record count, shown in the tool-execution pill.
 */
export interface ToolMeta {
  fn: string;
  file: string;
  records: string;
}

export function getToolMeta(tool: string): ToolMeta {
  const config = getConfig();
  const skillCount = Object.values(config.skills).flat().length;

  switch (tool) {
    case 'getProjects':
      return {
        fn: tool,
        file: 'projects.json',
        records: `${config.projects.length} records`,
      };
    case 'getSkills':
      return {
        fn: tool,
        file: 'skills.json',
        records: `${skillCount} entries`,
      };
    case 'getResume':
      return {
        fn: tool,
        file: 'experience.json',
        records: `${config.experience.length} roles`,
      };
    case 'getContact':
      return { fn: tool, file: 'contact.json', records: 'direct lines' };
    case 'getInternship':
      return {
        fn: tool,
        file: 'availability.json',
        records: config.availability.open ? 'open' : 'closed',
      };
    case 'getPresentation':
      return { fn: tool, file: 'about.md', records: 'profile' };
    default:
      return { fn: tool, file: `${tool}.json`, records: 'result' };
  }
}
