import React from 'react';

type PageGuideProps = {
  icon?: string;
  title: string;
  text: string;
  steps?: string[];
  accent?: string;
  className?: string;
};

/** Tip banner + optional numbered steps at top of member pages */
export function PageGuide({ icon = '💡', title, text, steps, accent = '#2563eb', className = '' }: PageGuideProps) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-mrx-sm ${className}`}
      style={{ borderColor: `${accent}33` }}
    >
      <div
        className="p-4 sm:p-5 flex gap-4"
        style={{ background: `linear-gradient(135deg, ${accent}14 0%, transparent 60%)` }}
      >
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-mrx-sm"
          style={{ backgroundColor: `${accent}18` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{text}</p>
        </div>
      </div>
      {steps && steps.length > 0 && (
        <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2">
          {steps.map((step, i) => (
            <span
              key={step}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 dark:bg-mrx-panel-dark border border-mrx-line dark:border-mrx-line-dark text-slate-700 dark:text-zinc-300"
            >
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: accent }}
              >
                {i + 1}
              </span>
              {step}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type SummaryItem = {
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
  icon?: string;
};

export function PageSummaryRow({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {items.map(({ label, value, hint, color, icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-mrx-line dark:border-mrx-line-dark bg-white dark:bg-mrx-panel-dark px-3 py-3 sm:py-3.5 flex gap-2.5 items-start shadow-mrx-sm hover:shadow-mrx-md transition-shadow"
        >
          {icon && (
            <span
              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${color || '#2563eb'}18` }}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">{label}</p>
            <p className="text-xl font-black tabular-nums mt-0.5 leading-none" style={{ color: color || '#2563eb' }}>
              {value}
            </p>
            {hint && <p className="text-[9px] text-slate-400 mt-1 leading-snug">{hint}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

type SectionHeaderProps = {
  step?: number;
  icon: string;
  title: string;
  hint?: string;
  color?: string;
};

export function PageSectionHeader({ step, icon, title, hint, color = '#2563eb' }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      {step != null && (
        <span
          className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-black text-white"
          style={{ backgroundColor: color }}
        >
          {step}
        </span>
      )}
      <span className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        {hint && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

type SettingRowProps = {
  icon: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
};

export function SettingRow({ icon, title, desc, children }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-mrx-line/60 dark:border-mrx-line-dark/60 last:border-0">
      <div className="flex gap-3 min-w-0">
        <span className="text-base shrink-0 w-8 h-8 rounded-lg bg-mrx-inset dark:bg-mrx-inset-dark flex items-center justify-center">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          {desc && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="shrink-0 sm:max-w-[55%] w-full sm:w-auto">{children}</div>
    </div>
  );
}
