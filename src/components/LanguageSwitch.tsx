import { useLocale, type Locale } from '@/locales/LocaleContext';
import './LanguageSwitch.css';

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { t, locale, canSwitch, setLocale } = useLocale();

  if (!canSwitch) return null;

  return (
    <label className={`language-switch ${className}`.trim()} aria-label={t.header.languageLabel}>
      <select
        className="language-switch__select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
      >
        <option value="zh-CN">{t.header.languageZh}</option>
        <option value="en-US">{t.header.languageEn}</option>
      </select>
    </label>
  );
}
