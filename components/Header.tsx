import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSyncing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ profile, theme, toggleTheme, isSyncing }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-100/80 dark:bg-[#0a192f]/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/5 h-20 md:h-24 flex items-center justify-between px-6 md:px-12 shrink-0 transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="relative w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 font-black text-2xl shadow-2xl transition-transform hover:rotate-3 active:scale-95 cursor-pointer">⬡</div>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
              MRX<span className="text-[#48c9b0]">.</span>HEALTH
            </h1>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] leading-none mb-1">
              Medication Reactions eXplorer
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-clinical-500 animate-spin' : 'bg-[#48c9b0] animate-pulse'}`}></div>
              <span className="text-[8px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em]">
                {isSyncing ? 'Updating Data...' : 'Monitoring Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8">
        {/* Modern Neural Theme Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 hidden xs:block">Neural Mode</span>
          <button 
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="group relative w-16 h-8 rounded-full bg-slate-200 dark:bg-white/10 p-1 transition-all duration-500 hover:scale-105 active:scale-95 border border-slate-300 dark:border-white/10"
          >
            <div className={`
              absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out
              ${theme === 'dark' ? 'translate-x-8 bg-clinical-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'translate-x-0 bg-white shadow-md'}
            `}>
              <span className="text-xs">{theme === 'dark' ? '🌘' : '☀️'}</span>
            </div>
            <div className="w-full h-full flex justify-between items-center px-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="text-[8px]">☀️</span>
              <span className="text-[8px]">🌘</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-5 pl-4 border-l border-slate-300 dark:border-white/5">
          <div className="text-right hidden md:block">
            <div className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
               Profile
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">{profile.age_years || '0'} Years Old</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;