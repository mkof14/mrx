
import React from 'react';

interface SectionHeroProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const SectionHero: React.FC<SectionHeroProps> = ({ title, subtitle, icon, color }) => {
  return (
    <div className="relative w-full h-[380px] -mt-10 mb-10 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Mesh Gradient Background */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-30 blur-[120px] transition-all duration-1000"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }}
      />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />

      <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div 
          className="w-28 h-28 mx-auto rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center text-7xl animate-float border border-white/10"
          style={{ boxShadow: `0 30px 60px -15px ${color}44` }}
        >
          {icon}
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            {title}
          </h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] ml-2">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
