
import React from 'react';
import { UserProfile, AIVoice } from '../types';
import SectionHero from './SectionHero';

interface SettingsProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  clearAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, setProfile, theme, toggleTheme, clearAllData }) => {
  const voices: AIVoice[] = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const handleVercelDeploy = () => {
    const repoUrl = window.location.origin; // Simplified for demo
    window.open(`https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}&env=API_KEY&project-name=mrx-health-instance&repository-name=mrx-health`, '_blank');
  };

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero 
        title="Settings" 
        subtitle="Neural Core Calibration" 
        icon="⚙️" 
        color="#64748b" 
      />

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Appearance</h3>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Dark Mode</span>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Toggle clinical interface depth</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="relative w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-all duration-300"
            >
              <div className={`w-5 h-5 bg-clinical-500 rounded-full shadow-lg transition-transform duration-300 transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        {/* AI Voice Calibration */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">AI Voice Core</h3>
          <div className="space-y-4">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Preferred Consultant</label>
             <select 
               value={profile.preferred_voice} 
               onChange={(e) => setProfile({ ...profile, preferred_voice: e.target.value as AIVoice })}
               className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 font-bold text-sm outline-none dark:text-white"
             >
               {voices.map(v => <option key={v} value={v}>{v}</option>)}
             </select>
          </div>
          <div className="space-y-4">
             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Speaking Velocity</label>
             <div className="grid grid-cols-3 gap-2">
                {speeds.map(s => (
                  <button 
                    key={s}
                    onClick={() => setProfile({ ...profile, speech_speed: s })}
                    className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${profile.speech_speed === s ? 'bg-clinical-600 border-clinical-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
                  >
                    {s}x
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Vercel Deployment Hub */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Deployment Hub</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed italic">
                Ready to take MRX.Health private? Deploy your own instance to Vercel in seconds. Ensure you have your Google AI API Key ready for the environment variables.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-400 border border-slate-200 dark:border-white/10">SPA Ready</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-400 border border-slate-200 dark:border-white/10">Edge Optimized</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-400 border border-slate-200 dark:border-white/10">Env: API_KEY</span>
              </div>
            </div>
            <button 
              onClick={handleVercelDeploy}
              className="bg-black dark:bg-white text-white dark:text-black px-10 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/>
              </svg>
              Deploy to Vercel
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Privacy & Local Cache</h3>
          <button onClick={() => confirm("Erase all biological data from local storage?") && clearAllData()} className="w-full py-5 rounded-2xl bg-rose-500/10 text-rose-600 font-black text-[9px] uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Clear All Local Data</button>
        </div>

        <div className="bg-slate-900 p-12 rounded-[4rem] text-white border border-white/5 shadow-2xl">
           <h4 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Enterprise Sync</h4>
           <p className="text-xs font-bold text-slate-500 italic uppercase tracking-widest">Coming soon: BioMath Portal access for verified clinicians and hospital networks.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
