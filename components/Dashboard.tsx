
import React, { useState } from 'react';
import { Medication, SymptomEntry, RiskColor } from '../types';
import { COLOR_MAP, TEXT_COLOR_MAP, BORDER_COLOR_MAP } from '../constants';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  analysisResult: any;
  isSyncing: boolean;
  onNavigateToReports?: () => void;
}

const Dashboard: React.FC<Props> = ({ medications, checkins, analysisResult, isSyncing, onNavigateToReports }) => {
  const [showDetail, setShowDetail] = useState<any>(null);

  if (checkins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-slide-up">
        <div className="w-56 h-56 bg-white dark:bg-white/5 rounded-[4rem] flex items-center justify-center text-9xl mb-12 shadow-2xl animate-float">📝</div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-6 italic">Neural Void</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.6em] text-[9px] text-center max-w-sm leading-relaxed opacity-60">
          The observation engine requires a physiological baseline. Please initialize your first check-in.
        </p>
      </div>
    );
  }

  const concerns = analysisResult?.executive_summary?.top_concerns || [];
  const safety = analysisResult?.safety_flags || [];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-slide-up pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 bg-[#48c9b0] rounded-full animate-ping"></div>
             <span className="text-[10px] font-black text-[#48c9b0] uppercase tracking-[0.5em]">System Live</span>
          </div>
          <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Status<br/><span className="text-clinical-500">Snapshot</span></h2>
        </div>
        
        {isSyncing && (
          <div className="flex items-center gap-4 bg-clinical-500/10 px-8 py-4 rounded-full border border-clinical-500/20">
             <div className="w-5 h-5 border-2 border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-[10px] font-black text-clinical-600 uppercase tracking-widest">Decoding Pathways</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Urgent Alerts */}
        {safety.length > 0 && (
          <div className="lg:col-span-12 space-y-8">
            {safety.map((flag: any, i: number) => (
              <div key={i} className={`p-12 rounded-[4rem] border-4 ${BORDER_COLOR_MAP[flag.risk_color as RiskColor]} bg-white dark:bg-[#0a192f] shadow-[0_50px_100px_-20px_rgba(239,68,68,0.3)] animate-pulse-soft`}>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="text-8xl">🆘</div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h3 className="text-4xl font-black text-red-600 tracking-tighter uppercase">Clinical Escalation</h3>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100 italic leading-tight">"{flag.trigger_plain}"</p>
                    <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                      <div className="bg-red-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">Action: {flag.user_action_plain}</div>
                      <button onClick={() => setShowDetail({ title: "Clinical Root", text: flag.trigger_plain })} className="px-10 py-5 rounded-[2rem] bg-slate-100 dark:bg-white/5 font-black text-xs uppercase tracking-widest text-slate-500">Diagnostics</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staggered Concerns */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {concerns.length > 0 ? concerns.map((item: any, i: number) => (
            <div 
              key={i} 
              className={`glass-card p-10 rounded-[3.5rem] space-y-8 group hover:scale-[1.02] transition-all duration-500 border-b-8 ${i % 2 === 0 ? 'md:mt-12' : ''} ${BORDER_COLOR_MAP[item.risk_color as RiskColor]}`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${COLOR_MAP[item.risk_color as RiskColor]}`}>
                  {item.risk_color === 'RED' ? '⚠️' : '🔍'}
                </div>
                <div className="text-right">
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.evidence_level}</div>
                   <div className="text-sm font-black text-clinical-600">{item.confidence}% Match</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-clinical-600 transition-colors">{item.title}</h4>
                <p className="text-base font-bold text-slate-500 leading-relaxed italic">"{item.why_plain}"</p>
              </div>

              <button 
                onClick={() => setShowDetail({ title: item.title, text: item.why_plain })}
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-clinical-600 hover:text-white transition-all"
              >
                Inspect Pattern
              </button>
            </div>
          )) : !isSyncing && (
            <div className="col-span-2 glass-card p-24 rounded-[4rem] text-center space-y-8 animate-pulse-soft border-emerald-500/20">
               <span className="text-9xl mb-4 block">🧬</span>
               <h3 className="text-4xl font-black text-emerald-600 tracking-tighter uppercase">Equilibrium Detected</h3>
               <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">Your symptom variance is perfectly aligned with therapeutic targets. No anomalies observed.</p>
            </div>
          )}

          {/* New Prominent Report Card */}
          <div className="col-span-full md:col-span-2 mt-8">
            <div className="bg-clinical-600 p-12 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform" onClick={onNavigateToReports}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4 text-center md:text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Final Protocol Step</span>
                  <h3 className="text-5xl font-black tracking-tighter uppercase leading-none">Export Clinical Report</h3>
                  <p className="text-sm font-bold text-white/70 max-w-sm italic">Generate a professional document for your doctor including Copy, PDF, and Share functions.</p>
                </div>
                <div className="w-24 h-24 bg-white text-clinical-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl group-hover:rotate-12 transition-transform">
                  📋
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 p-12 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-clinical-500/10 rounded-full blur-[60px] group-hover:bg-clinical-500/30 transition-all duration-1000"></div>
            <div className="relative z-10 space-y-6">
               <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Active Molecules</h5>
               <div className="space-y-4">
                 {medications.slice(0, 3).map(m => (
                   <div key={m.id} className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-clinical-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                     <span className="text-sm font-black uppercase tracking-tight">{m.display_name}</span>
                   </div>
                 ))}
                 {medications.length > 3 && <p className="text-[9px] font-bold text-white/30 uppercase pl-6">+ {medications.length - 3} more tracked</p>}
               </div>
               <div className="pt-8 border-t border-white/5">
                  <div className="text-4xl font-black tracking-tighter">0.98</div>
                  <p className="text-[9px] font-black text-clinical-500 uppercase tracking-widest">Stability Index</p>
               </div>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[3.5rem] border-dashed border-2 border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-6 text-center group cursor-pointer hover:border-clinical-600 transition-all" onClick={onNavigateToReports}>
             <div className="text-5xl group-hover:scale-125 transition-transform duration-500">🏥</div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generate Report for<br/>your care team</p>
          </div>
        </div>
      </div>

      {/* Exploration Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-[#0a192f] max-w-2xl w-full rounded-[5rem] shadow-2xl overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-950 p-14 text-white relative">
               <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-clinical-500 uppercase tracking-[0.5em]">Deep Diagnostic</span>
                    <h4 className="text-5xl font-black tracking-tighter uppercase leading-none">{showDetail.title}</h4>
                  </div>
                  <button onClick={() => setShowDetail(null)} className="w-16 h-16 rounded-[2rem] hover:bg-white/10 text-white flex items-center justify-center text-6xl font-light transition-all">×</button>
               </div>
            </div>
            <div className="p-16 space-y-12">
              <p className="text-3xl text-slate-800 dark:text-slate-100 font-bold leading-tight italic">"{showDetail.text}"</p>
              
              <div className="space-y-6">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Suggested Context</h5>
                <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-slate-100 dark:border-white/10">
                   <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    This observation is based on a significant delta in your reported symptom scores following a recent dosage event. It suggests a temporary physiological recalibration.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowDetail(null)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-10 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-2xl"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
