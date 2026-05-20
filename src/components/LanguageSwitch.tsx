import { useEffect, useRef, useState } from 'react';
import { useLocale, type Locale } from '@/locales/LocaleContext';
import './LanguageSwitch.css';

const options: Locale[] = ['zh-CN', 'en-US'];

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { t, locale, canSwitch, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!canSwitch) return null;

  const label = locale === 'zh-CN' ? t.header.languageZh : t.header.languageEn;

  return (
    <div className={`language-switch ${className}`.trim()} ref={ref}>
      <button
        type="button"
        className="language-switch__trigger"
        aria-label={t.header.languageLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
      >
        <span>{label}</span>
        <span className="language-switch__chevron" aria-hidden />
      </button>

      {open ? (
        <div className="language-switch__menu" role="listbox" aria-label={t.header.languageLabel}>
          {options.map((option) => {
            const active = locale === option;
            return (
              <button
                key={option}
                type="button"
                className={`language-switch__item ${active ? 'language-switch__item--active' : ''}`}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(option);
                  setOpen(false);
                }}
              >
                <span>{option === 'zh-CN' ? t.header.languageZh : t.header.languageEn}</span>
                {active ? <span className="language-switch__check" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
