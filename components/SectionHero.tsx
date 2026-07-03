
import React from 'react';

interface SectionHeroProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  chips?: string[];
  compact?: boolean;
}

const SectionHero: React.FC<SectionHeroProps> = ({ title, subtitle, icon, color, chips = [], compact }) => {
  return (
    <div className={`relative w-full overflow-hidden ${compact ? 'pt-4 pb-1 mb-2' : 'pt-8 pb-4 mb-4'}`}>
      <div
        className="absolute inset-0 opacity-30 dark:opacity-15 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}, transparent 70%)` }}
      />

      <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
        <div className={`flex ${compact ? 'items-center gap-4' : 'flex-col md:flex-row md:items-start gap-6'}`}>
          <div
            className={`${compact ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-4xl'} shrink-0 rounded-2xl mrx-card flex items-center justify-center mx-auto md:mx-0`}
            style={{ boxShadow: `0 8px 24px ${color}33` }}
          >
            {icon}
          </div>
          <div className={`flex-1 ${compact ? 'text-left space-y-0' : 'text-center md:text-left space-y-3'}`}>
            <div>
              <h1 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-gray-900 dark:text-zinc-100 tracking-tight leading-tight`}>
                {title}
              </h1>
              {!compact && (
                <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
              {compact && subtitle && (
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500 leading-snug max-w-xl line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
            {chips.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-clinical-50 dark:bg-clinical-900/25 text-clinical-700 dark:text-clinical-300 border border-clinical-200/60 dark:border-clinical-800/60"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
