import React from 'react';
import type { TranslationKey } from '../../i18n/translations';

export const MED_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export const MEMBER_QUICK_ACTIONS: {
  tab: string;
  icon: string;
  key: TranslationKey;
  accent: string;
}[] = [
  { tab: 'meds', icon: '💊', key: 'home.quick.addMed', accent: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800' },
  { tab: 'checkin', icon: '📝', key: 'home.quick.checkin', accent: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-800' },
  { tab: 'assistant', icon: '🧠', key: 'home.quick.ask', accent: 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800' },
  { tab: 'interactions', icon: '🧩', key: 'home.quick.interactions', accent: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800' },
  { tab: 'safety', icon: '🚨', key: 'home.quick.warnings', accent: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800' },
  { tab: 'reports', icon: '📋', key: 'home.quick.report', accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800' },
  { tab: 'tools', icon: '🧰', key: 'home.quick.tools', accent: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800' }
];

export function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold text-slate-400 uppercase tracking-wide ${className}`}>{children}</p>
  );
}

export function StatPill({
  label,
  value,
  sub,
  color,
  onClick
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-xl border border-mrx-line dark:border-mrx-line-dark bg-white dark:bg-mrx-panel-dark p-3 text-left min-w-[100px] flex-1 shrink-0 ${onClick ? 'hover:shadow-mrx-sm transition-shadow' : ''}`}
    >
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">{label}</p>
      <p className="text-lg font-black mt-0.5 tabular-nums" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sub}</p>}
    </Tag>
  );
}

export function QuickActionGrid({
  t,
  onAction,
  columns = 6
}: {
  t: (k: TranslationKey) => string;
  onAction: (tab: string) => void;
  columns?: 3 | 6;
}) {
  return (
    <div className={`grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2`}>
      {MEMBER_QUICK_ACTIONS.map(({ tab, icon, key, accent }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onAction(tab)}
          className={`rounded-xl border p-2.5 text-center hover:scale-[1.02] active:scale-95 transition-all ${accent}`}
        >
          <span className="text-xl sm:text-2xl block">{icon}</span>
          <span className="text-[9px] sm:text-[10px] font-bold mt-1 block leading-tight">{t(key)}</span>
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  extra
}: {
  icon: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-mrx-line dark:border-mrx-line-dark bg-gradient-to-br from-clinical-500/5 via-white to-violet-500/5 dark:from-clinical-900/15 dark:via-mrx-panel-dark dark:to-violet-900/10 p-6 sm:p-8 text-center space-y-4">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md mx-auto">{description}</p>}
      {extra}
      {ctaLabel && onCta && (
        <button type="button" onClick={onCta} className="mrx-btn-primary text-sm px-6 py-3">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export function ViewpointTabs<T extends string>({
  options,
  value,
  onChange,
  labels
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            value === v
              ? 'bg-clinical-600 text-white shadow-mrx-sm'
              : 'bg-white dark:bg-mrx-panel-dark text-slate-500 border border-mrx-line dark:border-mrx-line-dark'
          }`}
        >
          {labels?.[v] ?? v}
        </button>
      ))}
    </div>
  );
}

export function LiveDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-clinical-600">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      {label}
    </span>
  );
}
