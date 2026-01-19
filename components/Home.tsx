import React from 'react';
import { Medication, SymptomEntry, RiskColor } from '../types';
import { BORDER_COLOR_MAP } from '../constants';
import SectionHero from './SectionHero';
import Footer from './Footer';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  analysisResult: any;
  isSyncing: boolean;
  onNavigateToReports?: () => void;
  stabilityIndex: number;
  onNavigate?: (tab: string) => void;
}

const Home: React.FC<Props> = ({ medications, checkins, analysisResult, isSyncing, onNavigateToReports, stabilityIndex, onNavigate }) => {
  
  // EMPTY STATE: Displayed when no data exists
  if (checkins.length === 0 || medications.length === 0) {
    return (
      <div className="flex flex-col min-h-screen animate-in fade-in duration-1000">
        <SectionHero 
          title="Dashboard" 
          subtitle="Precision Health Tracking" 
          icon="🏠" 
          color="#3b82f6" 
        />
        
        <div className="max-w-6xl mx-auto px-6 space-y-16 flex-1">
          {/* Welcome Card */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-[4rem] p-10 md:p-16 shadow-3xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4 text-center lg:text-left">
                  <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                    Welcome to <br/>
                    <span className="text-blue-600">MRX.Health</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-bold italic leading-relaxed">
                    Ready to track your health? Start by adding the pills you take daily, then tell us how you're feeling.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={() => onNavigate && onNavigate('meds')}
                    className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
                  >
                    Add My Pills
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('checkin')}
                    className="bg-white dark:bg-white/5 text-slate-700 dark:text-white border-2 border-slate-200 dark:border-white/10 px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Check In
                  </button>
                </div>
              </div>

              {/* SEARCH ANIMATION CARD */}
              <div className="relative bg-slate-950 rounded-[3rem] p-10 border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-1000 delay-300 min-h-[300px] flex items-center justify-center">
                <div className="absolute inset-x-0 h-1 bg-blue-400/50 top-0 animate-scanner"></div>
                
                <div className="space-y-8 relative w-full">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-3xl animate-pulse">💊</div>
                    <div className="space-y-2 flex-1">
                      <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden relative">
                         <div className="absolute inset-0 bg-blue-500 animate-shimmer"></div>
                      </div>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block">Waiting for Input...</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 opacity-20">
                    <div className="h-2 bg-white/10 rounded-full w-full"></div>
                    <div className="h-2 bg-white/10 rounded-full w-5/6"></div>
                    <div className="h-2 bg-white/10 rounded-full w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrower, Smaller, Livelier Info Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
            {[
              { icon: '💊', label: 'Pill List', desc: 'Manage medicine.', color: 'hover:border-purple-500/30' },
              { icon: '📈', label: 'Progress', desc: 'Track trends.', color: 'hover:border-cyan-500/30' },
              { icon: '💬', label: 'Ask AI', desc: 'Get answers.', color: 'hover:border-blue-500/30' },
              { icon: '📄', label: 'Reports', desc: 'Doctor ready.', color: 'hover:border-rose-500/30' }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 text-center space-y-3 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer ${card.color}`}
                onClick={() => {
                   if (card.label === 'Pill List') onNavigate?.('meds');
                   if (card.label === 'Progress') onNavigate?.('timeline');
                   if (card.label === 'Ask AI') onNavigate?.('assistant');
                   if (card.label === 'Reports') onNavigate?.('reports');
                }}
              >
                <div className="text-4xl mb-2 group-hover:rotate-12 transition-transform duration-500">{card.icon}</div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">{card.label}</h4>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE STATE: Displayed when data is present
  const summary = analysisResult?.executive_summary?.summary_plain;
  const safetyFlags = analysisResult?.safety_flags || [];
  const smartAdvice = analysisResult?.executive_summary?.smart_advice || [];

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-1000">
      <SectionHero 
        title="Dashboard" 
        subtitle="Live Health Intelligence" 
        icon="✨" 
        color="#10b981" 
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 pb-20">
        
        <div className="lg:col-span-8 space-y-8">
          {/* Daily Status Card */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-200 dark:border-white/5 shadow-3xl relative overflow-hidden animate-in slide-in-from-left-8 duration-1000">
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none italic font-black text-9xl uppercase">News</div>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Summary</span>
              </div>
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic">
                "{summary || "Everything is looking good! We are watching your pills to keep you safe."}"
              </p>
            </div>
          </div>

          {/* Alerts */}
          {safetyFlags.length > 0 && (
            <div className="space-y-4">
               <h3 className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-6">Urgent Alerts</h3>
               {safetyFlags.map((flag: any, i: number) => (
                 <div key={i} className={`p-8 rounded-[2.5rem] border-2 bg-white dark:bg-slate-900 shadow-xl flex items-center gap-8 ${BORDER_COLOR_MAP[flag.risk_color as RiskColor]}`}>
                    <div className="text-6xl animate-bounce">⚠️</div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-xl font-black text-rose-600 uppercase tracking-tighter italic leading-none">Safety Flag</h4>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-snug">"{flag.trigger_plain}"</p>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* Quick Tips */}
          <div className="space-y-4">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-6">Smart Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartAdvice.map((advice: string, i: number) => (
                <div key={i} className="bg-slate-200/40 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-300/40 dark:border-white/10 flex items-start gap-4 transition-all hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-xl group">
                  <div className="text-3xl group-hover:rotate-12 transition-transform duration-500">💡</div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{advice}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Score Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-3xl text-center space-y-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stability Index</h4>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-white/5" />
                  <circle 
                    cx="96" cy="96" r="80" 
                    stroke="currentColor" strokeWidth="12" 
                    fill="transparent" 
                    className="text-emerald-500 transition-all duration-1000 ease-out" 
                    strokeDasharray="502.6" 
                    strokeDashoffset={502.6 - (502.6 * stabilityIndex)} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{(stabilityIndex * 100).toFixed(0)}%</span>
                </div>
            </div>
            <p className="text-xs font-bold text-slate-600 italic leading-relaxed px-4">
              {stabilityIndex > 0.8 ? "Physiology is stable. Continue current protocol." : 
               stabilityIndex > 0.5 ? "Minor fluctuations. Observe and log data." : 
               "Alert: Significant variance detected."}
            </p>
          </div>

          <button 
            onClick={onNavigateToReports}
            className="w-full p-8 bg-blue-600 text-white rounded-[3rem] text-center shadow-[0_30px_60px_-15px_rgba(59,130,246,0.5)] group hover:scale-[1.03] active:scale-95 transition-all"
          >
             <div className="text-6xl mb-4 group-hover:rotate-6 transition-transform duration-500">📋</div>
             <h4 className="text-xl font-black uppercase tracking-tighter italic leading-none">Clinical Report</h4>
             <p className="text-[8px] font-black text-blue-100 mt-2 opacity-50 uppercase tracking-widest">Share with your physician</p>
          </button>
        </div>
      </div>
      
      <Footer onOpenLegal={() => onNavigate?.('legal')} />
    </div>
  );
};

export default Home;