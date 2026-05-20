import zh from './zh-CN.json';
import en from './en-US.json';

export type Locale = 'zh-CN' | 'en-US';
export type I18nMode = 'locked' | 'switchable' | 'auto';

export const localeStorageKey = 'rundoc:locale';

export const messages = {
  'zh-CN': zh,
  'en-US': en,
} as const;

export type Messages = typeof zh;

export function normalizeLocale(input: string | null | undefined): Locale {
  if (!input) return 'zh-CN';
  const lowered = input.toLowerCase();
  if (lowered === 'en' || lowered === 'en-us') return 'en-US';
  if (lowered === 'zh' || lowered === 'zh-cn') return 'zh-CN';
  return 'zh-CN';
}

function normalizeMode(input: string | null | undefined): I18nMode {
  const lowered = (input ?? '').toLowerCase();
  if (lowered === 'locked' || lowered === 'switchable' || lowered === 'auto') return lowered;
  return 'locked';
}

function getBrowserLocale(): Locale {
  const lang = navigator.language || 'zh-CN';
  return normalizeLocale(lang);
}

export const i18nRuntime = {
  mode: normalizeMode((import.meta.env.VITE_I18N_MODE as string | undefined) ?? 'locked'),
  defaultLocale: normalizeLocale((import.meta.env.VITE_DEFAULT_LOCALE as string | undefined) ?? 'zh-CN'),
};

export function isLocaleSwitchVisible(): boolean {
  return i18nRuntime.mode === 'switchable' || i18nRuntime.mode === 'auto';
}

export function readInitialLocale(): Locale {
  if (i18nRuntime.mode === 'locked') return i18nRuntime.defaultLocale;

  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery) return normalizeLocale(fromQuery);

  const fromStorage = window.localStorage.getItem(localeStorageKey);
  if (fromStorage) return normalizeLocale(fromStorage);

  if (i18nRuntime.mode === 'auto') return getBrowserLocale();
  return i18nRuntime.defaultLocale;
}

export function writeLocale(locale: Locale) {
  window.localStorage.setItem(localeStorageKey, locale);
}
