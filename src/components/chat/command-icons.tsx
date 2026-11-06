import {
  Briefcase,
  ChessKnight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  MoonStar,
  Quote,
  User,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Github, Linkedin, Twitter } from '@/components/ui/brand-icons';

/** The icon each command names, shared by the palette and the new-chat starters. */
export const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  folder: FolderGit2,
  layers: Layers,
  file: FileText,
  mail: Mail,
  briefcase: Briefcase,
  external: ExternalLink,
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  copy: Copy,
  download: Download,
  theme: MoonStar,
  quote: Quote,
  chess: ChessKnight,
  users: Users,
  chat: MessageSquare,
};
