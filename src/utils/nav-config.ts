import { defineNavSection, type NavSection } from './types';
import type { Messages } from '@/locales/i18n';

export function buildNavConfig(t: Messages): NavSection[] {
  return t.nav.sections.map((s) => defineNavSection(s as NavSection));
}

export function findNavItem(navConfig: NavSection[], path: string): { section: NavSection; item: NavSection['items'][0] } | null {
  for (const section of navConfig) {
    const item = section.items.find((i) => i.path === path);
    if (item) return { section, item };
  }
  return null;
}

export function getPrevNext(
  navConfig: NavSection[],
  path: string
): { prev: NavSection['items'][0] | null; next: NavSection['items'][0] | null } {
  const allItems = navConfig.flatMap((s) => s.items).filter((i) => i.path !== '/');
  const idx = allItems.findIndex((i) => i.path === path);
  return {
    prev: idx > 0 ? allItems[idx - 1]! : null,
    next: idx >= 0 && idx < allItems.length - 1 ? allItems[idx + 1]! : null,
  };
}
