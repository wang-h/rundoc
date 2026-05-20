import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  i18nRuntime,
  isLocaleSwitchVisible,
  messages,
  readInitialLocale,
  type Locale,
  type Messages,
  writeLocale,
} from './i18n';

interface LocaleContextValue {
  locale: Locale;
  t: Messages;
  canSwitch: boolean;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readInitialLocale());

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: messages[locale],
      canSwitch: isLocaleSwitchVisible(),
      setLocale: (next) => {
        if (i18nRuntime.mode === 'locked') return;
        setLocaleState(next);
        writeLocale(next);
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
