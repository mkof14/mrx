
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  onComplete: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AccountSetup: React.FC<Props> = ({ onComplete, theme, toggleTheme }) => {
  const [step, setStep] = useState(1); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [profile, setProfile] = useState<UserProfile>({
    id: Math.random().toString(36).substr(2, 9),
    email: '',
    name: '',
    age_years: 30,
    sex_at_birth: 'MALE',
    weight_kg: null,
    height_cm: null,
    preferred_units: 'METRIC',
    preferred_voice: 'Zephyr',
    speech_speed: 1.0,
    pregnancy_possible: false,
    preexisting_conditions: [],
    known_allergies: [],
    goals: [],
    onboarded: true,
    is_subscribed: false
  });

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setProfile(p => ({ ...p, is_subscribed: true }));
      setIsProcessing(false);
      handleNext();
    }, 1500);
  };

  const finish = () => {
    onComplete(profile);
  };

  const price = billingCycle === 'monthly' ? 4.99 : 49.90;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500 relative overflow-hidden">
      
      {/* Bio-Tech Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-black text-2xl shadow-2xl transition-transform hover:rotate-12">M</div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black tracking-[0.5em] text-slate-500 uppercase leading-none">Setup Protocol</span>
            <span className="text-[6px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mt-1">Medication Reactions eXplorer</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-1">
             {[1, 2, 3].map(i => (
               <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
             ))}
          </div>
          <button onClick={toggleTheme} className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-2xl flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-90 border border-slate-200 dark:border-white/10">{theme === 'light' ? '🌘' : '☀️'}</button>
        </div>
      </div>

      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden shadow-3xl border border-slate-200 dark:border-white/5 relative z-10">
        
        {step === 1 && (
          /* STEP 1: SUBSCRIPTION (Merged) */
          <div className="p-12 md:p-16 animate-in fade-in slide-in-from-right-10 duration-700 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Phase 01: Authorization</span>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                Unlock <br/> <span className="text-blue-600">Full Analysis.</span>
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-8 space-y-8 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-center gap-6">
                <span className={`text-[11px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-slate-400'}`}>Monthly</span>
                <button 
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-all flex items-center"
                >
                  <div className={`w-5 h-5 bg-blue-600 rounded-full shadow-lg transition-transform transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </button>
                <span className={`text-[11px] font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-slate-400'}`}>Yearly <span className="text-emerald-500 ml-2">-15%</span></span>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">${price}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Free 7-Day Trial Included</p>
              </div>

              <ul className="grid grid-cols-2 gap-4">
                {['Unlimited Analysis', 'AI Side Effect Matrix', 'Doctor Reports', '24/7 AI Companion'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    <span className="w-5 h-5 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-[10px]">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={handleSubscribe} 
              disabled={isProcessing}
              className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              {isProcessing ? 'Initializing...' : 'Start 7-Day Free Trial'}
            </button>
          </div>
        )}

        {step === 2 && (
          /* STEP 2: BIO PROFILE (Merged) */
          <div className="p-12 md:p-16 animate-in fade-in slide-in-from-right-10 duration-700 space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Phase 02: Biological Baseline</span>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Tell us <span className="text-blue-600">about you.</span></h2>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-4">Full Name / Alias</label>
                <input 
                  type="text" 
                  value={profile.name || ''} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-xl font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all dark:text-white"
                  placeholder="e.g. Alex"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-4">Age</label>
                  <input 
                    type="number" 
                    value={profile.age_years || ''} 
                    onChange={e => setProfile({...profile, age_years: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-xl font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-4">Units</label>
                  <div className="flex bg-slate-50 dark:bg-white/5 rounded-2xl p-1 border border-slate-200 dark:border-white/10">
                    <button 
                      onClick={() => setProfile({...profile, preferred_units: 'METRIC'})}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.preferred_units === 'METRIC' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-400'}`}
                    >
                      Metric
                    </button>
                    <button 
                      onClick={() => setProfile({...profile, preferred_units: 'IMPERIAL'})}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.preferred_units === 'IMPERIAL' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-400'}`}
                    >
                      US
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continue Protocol
            </button>
          </div>
        )}

        {step === 3 && (
          /* STEP 3: FINAL CONFIRMATION (Merged) */
          <div className="p-16 md:p-20 animate-in fade-in slide-in-from-right-10 duration-700 text-center space-y-12">
            <div className="relative mx-auto w-32 h-32">
               <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse"></div>
               <div className="relative w-full h-full bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white text-6xl shadow-2xl">✔</div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Sync Ready.</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto italic">
                Your Bio-Profile and Trial are activated. Dr. BioMath is ready to analyze your pharmacological data.
              </p>
            </div>

            <button 
              onClick={finish} 
              className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Enter Dashboard
            </button>
          </div>
        )}

      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-12 space-y-8 animate-in fade-in duration-300">
           <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-center space-y-2">
             <h3 className="text-2xl font-black uppercase tracking-tighter">Connecting Neural Core</h3>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse italic">Securing Clinical Environment...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AccountSetup;
