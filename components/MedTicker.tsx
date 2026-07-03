import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

export const TICKER_MEDS = [
  { symbol: 'SER', name: 'Sertraline' },
  { symbol: 'MET', name: 'Metformin' },
  { symbol: 'LIS', name: 'Lisinopril' },
  { symbol: 'IBU', name: 'Ibuprofen' },
  { symbol: 'ESC', name: 'Escitalopram' },
  { symbol: 'AMX', name: 'Amoxicillin' },
  { symbol: 'ATO', name: 'Atorvastatin' },
  { symbol: 'OME', name: 'Omeprazole' },
  { symbol: 'AML', name: 'Amlodipine' },
  { symbol: 'LEV', name: 'Levothyroxine' },
  { symbol: 'ZOL', name: 'Zoloft' },
  { symbol: 'XAN', name: 'Alprazolam' },
  { symbol: 'WAR', name: 'Warfarin' },
  { symbol: 'GAB', name: 'Gabapentin' },
  { symbol: 'LOS', name: 'Losartan' },
  { symbol: 'SIM', name: 'Simvastatin' },
  { symbol: 'PAN', name: 'Pantoprazole' },
  { symbol: 'TRZ', name: 'Trazodone' },
  { symbol: 'HCT', name: 'Hydrochlorothiazide' },
  { symbol: 'FLU', name: 'Fluoxetine' },
  { symbol: 'BUP', name: 'Bupropion' },
  { symbol: 'VEN', name: 'Venlafaxine' },
  { symbol: 'DUL', name: 'Duloxetine' },
  { symbol: 'CIP', name: 'Ciprofloxacin' },
  { symbol: 'AZI', name: 'Azithromycin' },
  { symbol: 'DOX', name: 'Doxycycline' },
  { symbol: 'INS', name: 'Insulin' },
  { symbol: 'ALB', name: 'Albuterol' },
  { symbol: 'FLO', name: 'Fluticasone' },
  { symbol: 'CLP', name: 'Clopidogrel' },
  { symbol: 'ROS', name: 'Rosuvastatin' },
  { symbol: 'PRD', name: 'Prednisone' },
  { symbol: 'MEL', name: 'Melatonin' },
  { symbol: 'CYC', name: 'Cyclobenzaprine' },
  { symbol: 'API', name: 'Apixaban' },
  { symbol: 'EMP', name: 'Empagliflozin' }
];

function seedDelta(symbol: string, tick: number, i: number) {
  const base = (symbol.charCodeAt(0) % 5) + (tick % 7) * 0.12;
  const sign = (i + tick) % 3 === 0 ? -1 : 1;
  return Number((base * sign * 0.85).toFixed(1));
}

export function useTickerItems(tickMs = 4000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  return useMemo(
    () =>
      TICKER_MEDS.map((m, i) => {
        const delta = seedDelta(m.symbol, tick, i);
        return { ...m, delta, up: delta >= 0 };
      }),
    [tick]
  );
}

type TickerSpeed = 'slow' | 'medium' | 'fast';

type RowProps = {
  items: ReturnType<typeof useTickerItems>;
  dense?: boolean;
  reverse?: boolean;
  className?: string;
  variant?: 'default' | 'neon';
  speed?: TickerSpeed;
  delay?: string;
};

const SPEED_CLASS: Record<TickerSpeed, { fwd: string; rev: string }> = {
  slow: { fwd: 'mrx-ticker-track', rev: 'mrx-ticker-track-reverse' },
  medium: { fwd: 'mrx-ticker-medium', rev: 'mrx-ticker-medium-reverse' },
  fast: { fwd: 'mrx-ticker-fast', rev: 'mrx-ticker-fast-reverse' }
};

export function TickerRow({
  items,
  dense,
  reverse,
  className = '',
  variant = 'default',
  speed = 'slow',
  delay
}: RowProps) {
  const row = [...items, ...items, ...items, ...items, ...items];
  const neon = variant === 'neon';
  const trackClass = reverse ? SPEED_CLASS[speed].rev : SPEED_CLASS[speed].fwd;

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max gap-2 sm:gap-4 py-0.5 ${trackClass} ${dense ? 'mrx-ticker-compact' : ''}`}
        style={{ animationDelay: delay, animationPlayState: 'running' }}
      >
        {row.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className={`flex items-center gap-1.5 shrink-0 font-mono ${dense ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'} ${neon ? 'px-2 py-0.5 rounded-full bg-white/5 border border-white/10' : ''}`}
          >
            <span className={`font-black ${neon ? 'text-emerald-400' : 'text-clinical-400'}`}>{item.symbol}</span>
            <span className="text-white font-semibold whitespace-nowrap">{item.name}</span>
            <span className={`font-bold tabular-nums ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.up ? '▲' : '▼'} {Math.abs(item.delta).toFixed(1)}%
            </span>
            <span className={`${neon ? 'text-emerald-500/30' : 'text-slate-600'}`}>│</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-width stock-style ticker — single scrolling line at top */
const MedTicker: React.FC = () => {
  const { t } = useI18n();
  const items = useTickerItems(4500);

  return (
    <div
      className="w-full relative z-[70] border-y-2 border-emerald-400/40 bg-[#020617] shadow-[0_0_40px_rgba(16,185,129,0.2)]"
      role="marquee"
      aria-live="off"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-clinical-600/10 pointer-events-none" />
      <div className="flex items-stretch min-h-[48px] sm:min-h-[52px]">
        <div className="shrink-0 flex items-center gap-2 px-3 sm:px-5 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-r border-emerald-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] leading-none">
              {t('auth.tickerTitle')}
            </p>
            <p className="text-[8px] sm:text-[9px] opacity-90 mt-0.5 hidden sm:block max-w-[160px] leading-tight">
              {t('auth.tickerSub')}
            </p>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden flex items-center py-1.5">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#020617] via-[#020617]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#020617] via-[#020617]/90 to-transparent z-10 pointer-events-none" />
          <TickerRow items={items} variant="neon" speed="slow" />
        </div>
      </div>
    </div>
  );
};

export default MedTicker;
