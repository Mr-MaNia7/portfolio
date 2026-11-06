import { PortfolioConfig } from '../types/portfolio';
import ConfigParser from './config-parser';
import rawConfig from '../../portfolio-config.json';

const portfolioConfig = rawConfig as unknown as PortfolioConfig;

const configParser = new ConfigParser(portfolioConfig);

export const getConfig = (): PortfolioConfig => portfolioConfig;

// Pre-parsed data the UI reads. The system prompt is built server-side, in system-prompt.ts.
export const contactInfo = configParser.generateContactInfo();
export const profileInfo = configParser.generateProfileInfo();
export const presetReplies = configParser.generatePresetReplies();
export const resumeDetails = configParser.generateResumeDetails();
