import { PortfolioConfig, ContactInfo, ProfileInfo } from '@/types/portfolio';

class ConfigParser {
  private config: PortfolioConfig;

  constructor(config: PortfolioConfig) {
    this.config = config;
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

  generatePresetReplies() {
    const { reviews } = this.config;

    const replies: Record<string, { reply: string; tool: string }> = {};

    replies['Why should I consider you?'] = {
      reply: 'I take AI products to production and get them ready for enterprise buyers, and I’ve been shipping for clients around the world for 5+ years.',
      tool: 'getPresentation',
    };
    replies['Can you handle my stack?'] = {
      reply: 'Most likely. I work in TypeScript, Python and SQL daily and Go weekly, and the lookup checks any tool against work I’ve shipped.',
      tool: 'getSkills',
    };
    replies['What have you shipped?'] = {
      reply: 'Work across AI, SaaS, fintech and telecom. I’d start with AIVI, where I’ve merged 500+ PRs so far.',
      tool: 'getProjects',
    };
    replies['Can I see your résumé?'] = {
      reply: 'Yes. Here’s the short version, and the full history and PDF are one click away.',
      tool: 'getResume',
    };
    replies['How do we get started?'] = {
      reply: 'Send me a few lines about your project by email or on Upwork. My typical response time is 0–4 hours.',
      tool: 'getContact',
    };
    replies['How soon can you start?'] = {
      reply: 'Immediately. I’m available now for full- or part-time contracts, working remotely with hours that overlap US and EU teams.',
      tool: 'getInternship',
    };
    replies['What do past clients say?'] = {
      reply: `They rate me ${reviews.rating}, and several say they’d hire me again. Here’s one in their own words, verbatim from Upwork.`,
      tool: 'getReviews',
    };
    replies['What are you like outside work?'] = {
      reply: 'Chess and football, mostly. I’m ibnuusina on chess.com, and on the pitch I play central midfield.',
      tool: 'getHobbies',
    };

    return replies;
  }

  generateResumeDetails() {
    return this.config.resume;
  }

  getConfig(): PortfolioConfig {
    return this.config;
  }
}

export default ConfigParser;
