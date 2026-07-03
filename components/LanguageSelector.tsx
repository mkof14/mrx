import React, { useEffect, useRef, useState } from 'react';
import { LOCALES, type Locale } from '../i18n/languages';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  variant?: 'icon' | 'compact';
  className?: string;
  align?: 'left' | 'right';
  dropup?: boolean;
  onChange?: (locale: Locale) => void;
}

const LanguageSelector: React.FC<Props> = ({
  variant = 'icon',
  className = '',
  align = 'left',
  dropup = false,
  onChange
}) => {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleChange = (code: Locale) => {
    setLocale(code);
    onChange?.(code);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (variant === 'compact') {
    return (
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className={`bg-mrx-panel dark:bg-mrx-panel-dark border border-mrx-line dark:border-mrx-line-dark rounded-xl px-2 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-clinical-500 ${className}`}
        aria-label={t('common.language')}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.nativeLabel}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-xl mrx-card dark:bg-mrx-panel-dark flex items-center justify-center text-lg hover:ring-2 hover:ring-clinical-200 dark:hover:ring-clinical-800 transition-all shadow-mrx-sm dark:shadow-none"
        aria-label={t('common.language')}
        aria-expanded={open}
        title={t('common.language')}
      >
        <span className="leading-none">{current.flag}</span>
      </button>

      {open && (
        <div
          className={`absolute z-[500] min-w-[200px] max-h-72 overflow-y-auto mrx-card dark:bg-mrx-panel-dark rounded-2xl shadow-mrx-lg border border-mrx-line dark:border-mrx-line-dark py-1 custom-scrollbar ${
            dropup ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleChange(l.code)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                locale === l.code
                  ? 'bg-clinical-50 dark:bg-clinical-900/30 text-clinical-700 dark:text-clinical-300 font-semibold'
                  : 'hover:bg-mrx-inset dark:hover:bg-mrx-inset-dark text-gray-700 dark:text-zinc-300'
              }`}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="truncate">{l.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
