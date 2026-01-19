
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  onComplete: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete, theme, toggleTheme }) => {
  const [step, setStep] = useState(0); 
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age_years: 30,
    sex_at_birth: 'MALE',
    weight_kg: null,
    height_cm: null,
    pregnancy_possible: false,
    preexisting_conditions: [],
    known_allergies: [],
    goals: [],
    onboarded: true
  });

  const finish = () => {
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500">
      {/* Bio-Tech Header */}
      <div className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-black text-2xl shadow-2xl">⬡</div>
          <span className="text-[11px] font-black tracking-[0.5em] text-slate-500 uppercase">MRX.HEALTH</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-14 h-14 rounded-3xl bg-white dark:bg-white/5 shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-105 active:scale-90 border border-slate-200 dark:border-white/10"
        >
          {theme === 'light' ? '🌘' : '☀️'}
        </button>
      </div>

      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-white/5 animate-in fade-in zoom-in-95 duration-1000">
        
        <div className="relative">
          {step === 0 && (
            <div className="relative text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {/* Full-Bleed Cinematic Hero Background */}
              <div className="absolute inset-0 bg-[#020617] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[180%] bg-gradient-to-b from-clinical-600/40 via-transparent to-slate-950"></div>
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-soft"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-clinical-500/20 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              </div>

              <div className="relative z-10 p-16 md:p-24 space-y-16">
                {/* Medication Cluster Illustration */}
                <div className="relative mx-auto w-56 h-56">
                  <div className="absolute inset-0 bg-clinical-500/50 blur-[100px] rounded-full animate-pulse"></div>
                  <div className="relative h-full w-full bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] animate-float border border-white/20 flex items-center justify-center">
                    <div className="relative">
                       <div className="text-[10rem] drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)]">💊</div>
                       <div className="absolute -top-10 -right-10 text-7xl drop-shadow-2xl animate-float" style={{ animationDelay: '1s' }}>🧪</div>
                       <div className="absolute -bottom-4 -left-12 text-6xl drop-shadow-2xl opacity-60">🧬</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85] italic">Listen to your<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-clinical-400 to-emerald-400">biology.</span></h1>
                  <p className="text-slate-400 font-bold leading-relaxed max-w-sm mx-auto text-[11px] uppercase tracking-[0.5em] mt-10">
                    Precision, human-grade insights about your daily health and treatment pathways.
                  </p>
                </div>
                
                <button 
                  onClick={() => setStep(1)}
                  className="w-full bg-white text-slate-950 py-10 rounded-[3rem] font-black text-sm uppercase tracking-[0.7em] shadow-[0_30px_60px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  Initiate Sync
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="p-16 md:p-20 animate-in fade-in slide-in-from-right-10 duration-700 space-y-16">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase leading-none italic">Bio-Profile.</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em]">Tailoring the MRX engine to your physiology</p>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.5em] ml-8">Your Name / Alias</label>
                  <input 
                    type="text" 
                    value={profile.name || ''} 
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-2xl font-black focus:border-clinical-500 outline-none transition-all dark:text-white shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.5em] ml-8">Biological Age</label>
                  <input 
                    type="number" 
                    value={profile.age_years || ''} 
                    onChange={e => setProfile({...profile, age_years: parseInt(e.target.value) || 0})}
                    placeholder="e.g. 28"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 text-4xl font-black focus:border-clinical-500 outline-none transition-all dark:text-white shadow-inner placeholder:text-slate-200 dark:placeholder:text-slate-800"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.5em] ml-8">Sex at Birth</label>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: 'Male', value: 'MALE' },
                      { label: 'Female', value: 'FEMALE' },
                      { label: 'Other', value: 'UNKNOWN' }
                    ].map(s => (
                      <button 
                        key={s.value}
                        onClick={() => setProfile({...profile, sex_at_birth: s.value as any})}
                        className={`py-8 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border-2 ${profile.sex_at_birth === s.value ? 'bg-clinical-600 border-clinical-600 text-white shadow-2xl shadow-clinical-600/30' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-12">
                <div className="p-10 bg-amber-500/5 border border-amber-500/10 rounded-[3rem] flex gap-8 items-center">
                  <span className="text-4xl">💡</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
                    This assistant visualizes trends. You can add detailed conditions and allergies in the Profile section later.
                  </p>
                </div>
                <button 
                  onClick={finish} 
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-10 rounded-[3rem] font-black text-sm uppercase tracking-[0.6em] shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  Confirm Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
