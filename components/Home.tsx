
import React from 'react';
import { Medication, SymptomEntry, RiskColor } from '../types';
import { BORDER_COLOR_MAP } from '../constants';
import SectionHero from './SectionHero';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  analysisResult: any;
  isSyncing: boolean;
  onNavigateToReports?: () => void;
  stabilityIndex: number;
}

const Home: React.FC<Props> = ({ medications, checkins, analysisResult, isSyncing, onNavigateToReports, stabilityIndex }) => {
  if (checkins.length === 0 || medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 animate-slide-up text-center">
        <div className="relative mb-20">
          <div className="absolute inset-0 bg-clinical-500/30 blur-[140px] rounded-full animate-pulse"></div>
          <div className="relative w-64 h-64 bg-white dark:bg-slate-900 rounded-[5rem] shadow-3xl flex items-center justify-center border border-slate-200 dark:border-white/5">
             <span className="text-[10rem] animate-float">🧬</span>
          </div>
        </div>
        <h2 className="text-7xl font-black tracking-tighter uppercase italic mb-6">BioMath <span className="text-clinical-500">Core</span></h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.6em] text-[10px] max-w-sm leading-loose opacity-60">
          Pharmacological synchronization engine. Please initialize your medication inventory to begin analysis.
        </p>
      </div>
    );
  }

  const summary = analysisResult?.executive_summary?.summary_plain;
  const safetyFlags = analysisResult?.safety_flags || [];
  const smartAdvice = analysisResult?.executive_summary?.smart_advice || [];

  return (
    <div className="animate-slide-up pb-40">
      <SectionHero 
        title="Neural Snapshot" 
        subtitle="Real-Time Physiological Status" 
        icon="🧠" 
        color="#3b82f6" 
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6">
        
        {/* LEFT: Synthesis & Advice */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Safety Escalation */}
          {safetyFlags.length > 0 && (
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] ml-6 animate-pulse">Critical Alerts Detected</h3>
               {safetyFlags.map((flag: any, i: number) => (
                 <div key={i} className={`p-12 rounded-[4.5rem] border-4 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-top-4 ${BORDER_COLOR_MAP[flag.risk_color as RiskColor]}`}>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="text-8xl">🆘</div>
                      <div className="flex-1 space-y-4 text-center md:text-left">
                        <h4 className="text-3xl font-black text-rose-600 tracking-tighter uppercase italic">Bio-Link Intervention</h4>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100 italic leading-snug">"{flag.trigger_plain}"</p>
                        <div className="pt-6">
                          <span className="bg-rose-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest">Protocol: {flag.user_action_plain}</span>
                        </div>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* Main AI Synthesis Card */}
          <div className="bg-slate-950 rounded-[5rem] p-16 text-white relative overflow-hidden shadow-3xl group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-clinical-500/10 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-125"></div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 bg-clinical-500 rounded-full animate-ping"></div>
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Bio-Neural Synthesis</span>
              </div>
              <p className="text-5xl font-black tracking-tighter italic leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                "{summary || 'The MRX Core is mapping your recent biological variance. A personalized health baseline will appear shortly.'}"
              </p>
              <div className="flex gap-4 pt-6">
                 <button onClick={onNavigateToReports} className="bg-white text-slate-950 px-10 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95">
                   Synthesize Report ➔
                 </button>
              </div>
            </div>
          </div>

          {/* Smart Advice List */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6">Personalized Pattern Advice</h3>
            <div className="grid grid-cols-1 gap-6">
              {smartAdvice.map((advice: string, i: number) => (
                <div key={i} className="bg-white dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 flex items-center gap-8 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-clinical-500/10 rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">⚡</div>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 italic leading-snug">"{advice}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Stability Core & Metrics */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Stability Score Card */}
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-12">
            <div className="text-center space-y-6">
               <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Stability Core</h4>
               <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-white/5" />
                    <circle 
                      cx="96" cy="96" r="80" 
                      stroke="currentColor" strokeWidth="12" 
                      fill="transparent" 
                      className="text-clinical-500 transition-all duration-1000" 
                      strokeDasharray="502.6" 
                      strokeDashoffset={502.6 - (502.6 * stabilityIndex)} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black tracking-tighter italic text-slate-900 dark:text-white">{(stabilityIndex * 100).toFixed(0)}</span>
                    <span className="text-[9px] font-black text-clinical-500 uppercase tracking-widest mt-1">INDEX</span>
                  </div>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Physical Equilibrium Level</p>
            </div>
            
            <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Neural State</h5>
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl text-center">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  {stabilityIndex > 0.85 ? "Optimal neurological baseline. System variance remains within therapeutic boundaries." : 
                   stabilityIndex > 0.6 ? "Moderate biological flux detected. Monitor anxiety and palpitation trends." : 
                   "Significant instability observed. Prioritize clinical consultation immediately."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-clinical-600 text-white rounded-[4rem] text-center shadow-3xl shadow-clinical-500/30 group cursor-pointer hover:scale-[1.02] transition-all" onClick={onNavigateToReports}>
             <span className="text-6xl mb-6 block group-hover:rotate-12 transition-transform">📋</span>
             <h4 className="text-lg font-black uppercase tracking-[0.3em]">Export Clinical Data</h4>
             <p className="text-[11px] font-bold text-white/60 mt-3 uppercase tracking-widest italic">Serialize for your care team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
