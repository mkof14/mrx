import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 'w-10 h-10 text-base', title: 'text-lg', tag: 'text-[8px]' },
  md: { box: 'w-12 h-12 text-xl', title: 'text-xl', tag: 'text-[9px]' },
  lg: { box: 'w-14 h-14 text-2xl', title: 'text-2xl', tag: 'text-[10px]' }
};

const MrxLogo: React.FC<Props> = ({ size = 'md', showText = true, showIcon = true, className = '' }) => {
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      {showIcon && (
        <div
          className={`${s.box} shrink-0 rounded-2xl bg-gradient-to-br from-clinical-500 to-clinical-700 flex items-center justify-center text-white font-bold shadow-mrx-md ring-2 ring-white/60 dark:ring-mrx-panel-dark/80`}
        >
          M
        </div>
      )}
      {showText && (
        <div className="flex flex-col leading-none min-w-0">
          <span className={`${s.title} font-bold tracking-tight text-gray-900 dark:text-zinc-100 truncate`}>
            MRX<span className="text-clinical-600">.</span>Health
          </span>
          <span
            className={`${s.tag} font-semibold uppercase tracking-[0.32em] text-clinical-600 dark:text-clinical-400 mt-1 truncate`}
          >
            Medication Reactions eXplorer
          </span>
        </div>
      )}
    </div>
  );
};

export default MrxLogo;
