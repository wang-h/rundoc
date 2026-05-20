import { useLocale, type Locale } from '@/locales/LocaleContext';
import './LanguageSwitch.css';

const options: Locale[] = ['zh-CN', 'en-US'];

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { t, locale, canSwitch, setLocale } = useLocale();

  if (!canSwitch) return null;

  return (
    <div className={`language-switch ${className}`.trim()} role="group" aria-label={t.header.languageLabel}>
      {options.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            className={`language-switch__option ${active ? 'language-switch__option--active' : ''}`}
            aria-pressed={active}
            onClick={() => setLocale(option)}
          >
            {option === 'zh-CN' ? t.header.languageZh : t.header.languageEn}
          </button>
        );
      })}
    </div>
  );
}
