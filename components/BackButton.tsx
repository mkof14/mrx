import React from 'react';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  onClick: () => void;
  label?: string;
  className?: string;
}

const BackButton: React.FC<Props> = ({ onClick, label, className = '' }) => {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-clinical-600 dark:hover:text-clinical-400 transition-colors ${className}`}
    >
      <span className="w-9 h-9 rounded-xl bg-mrx-inset dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark flex items-center justify-center text-lg leading-none">
        ←
      </span>
      {label ?? t('common.back')}
    </button>
  );
};

export default BackButton;
