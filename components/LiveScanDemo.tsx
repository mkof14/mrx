import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { TICKER_MEDS } from './MedTicker';

const SCAN_COLORS = [
  'rgba(37, 99, 235, 0.95)',
  'rgba(16, 185, 129, 0.95)',
  'rgba(139, 92, 246, 0.95)',
  'rgba(245, 158, 11, 0.95)',
  'rgba(236, 72, 153, 0.95)'
];

const PILL_GRADIENTS = [
  'from-blue-500/60 to-violet-600/50',
  'from-emerald-500/60 to-teal-600/50',
  'from-violet-500/60 to-fuchsia-600/50',
  'from-amber-500/60 to-orange-600/50',
  'from-rose-500/60 to-pink-600/50',
  'from-cyan-500/60 to-clinical-600/50'
];

const TILE_THEMES = [
  'from-emerald-500/20 to-emerald-600/5 border-emerald-400/40 text-emerald-300',
  'from-clinical-500/20 to-clinical-600/5 border-clinical-400/40 text-clinical-300',
  'from-violet-500/20 to-violet-600/5 border-violet-400/40 text-violet-300',
  'from-amber-500/20 to-amber-600/5 border-amber-400/40 text-amber-300'
];

const SCAN_HINTS = ['auth.scanHint1', 'auth.scanHint2', 'auth.scanHint3'] as const;

const LiveScanDemo: React.FC = () => {
  const { t } = useI18n();
  const [nameIdx, setNameIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [pillIdx, setPillIdx] = useState(0);
  const [tileTheme, setTileTheme] = useState(0);
  const [hintIdx, setHintIdx] = useState(0);
  const [progress, setProgress] = useState(35);

  const activeName = TICKER_MEDS[nameIdx]?.name ?? 'Sertraline';
  const activeSymbol = TICKER_MEDS[nameIdx]?.symbol ?? 'SER';
  const scanColor = SCAN_COLORS[colorIdx] ?? SCAN_COLORS[0];

  useEffect(() => {
    const id = setInterval(() => {
      setNameIdx((i) => (i + 1) % TICKER_MEDS.length);
      setColorIdx((c) => (c + 1) % SCAN_COLORS.length);
      setPillIdx((p) => (p + 1) % PILL_GRADIENTS.length);
      setTileTheme((th) => (th + 1) % TILE_THEMES.length);
      setHintIdx((h) => (h + 1) % SCAN_HINTS.length);
      setProgress(25 + Math.random() * 70);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative rounded-2xl border border-white/15 overflow-hidden shadow-[0_16px_48px_rgba(37,99,235,0.22)]">
      <div className="absolute inset-0 mrx-demo-bg-shift" />
      <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />

      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          <div
            className="absolute inset-x-0 h-[2px] mrx-demo-scanner-line"
            style={{
              backgroundColor: scanColor,
              boxShadow: `0 0 24px ${scanColor}, 0 0 48px ${scanColor}`
            }}
          />
          <div className="absolute top-[28%] left-0 w-full h-px bg-gradient-to-r from-transparent via-clinical-400 to-transparent animate-running-track" />
          <div className="absolute top-[58%] left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-running-track [animation-delay:0.5s]" />
          <div className="absolute top-[82%] left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-running-track [animation-delay:1s]" />
        </div>

        <div className="relative z-10 p-4 space-y-2.5">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm mrx-tile-glow">
            <div
              className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-xl shadow-lg transition-all duration-[3200ms] ease-in-out bg-gradient-to-br ${PILL_GRADIENTS[pillIdx]}`}
            >
              💊
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-bold text-clinical-300 uppercase tracking-widest truncate">
                  {t('auth.scanBio')}:{' '}
                  <span key={activeName} className="text-white animate-fact-in inline-block">
                    {activeName}
                  </span>
                </span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase shrink-0 animate-pulse">
                  ● {t('auth.scanLive')}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden ring-1 ring-white/5">
                <div
                  className="h-full rounded-full mrx-progress-bar transition-all duration-[2800ms] ease-in-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
              <p key={hintIdx} className="text-[8px] text-slate-300 animate-fact-in truncate leading-tight">
                {t(SCAN_HINTS[hintIdx])}
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl mrx-tile-glow">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t('auth.molecularId')}</span>
              <span className="text-[9px] font-mono font-black text-emerald-400">{activeSymbol}</span>
            </div>
            <p key={activeName} className="text-lg font-black text-white mt-0.5 animate-fact-in tracking-tight leading-tight">
              {activeName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-0.5">
            <button
              type="button"
              className={`px-2 py-1.5 rounded-lg border bg-gradient-to-br text-center transition-all duration-[2800ms] mrx-tile-glow hover:scale-[1.02] active:scale-[0.98] ${TILE_THEMES[tileTheme]}`}
            >
              <span className="text-[7px] font-bold uppercase opacity-75 block leading-none">{t('auth.stability')}</span>
              <p className="text-[10px] font-black text-white mt-0.5 leading-tight">{t('auth.stabilityOptimal')}</p>
            </button>
            <button
              type="button"
              className={`px-2 py-1.5 rounded-lg border bg-gradient-to-br text-center transition-all duration-[2800ms] mrx-tile-glow hover:scale-[1.02] active:scale-[0.98] ${TILE_THEMES[(tileTheme + 1) % TILE_THEMES.length]}`}
            >
              <span className="text-[7px] font-bold uppercase opacity-75 block leading-none">{t('nav.interactions')}</span>
              <p className="text-[10px] font-black text-white mt-0.5 leading-tight">{t('auth.interactionsChecked')}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScanDemo;
