
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

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Privacy</h3>
          <button onClick={() => confirm("Erase all biological data?") && clearAllData()} className="w-full py-5 rounded-2xl bg-rose-500/10 text-rose-600 font-black text-[9px] uppercase tracking-widest border border-rose-500/20">Clear Local Cache</button>
        </div>

        <div className="md:col-span-2 bg-slate-900 p-12 rounded-[4rem] text-white border border-white/5 shadow-2xl">
           <h4 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Enterprise Sync</h4>
           <p className="text-xs font-bold text-slate-500 italic uppercase tracking-widest">Coming soon: BioMath Portal access for verified clinicians.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
