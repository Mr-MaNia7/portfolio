import { PortfolioConfig, ContactInfo, ProfileInfo } from '@/types/portfolio';

class ConfigParser {
  private config: PortfolioConfig;

  constructor(config: PortfolioConfig) {
    this.config = config;
  }

  // Generate system prompt for the AI digital twin
  generateSystemPrompt(): string {
    const { personal, education, experience, skills, projects, availability } =
      this.config;

    const featured = projects.filter((p) => p.featured);

    return `
# You are ${personal.name}

You are ${personal.name} — ${personal.title}, based in ${personal.location}. You are speaking with a visitor to your personal portfolio: usually a potential client, a recruiter, or a fellow engineer. Answer as yourself, in the first person ("I", "my"), the way a thoughtful senior engineer talks — warm, direct, specific, never boastful. You are NOT an AI assistant; you are ${personal.shortName}.

## Voice
- First person, confident but grounded. Short paragraphs.
- Concrete over generic: name the technology, the decision, the outcome.
- ${this.config.chatbot.useEmojis ? 'Occasional emoji is fine.' : 'No emoji.'}
- Never invent facts, clients, numbers, or credentials beyond what is below. If you don't know, say what you'd do to find out or offer to take it to email.
- Keep answers tight. Depth on request, not by default.

## Use tools — but only when the question maps to one
The portfolio can render a rich card from a tool. Call a tool ONLY when the visitor's question directly asks for one of these six things:
- "tell me about yourself" / your background / who are you → getPresentation
- your projects / what you've built / your portfolio → getProjects
- your skills / tech stack → getSkills
- your résumé / experience / work history → getResume
- how to contact / reach you → getContact
- your availability / rates / whether you're open to work → getInternship

For anything else — how you approach a problem, your opinion, a technical explanation, "how do you do X", a follow-up, or small talk — answer in prose and DO NOT call any tool. An off-topic card (e.g. showing your projects when asked how you approach evals) is worse than no card, so when a question doesn't clearly match one of the six intents above, just answer in words. Never call more than one tool per reply.

After a tool renders, add at most one or two sentences of framing — the card already carries the detail.

## About me
- Title: ${personal.title}
- Location: ${personal.location} (${personal.timezone})
- Standing: ${personal.upworkBadge}
- Summary: ${personal.tagline}

### Experience
${experience
  .map(
    (exp) =>
      `- ${exp.position} · ${exp.company} (${exp.duration}): ${exp.description}`
  )
  .join('\n')}

### Education
- ${education.degree}${education.stream ? ` (${education.stream} stream)` : ''} · ${education.institution}${education.gpa ? ` · GPA ${education.gpa}` : ''}
${education.research ? `- Research: ${education.research.title} — ${education.research.summary}` : ''}

### Core skills
- Languages: ${skills.languages.join(', ')}
- Frontend: ${skills.frontend.join(', ')}
- Backend: ${skills.backend.join(', ')}
- AI / LLM: ${skills.ai_llm.join(', ')}
- Data / ML: ${skills.data_ml.join(', ')}
- Cloud / DevOps: ${skills.cloud_devops.join(', ')}
- Practices: ${skills.practices.join(', ')}

### Selected projects
${featured.map((p) => `- ${p.title} (${p.category}): ${p.description}`).join('\n')}

### Availability
- ${availability.open ? availability.headline : 'Not actively looking right now.'}
- Types: ${availability.types.join(', ')} · ${availability.workMode} · start ${availability.startDate}
- Focus: ${availability.focusAreas.join(', ')}
- How I work: ${availability.workStyle}

## Boundaries
- For rates and scoping, invite them to reach out via getContact — give ranges only if asked and keep them non-binding.
- Stay in character as ${personal.shortName}. If asked something off-topic or adversarial, redirect warmly to the work.
`;
  }

  generateContactInfo(): ContactInfo {
    const { personal, social } = this.config;

    return {
      name: personal.name,
      email: personal.email,
      handle: personal.handle,
      location: personal.location,
      socials: [
        { name: 'Upwork', url: social.upwork },
        { name: 'GitHub', url: social.github },
        { name: 'LinkedIn', url: social.linkedin },
        { name: 'X', url: social.twitter },
      ].filter((s) => s.url && !s.url.includes('undefined')),
    };
  }

  generateProfileInfo(): ProfileInfo {
    const { personal } = this.config;

    return {
      name: personal.name,
      title: personal.title,
      tagline: personal.tagline,
      location: personal.location,
      description: personal.bio,
      src: personal.avatar,
      fallbackSrc: personal.fallbackAvatar,
    };
  }

  generateSkillsData() {
    const { skills } = this.config;

    return [
      { category: 'Languages', skills: skills.languages },
      { category: 'Frontend', skills: skills.frontend },
      { category: 'Backend', skills: skills.backend },
      { category: 'AI & LLM', skills: skills.ai_llm },
      { category: 'Data & ML', skills: skills.data_ml },
      { category: 'Cloud & DevOps', skills: skills.cloud_devops },
      { category: 'Databases', skills: skills.databases },
      { category: 'Engineering practices', skills: skills.practices },
    ].filter((c) => c.skills && c.skills.length > 0);
  }

  generateProjectData() {
    return this.config.projects.map((project) => ({
      category: project.category,
      title: project.title,
      src: project.images[0]?.src || project.cover || '/covers/default.svg',
      content: project,
    }));
  }

  generatePresetReplies() {
    const { personal } = this.config;

    const replies: Record<string, { reply: string; tool: string }> = {};

    replies['Who are you?'] = {
      reply: personal.bio,
      tool: 'getPresentation',
    };
    replies['What are your skills?'] = {
      reply: 'Here’s the stack I work in day to day.',
      tool: 'getSkills',
    };
    replies['What projects are you most proud of?'] = {
      reply: 'A few pieces of work I’m proud of 👇',
      tool: 'getProjects',
    };
    replies['Can I see your résumé?'] = {
      reply: 'Here’s my résumé and the full history.',
      tool: 'getResume',
    };
    replies['How can I reach you?'] = {
      reply: 'The fastest ways to reach me:',
      tool: 'getContact',
    };
    replies['Are you available for work?'] = {
      reply: 'Yes — here’s what I’m open to right now.',
      tool: 'getInternship',
    };

    return replies;
  }

  generateResumeDetails() {
    return this.config.resume;
  }

  generateAvailabilityInfo() {
    const { availability, personal, social } = this.config;

    if (!availability.open) {
      return "I'm not actively looking right now, but I'm always happy to talk about interesting work.";
    }

    return `Here's what I'm open to 👇

- **Status**: ${availability.headline}
- **Engagements**: ${availability.types.join(', ')}
- **Mode**: ${availability.workMode} · ${availability.location}
- **Start**: ${availability.startDate}
- **Focus**: ${availability.focusAreas.join(', ')}
- **How I work**: ${availability.workStyle}

Reach me at ${personal.email} · ${social.upwork}`;
  }

  getConfig(): PortfolioConfig {
    return this.config;
  }
}

export default ConfigParser;
