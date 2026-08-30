import { PortfolioConfig } from '../types/portfolio';
import ConfigParser from './config-parser';
import rawConfig from '../../portfolio-config.json';

const portfolioConfig = rawConfig as unknown as PortfolioConfig;

// Create a parser instance
const configParser = new ConfigParser(portfolioConfig);

// Export configuration and parsed data
export const getConfig = (): PortfolioConfig => portfolioConfig;
export const getConfigParser = (): ConfigParser => configParser;

// Pre-parsed common data for easy access
export const systemPrompt = configParser.generateSystemPrompt();
export const contactInfo = configParser.generateContactInfo();
export const profileInfo = configParser.generateProfileInfo();
export const skillsData = configParser.generateSkillsData();
export const projectData = configParser.generateProjectData();
export const presetReplies = configParser.generatePresetReplies();
export const resumeDetails = configParser.generateResumeDetails();
export const availabilityInfo = configParser.generateAvailabilityInfo();
