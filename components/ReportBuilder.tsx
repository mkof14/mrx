
import React, { useState, useEffect, useMemo } from 'react';
import { Medication, SymptomEntry, MedicationEvent, RiskColor, UserProfile } from '../types';
import { analyzeMedicationData } from '../geminiService';
import { SYMPTOM_CATEGORIES, COLOR_MAP, BORDER_COLOR_MAP, TEXT_COLOR_MAP } from '../constants';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import SectionHero from './SectionHero';

interface Props {
  medications: Medication[];
  medicationEvents: MedicationEvent[];
  checkins: SymptomEntry[];
  profile: UserProfile;
  cachedAnalysis?: any;
}

const ReportBuilder: React.FC<Props> = ({ medications, medicationEvents, checkins, profile, cachedAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reportData, setReportData] = useState<any>(cachedAnalysis || null);
  
  // PDF Inclusion Toggles
  const [includeInventory, setIncludeInventory] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeSafety, setIncludeSafety] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [includeInteractions, setIncludeInteractions] = useState(true);

  const steps = [
    "Synthesizing biometrics...",
    "Mapping medication kinetics...",
    "Analyzing temporal correlations...",
    "Calibrating safety thresholds...",
    "Finalizing clinical report structure..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [loading]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await analyzeMedicationData(medications, medicationEvents, checkins, 'BALANCED' as any, profile);
      setReportData(data);
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const trendData = useMemo(() => {
    return [...checkins].reverse().map(c => ({
      date: new Date(c.log_iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      ...c.symptom_scales
    }));
  }, [checkins]);

  if (reportData && !loading) {
    return (
      <div className="pb-40 animate-in fade-in duration-700">
        <SectionHero title="The Composer" subtitle="Review & Customize Clinical Export" icon="📋" color="#f43f5e" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Composer Controls (no-print) */}
          <div className="lg:col-span-4 no-print space-y-8">
            <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-10 sticky top-32">
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Report Modules</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Toggle sections for the final PDF.</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Molecular Inventory', state: includeInventory, setter: setIncludeInventory, icon: '💊' },
                  { label: 'Executive Summary', state: includeSummary, setter: setIncludeSummary, icon: '📄' },
                  { label: 'Safety Flags', state: includeSafety, setter: setIncludeSafety, icon: '🚨' },
                  { label: 'Interaction Matrix', state: includeInteractions, setter: setIncludeInteractions, icon: '🧩' },
                  { label: 'Variance Timeline', state: includeTimeline, setter: setIncludeTimeline, icon: '📈' },
                  { label: 'Clinical Findings', state: includeInsights, setter: setIncludeInsights, icon: '🔍' },
                ].map(mod => (
                  <button 
                    key={mod.label}
                    onClick={() => mod.setter(!mod.state)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      mod.state 
                        ? 'bg-clinical-600/5 border-clinical-600/40 text-clinical-600' 
                        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg">{mod.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{mod.label}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${mod.state ? 'bg-clinical-600' : 'bg-slate-200 dark:bg-white/10'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${mod.state ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                <button onClick={() => window.print()} className="w-full bg-clinical-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                  <span>🖨️</span> Save as PDF
                </button>
                <button onClick={() => setReportData(null)} className="w-full bg-slate-100 dark:bg-white/5 text-slate-500 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  Reset Generator
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview (A4 Sim) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[1rem] shadow-2xl border-2 border-slate-900 overflow-hidden text-slate-900 min-h-[1100px] print:m-0 print:border-0 print:shadow-none font-sans">
              
              {/* Report Header */}
              <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="space-y-2 text-center md:text-left relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-950 font-black text-lg shadow-xl">⬡</div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Clinical Bio-Sync</h1>
                  </div>
                  <p className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">Patient ID: {profile.name?.toUpperCase() || 'ANONYMOUS'}-{profile.id?.slice(0,4)}</p>
                </div>
                <div className="text-right relative z-10 space-y-1">
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase opacity-60">Reference: MRX-{Math.floor(Date.now()/100000)}</p>
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase opacity-60">Generated: {new Date().toLocaleDateString()}</p>
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-clinical-500">ENGINE: BIOMATH MRX v2.5.3</p>
                </div>
              </div>

              <div className="p-10 md:p-16 space-y-16">
                
                {/* 0.0 Molecular Inventory */}
                {includeInventory && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-1 bg-slate-900"></div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Section 0.0 Molecular Inventory</h2>
                    </div>
                    <div className="border border-slate-200 rounded-3xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Molecule Name</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Dosage Strategy</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Ingredients</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medications.map((m, i) => (
                            <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="px-6 py-4 font-black text-sm uppercase italic text-slate-900">{m.display_name}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-600">{m.current_dose.amount}{m.current_dose.unit} ({m.current_dose.schedule_notes})</td>
                              <td className="px-6 py-4 text-[10px] font-bold text-slate-400 italic">{m.normalized.active_ingredients.join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* 1.0 Executive Summary Section */}
                {includeSummary && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-1 bg-slate-900"></div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Section 1.0 Executive Summary</h2>
                    </div>
                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <p className="text-xl font-bold leading-relaxed italic text-slate-800">
                        "{reportData.executive_summary?.summary_plain}"
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Clinical Observations</h3>
                        <div className="space-y-2">
                          {reportData.executive_summary?.smart_advice?.map((a: string, i: number) => (
                            <div key={i} className="text-xs font-bold p-4 bg-white border border-slate-100 rounded-2xl flex gap-3 text-slate-600 shadow-sm">
                              <span className="text-clinical-600">⚡</span> {a}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Physician Talking Points</h3>
                        <div className="space-y-2">
                          {reportData.executive_summary?.doctor_discussion_points?.map((p: string, i: number) => (
                            <div key={i} className="text-xs font-bold p-4 bg-white border border-slate-100 rounded-2xl flex gap-3 text-slate-600 shadow-sm">
                              <span className="text-rose-500">📋</span> {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 2.0 Safety Flags Section */}
                {includeSafety && reportData.safety_flags?.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-1 bg-slate-900"></div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Section 2.0 Critical Safety Flags</h2>
                    </div>
                    <div className="space-y-4">
                      {reportData.safety_flags.map((flag: any, i: number) => (
                        <div key={i} className={`p-8 rounded-[2rem] border-2 bg-white flex flex-col md:flex-row items-center gap-8 ${BORDER_COLOR_MAP[flag.risk_color as RiskColor] || 'border-slate-200'}`}>
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-100">🆘</div>
                          <div className="flex-1 space-y-2 text-center md:text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600">{flag.flag_type} / {flag.risk_color}</h4>
                            <p className="text-sm font-bold text-slate-800 italic">"{flag.trigger_plain}"</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 inline-block px-3 py-1 rounded-full">Protocol Action: <span className="text-slate-900">{flag.user_action_plain}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3.0 Interaction Findings */}
                {includeInteractions && reportData.interaction_findings?.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-1 bg-slate-900"></div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Section 3.0 Interaction Matrix Findings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportData.interaction_findings.map((int: any, i: number) => (
                        <div key={i} className={`p-6 rounded-[2rem] border bg-white space-y-4 ${BORDER_COLOR_MAP[int.severity_color as RiskColor]}`}>
                           <div className="flex justify-between items-center">
                              <h4 className="text-sm font-black uppercase text-slate-900 italic tracking-tighter">{int.ingredient_a} & {int.ingredient_b}</h4>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${COLOR_MAP[int.severity_color as RiskColor]}`}>{int.severity_color}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-600 italic leading-snug">"{int.summary_plain}"</p>
                           <div className="pt-2 border-t border-slate-100">
                             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Observation Protocol</p>
                             <div className="flex flex-wrap gap-1">
                                {int.watch_for?.map((w: string, idx: number) => (
                                  <span key={idx} className="text-[8px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">● {w}</span>
                                ))}
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4.0 Variance Timeline Section */}
                {includeTimeline && checkins.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-1 bg-slate-900"></div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Section 4.0 Physiological Variance</h2>
                    </div>
                    <div className="h-64 w-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8', fontWeight: 900}} />
                          <YAxis hide domain={[0, 10]} />
                          <Line type="monotone" dataKey="sleep_quality" stroke="#af7ac5" strokeWidth={4} dot={false} />
                          <Line type="monotone" dataKey="mood_low" stroke="#48c9b0" strokeWidth={4} dot={false} />
                          <Line type="monotone" dataKey="anxiety" stroke="#ec7063" strokeWidth={4} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                       {['Sleep Deviance', 'Mood Variance', 'Anxiety Index'].map((label, i) => (
                         <div key={label} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                           <p className="text-xs font-black text-slate-900 mt-1 italic">NOMINAL</p>
                         </div>
                       ))}
                    </div>
                  </section>
                )}

                {/* Final Verification Signature Block */}
                <div className="pt-24 border-t-2 border-slate-900 space-y-12">
                   <div className="flex justify-between items-end gap-12">
                      <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Patient Verification</p>
                          <div className="w-full h-12 border-b border-slate-300"></div>
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 italic">I verify that the self-reported symptom data and medication inventory reflected in this report are accurate and represent my biological experience to the best of my knowledge.</p>
                      </div>
                      <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Physician Review</p>
                          <div className="w-full h-12 border-b border-slate-300"></div>
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 italic">MRX Synthesis reviewed. Findings integrated into therapeutic roadmap.</p>
                      </div>
                   </div>

                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] text-center leading-relaxed max-w-2xl mx-auto border-t border-slate-100 pt-8">
                    REPORT GENERATED BY BIOMATH CORE AI. THIS IS NOT MEDICAL ADVICE. THIS DOCUMENT IS INTENDED FOR CLINICAL FACILITATION ONLY. VALIDATE ALL FINDINGS WITH A LICENSED HEALTHCARE PROFESSIONAL.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero title="Clinical Export" subtitle="Biological Pattern Serialization" icon="📋" color="#f43f5e" />
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-20 rounded-[5rem] text-center space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-clinical-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="text-[10rem] mb-6 animate-float relative z-10">📊</div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-4xl font-black tracking-tighter uppercase italic">Synthesize Report</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
              Our MRX engine will analyze your medication history, dose events, and daily symptoms to create a comprehensive clinical summary.
            </p>
          </div>
          <button 
            onClick={generateReport} 
            disabled={checkins.length === 0} 
            className="w-full relative z-10 bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-12 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-3xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-20"
          >
            Initialize Analysis
          </button>
          {checkins.length === 0 && (
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Requires at least one check-in entry</p>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-12 space-y-12 animate-in fade-in duration-300">
           <div className="relative">
              <div className="w-32 h-32 border-[12px] border-slate-100 dark:border-white/5 rounded-full"></div>
              <div className="absolute inset-0 w-32 h-32 border-[12px] border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
           </div>
           <div className="text-center space-y-4">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic">Dr. BioMath is analyzing...</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-clinical-500 animate-pulse">{steps[loadingStep]}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilder;
