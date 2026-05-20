import {
  type LucideIcon,
  BookOpen,
  Brain,
  Code2,
  Compass,
  Github,
  Inbox,
  Library,
  Rocket,
  Rss,
  Send,
  Sparkles,
  Tags,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';

/** 按文档分区标题映射（与 nav.sections.title 一致） */
export const sectionTitleIcon: Record<string, LucideIcon> = {
  开始: Compass,
  项目观察: Rss,
  使用指南: BookOpen,
  'AI 原生': Brain,
  参考: Library,
};

/** 「按角色开始」各入口（按 homeAudiences.path） */
export const audiencePathIcon: Record<string, LucideIcon> = {
  '/docs/guide/writing-docs': Workflow,
  '/docs/architecture': Code2,
  '/docs/ai/api-contract': Brain,
  '/docs/overview': Compass,
};

/** RunDoc capabilities: keep aligned with homeCapabilities. */
export const capabilityIcons: LucideIcon[] = [Inbox, Rss, Tags, TrendingUp, Send];

export const homePanelIcons = {
  capabilities: Sparkles,
  audiences: Users,
} as const;

export const homeTopNavIcons = {
  overview: BookOpen,
  quickStart: Zap,
  developers: Code2,
  source: Github,
} as const;

export const homeCtaIcons = {
  primary: Rocket,
  secondary: BookOpen,
} as const;
