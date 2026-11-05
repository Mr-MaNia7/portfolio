/**
 * What to offer next. Each answer has follow-ups that make sense after it; the
 * sidebar takes the questions the chips did not, so more of the eight are in
 * view at once. Every string here must match a preset key in generatePresetReplies.
 */
const FOLLOW_UPS: Record<string, string[]> = {
  getPresentation: ['What have you shipped?', 'What do past clients say?', 'How soon can you start?'],
  getProjects: ['Can you handle my stack?', 'What do past clients say?', 'How do we get started?'],
  getSkills: ['What have you shipped?', 'Can I see your résumé?', 'How soon can you start?'],
  getReviews: ['What have you shipped?', 'How soon can you start?', 'How do we get started?'],
  getResume: ['What have you shipped?', 'What do past clients say?', 'How do we get started?'],
  getInternship: ['How do we get started?', 'What do past clients say?', 'Can you handle my stack?'],
  getContact: ['How soon can you start?', 'What do past clients say?', 'What are you like outside work?'],
  getHobbies: ['Why should I consider you?', 'What have you shipped?', 'How do we get started?'],
};

export function suggestQuestions(
  all: string[],
  asked: ReadonlySet<string>,
  tool?: string
) {
  const unasked = all.filter((q) => !asked.has(q));
  const preferred = (tool ? (FOLLOW_UPS[tool] ?? []) : []).filter((q) =>
    unasked.includes(q)
  );
  const chips = [
    ...preferred,
    ...unasked.filter((q) => !preferred.includes(q)),
  ].slice(0, 3);
  const rest = unasked.filter((q) => !chips.includes(q));
  return { chips, askNext: (rest.length >= 2 ? rest : unasked).slice(0, 3) };
}

/** The panel's name for each answer's full detail. */
export const PANEL_TITLES: Record<string, string> = {
  getPresentation: 'About',
  getProjects: 'Selected work',
  getSkills: 'Skills',
  getReviews: 'Reviews',
  getResume: 'Résumé',
  getInternship: 'Availability',
  getContact: 'Contact',
  getHobbies: 'Personal',
};

/** Plain words for a live tool step and its "Based on" source. Never a tool name. */
export const TOOL_LABELS: Record<
  string,
  { running: string; done: string; source: string }
> = {
  getReviews: {
    running: 'Checking client reviews…',
    done: 'Checked client reviews',
    source: 'client reviews',
  },
  getResume: {
    running: 'Checking my résumé…',
    done: 'Checked my résumé',
    source: 'résumé',
  },
  getProjects: {
    running: 'Looking through my projects…',
    done: 'Looked through my projects',
    source: 'projects',
  },
  getSkills: {
    running: 'Checking my skills…',
    done: 'Checked my skills',
    source: 'skills',
  },
  getContact: {
    running: 'Getting my contact details…',
    done: 'Got my contact details',
    source: 'contact details',
  },
  getInternship: {
    running: 'Checking my availability…',
    done: 'Checked my availability',
    source: 'availability',
  },
  getHobbies: {
    running: 'Checking what I do outside work…',
    done: 'Checked what I do outside work',
    source: 'life outside work',
  },
};
