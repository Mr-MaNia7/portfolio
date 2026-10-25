import { PortfolioConfig, ContactInfo, ProfileInfo } from '@/types/portfolio';

class ConfigParser {
  private config: PortfolioConfig;

  constructor(config: PortfolioConfig) {
    this.config = config;
  }

  // Generate system prompt for the AI digital twin
  generateSystemPrompt(): string {
    const {
      personal,
      education,
      experience,
      skills,
      projects,
      availability,
      agency,
      reviews,
      hobbies,
    } = this.config;

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
The portfolio can render a rich card from a tool. Call a tool ONLY when the visitor's question directly asks for one of these things:
- "tell me about yourself" / your background / who are you → answer in your own words, in prose (there is no tool for this — speak as yourself, don't try to render a card)
- your projects / what you've built / your portfolio → getProjects
- your skills / tech stack → getSkills
- your résumé / experience / work history → getResume
- how to contact / reach you → getContact
- your availability / whether you're open to work / hiring you → getInternship
- reviews / what clients say / testimonials → getReviews
- hobbies / what you do outside of code / chess / football → getHobbies

For anything else — how you approach a problem, your opinion, a technical explanation, "how do you do X", a single project in depth (e.g. "tell me about AIVI"), a follow-up, or small talk — answer in prose and DO NOT call any tool. An off-topic card (e.g. showing your projects when asked how you approach evals) is worse than no card, so when a question doesn't clearly match one of the intents above, just answer in words. Never call more than one tool per reply.

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

### What I do (capabilities, with proof)
- Languages: ${skills.languages.map((l) => `${l.name} (${l.note})`).join(', ')}
${skills.capabilities
  .map(
    (c) =>
      `- ${c.name}: ${c.summary} Proof: ${c.proof.join('; ')}. Tools: ${c.tools.join(', ')}.`
  )
  .join('\n')}

### Selected projects
${featured.map((p) => `- ${p.title} (${p.category}, ${p.date}): ${p.description}${p.highlights?.length ? ` Highlights: ${p.highlights.join('; ')}.` : ''}`).join('\n')}

### My agency
- I founded ${agency.name} (${agency.url}). ${agency.pitch} If a visitor needs a team rather than one engineer, point them there.

### What clients say
- ${reviews.summary}. Rated ${reviews.ratings.map((r) => `${r.rating.toFixed(1)} by ${r.client}`).join(', ')}.
${reviews.quotes.map((q) => `- "${q.text}" — ${q.author}${q.role ? `, ${q.role}` : ''} (${q.engagement}, ${q.date})`).join('\n')}
- Only quote these words exactly; never invent or paraphrase a review as a quote.

### Off the clock
- ${hobbies.intro}
- Chess on chess.com as ${hobbies.chess.username} (peak rapid ${hobbies.chess.fallback.peakRapid}, ${hobbies.chess.fallback.rapidGames}+ rapid games).
- Football: I play ${hobbies.football.position.toLowerCase()} (${hobbies.football.positionShort}). I support ${hobbies.football.clubs.join(' and ')}, and ${hobbies.football.idol.name} is the GOAT.

### Availability
- ${availability.open ? availability.headline : 'Not actively looking right now.'}
- Types: ${availability.types.join(', ')} · ${availability.workMode} · start ${availability.startDate}
- Focus: ${availability.focusAreas.join(', ')}
- How I work: ${availability.workStyle}

## Boundaries
- Never state an hourly rate or price. For rates and scoping, invite them to reach out via getContact or Upwork.
- Never name the third-party vendors my clients use, and never name internal repositories.
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
      src: personal.photo,
      fallbackSrc: personal.fallbackAvatar,
    };
  }

  generateSkillsData() {
    const { skills } = this.config;

    return [
      { category: 'Languages', skills: skills.languages.map((l) => l.name) },
      ...skills.capabilities.map((c) => ({
        category: c.name,
        skills: c.tools,
      })),
    ];
  }

  generateProjectData() {
    return this.config.projects.map((project) => ({
      category: project.category,
      title: project.title,
      src: project.cover || project.images[0]?.src || '/covers/default.svg',
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
    replies['What do clients say about you?'] = {
      reply: 'In their own words, verbatim from Upwork.',
      tool: 'getReviews',
    };
    replies['What do you do outside of code?'] = {
      reply: 'Chess and football, mostly.',
      tool: 'getHobbies',
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
