export interface PersonalInfo {
  name: string;
  shortName: string;
  initials: string;
  title: string;
  /** The hero's H1: one promise, in plain words. */
  headline: string;
  tagline: string;
  location: string;
  timezone: string;
  email: string;
  handle: string;
  upworkBadge: string;
  upworkBadgeImage?: string;
  bio: string;
  /** Current role, shown in the hero: "Software Engineer at AIVI". */
  currently?: { role: string; company: string; url?: string };
  avatar: string;
  fallbackAvatar: string;
  /** Portrait (4:5) for the hero and About card. */
  photo: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Availability {
  open: boolean;
  headline: string;
  types: string[];
  workMode: string;
  location: string;
  timezone: string;
  startDate: string;
  focusAreas: string[];
  workStyle: string;
  goals: string;
  note: string;
}

export interface Experience {
  company: string;
  position: string;
  type: string;
  duration: string;
  location?: string;
  description: string;
  highlights?: string[];
  technologies: string[];
}

export interface Research {
  title: string;
  summary: string;
  link?: string;
}

export interface Education {
  degree: string;
  institution: string;
  stream?: string;
  duration?: string;
  gpa?: string;
  graduationDate?: string;
  note?: string;
  research?: Research;
  achievements: string[];
}

/** How often a language is in my hands. */
export type Usage = 'Daily' | 'Weekly' | 'When it fits';

export interface Language {
  name: string;
  usage: Usage;
  note: string;
}

/** One thing I do for clients, the proof that I've done it, and the tools. */
export interface Capability {
  id: string;
  name: string;
  /** First-person, one or two sentences. */
  summary: string;
  /** Concrete evidence from shipped work. */
  proof: string[];
  /** Where it was shipped — matches `Project.client` / `Experience.company`. */
  shippedAt: string[];
  tools: string[];
}

export interface Skills {
  intro: string;
  languages: Language[];
  capabilities: Capability[];
}

export interface Quote {
  text: string;
  author: string;
  role?: string;
  engagement: string;
  date: string;
  rating?: number;
  verified?: string;
}

export interface Reviews {
  rating: string;
  summary: string;
  /** Ratings without written text — shown as ratings, never as quotes. */
  ratings: Array<{ client: string; rating: number; detail: string }>;
  quotes: Quote[];
  endorsements: Array<{ label: string; count: number }>;
  source: { name: string; url: string };
}

export interface Hobbies {
  intro: string;
  chess: {
    username: string;
    url: string;
    /** Last known stats, used until (or if) the live API answers. */
    fallback: { peakRapid: number; rapidGames: number; league: string };
  };
  football: {
    position: string;
    positionShort: string;
    note: string;
    clubs: string[];
    idol: { name: string; note: string };
  };
}

export interface Agency {
  name: string;
  role: string;
  url: string;
  pitch: string;
  points: string[];
}

export interface ProjectLink {
  name: string;
  url: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface Project {
  title: string;
  category: string;
  role?: string;
  client?: string;
  description: string;
  techStack: string[];
  date: string;
  status: string;
  featured: boolean;
  highlights?: string[];
  metrics?: string[];
  links: ProjectLink[];
  cover?: string;
  images: ProjectImage[];
  /** Lead case study on the landing page. */
  flagship?: boolean;
}

export interface Social {
  upwork: string;
  github: string;
  linkedin: string;
  twitter: string;
  [key: string]: string;
}

export interface Resume {
  title: string;
  description: string;
  fileType: string;
  lastUpdated: string;
  fileSize: string;
  downloadUrl: string;
}

export interface Chatbot {
  name: string;
  personality: string;
  tone: string;
  language: string;
  responseStyle: string;
  useEmojis: boolean;
  topics: string[];
}

export interface PresetQuestions {
  me: string[];
  professional: string[];
  projects: string[];
  contact: string[];
  fun: string[];
}

export interface Meta {
  configVersion: string;
  lastUpdated: string;
  generatedBy: string;
  description: string;
}

export interface PortfolioConfig {
  personal: PersonalInfo;
  stats: Stat[];
  availability: Availability;
  experience: Experience[];
  education: Education;
  skills: Skills;
  projects: Project[];
  reviews: Reviews;
  hobbies: Hobbies;
  agency: Agency;
  social: Social;
  resume: Resume;
  chatbot: Chatbot;
  presetQuestions: PresetQuestions;
  meta: Meta;
}

// Utility types for component props
export interface ContactInfo {
  name: string;
  email: string;
  handle: string;
  location: string;
  socials: Array<{ name: string; url: string }>;
}

export interface ProfileInfo {
  name: string;
  title: string;
  tagline: string;
  location: string;
  description: string;
  src: string;
  fallbackSrc: string;
}

export interface SkillCategory {
  category: string;
  icon: React.ReactNode;
  skills: string[];
}
