export interface PersonalInfo {
  name: string;
  shortName: string;
  initials: string;
  title: string;
  tagline: string;
  location: string;
  timezone: string;
  email: string;
  handle: string;
  upworkBadge: string;
  upworkBadgeImage?: string;
  bio: string;
  avatar: string;
  fallbackAvatar: string;
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

export interface Skills {
  languages: string[];
  frontend: string[];
  backend: string[];
  ai_llm: string[];
  data_ml: string[];
  cloud_devops: string[];
  databases: string[];
  practices: string[];
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
