import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

const PasswordField: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password'
}) => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('auth.password')}
        autoComplete={autoComplete}
        className="mrx-input pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-sm hover:bg-mrx-inset dark:hover:bg-mrx-inset-dark transition-colors"
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        title={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        {visible ? '🙈' : '👁️'}
      </button>
    </div>
  );
};

export default PasswordField;
