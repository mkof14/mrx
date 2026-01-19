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
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // PDF Inclusion Toggles
  const [includeBio, setIncludeBio] = useState(true);
  const [includeInventory, setIncludeInventory] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeSafety, setIncludeSafety] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(true);
  const [includeInteractions, setIncludeInteractions] = useState(true);

  const steps = [
    "Synthesizing biometric data...",
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
      }, 1200);
    }
    return () => interval && clearInterval(interval);
  }, [loading]);

  const generateReport = async () => {
    if (checkins.length === 0 || medications.length === 0) return;
    setLoading(true);
    try {
      const data = await analyzeMedicationData(medications, medicationEvents, checkins, 'BALANCED' as any, profile);
      if (data) {
        setReportData(data);
      }
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

  const handleCopySummary = () => {
    if (!reportData?.executive_summary?.summary_plain) return;
    const text = `MRX CLINICAL SUMMARY\nPatient: ${profile.name || 'Anonymous'}\nDate: ${new Date().toLocaleDateString()}\n\nSUMMARY:\n${reportData.executive_summary.summary_plain}\n\nDISCUSSION POINTS:\n${reportData.executive_summary.doctor_discussion_points?.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (reportData && !loading) {
    return (
      <div className="pb-40 animate-in fade-in duration-700">
        <SectionHero title="The Composer" subtitle="Clinical Report Preview & Export" icon="📋" color="#f43f5e" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Composer Controls (no-print) */}
          <div className="lg:col-span-4 no-print space-y-6">
            <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-8 sticky top-32">
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Report Configuration</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Select modules to include in the final document.</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Patient Biometrics', state: includeBio, setter: setIncludeBio, icon: '🧬' },
                  { label: 'Medication Inventory', state: includeInventory, setter: setIncludeInventory, icon: '💊' },
                  { label: 'Clinical Summary', state: includeSummary, setter: setIncludeSummary, icon: '📄' },
                  { label: 'Safety Warnings', state: includeSafety, setter: setIncludeSafety, icon: '🚨' },
                  { label: 'Interaction Matrix', state: includeInteractions, setter: setIncludeInteractions, icon: '🧩' },
                  { label: 'Event Audit Trail', state: includeAudit, setter: setIncludeAudit, icon: '📜' },
                  { label: 'Symptom Timelines', state: includeTimeline, setter: setIncludeTimeline, icon: '📈' },
                ].map(mod => (
                  <button 
                    key={mod.label}
                    onClick={() => mod.setter(!mod.state)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                      mod.state 
                        ? 'bg-clinical-600/5 border-clinical-600/40 text-clinical-600' 
                        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-lg transition-transform group-hover:scale-110 ${mod.state ? 'grayscale-0' : 'grayscale'}`}>{mod.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{mod.label}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${mod.state ? 'bg-clinical-600' : 'bg-slate-200 dark:bg-white/10'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${mod.state ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                <button 
                    onClick={handleCopySummary} 
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${copyFeedback ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  {copyFeedback ? 'Text Copied!' : '📋 Copy Summary Text'}
                </button>
                <button onClick={() => window.print()} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                  <span>🖨️</span> Save as PDF
                </button>
                <button 
                  onClick={() => setReportData(null)} 
                  className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Regenerate Synthesis
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview (A4 Sim) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[1rem] shadow-2xl border border-slate-300 overflow-hidden text-slate-900 min-h-[1200px] print:m-0 print:border-0 print:shadow-none font-sans">
              
              {/* Report Header */}
              <div className="bg-[#0f172a] p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-clinical-500/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                <div className="space-y-3 text-center md:text-left relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-2xl border-2 border-clinical-500">M</div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">MRX.Clinical</h1>
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-clinical-400">Biological Synchronization Protocol</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Ref: BMC-RX-{Math.floor(Date.now()/100000)}</div>
                     <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Status: Verified Synthesis</div>
                  </div>
                </div>
                <div className="text-right relative z-10 space-y-1">
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">Generation Date</p>
                  <p className="text-lg font-black tracking-tighter uppercase italic">{new Date().toLocaleDateString()}</p>
                  <p className="text-[8px] font-black tracking-[0.3em] uppercase text-clinical-500">Engine: Gemini 3 Pro</p>
                </div>
              </div>

              <div className="p-12 md:p-16 space-y-16">
                
                {/* 1.0 Patient Biometrics */}
                {includeBio && (
                  <section className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-1 bg-clinical-600"></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">1.0 Patient Biometric Snapshot</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Subject Name', val: profile.name || 'Anonymous' },
                        { label: 'Biological Age', val: `${profile.age_years || '—'} Years` },
                        { label: 'Assigned Sex', val: profile.sex_at_birth },
                        { label: 'Stability Index', val: `${(reportData.stability_index || 0.98 * 100).toFixed(0)}%` }
                      ].map(stat => (
                        <div key={stat.label} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                          <p className="text-sm font-black text-slate-900 uppercase italic">{stat.val}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2.0 Molecular Inventory */}
                {includeInventory && (
                  <section className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-1 bg-clinical-600"></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">2.0 Active Molecular Inventory</h2>
                    </div>
                    <div className="border border-slate-200 rounded-3xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest text-slate-500">Molecule Name</th>
                            <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest text-slate-500">Dosage Strategy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {medications.map((m, i) => (
                            <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                              <td className="px-6 py-5 font-black text-sm uppercase italic text-slate-900">{m.display_name}</td>
                              <td className="px-6 py-5">
                                <p className="text-xs font-bold text-slate-600">{m.current_dose.amount}{m.current_dose.unit}</p>
                                <p className="text-[9px] font-black text-clinical-500 uppercase tracking-widest mt-0.5">{m.current_dose.schedule_notes}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* 3.0 Summary Section */}
                {includeSummary && (
                  <section className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-1 bg-clinical-600"></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">3.0 Executive Summary</h2>
                    </div>
                    <div className="p-10 bg-[#f8fafc] rounded-[2.5rem] border border-slate-200 relative">
                      <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">📄</div>
                      <p className="text-lg font-bold leading-relaxed italic text-slate-800 relative z-10">
                        "{reportData.executive_summary?.summary_plain}"
                      </p>
                    </div>
                  </section>
                )}

                {/* 4.0 Safety Flags */}
                {includeSafety && reportData.safety_flags?.length > 0 && (
                  <section className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-1 bg-rose-600"></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">4.0 Risk Indicators</h2>
                    </div>
                    <div className="space-y-4">
                      {reportData.safety_flags.map((flag: any, i: number) => (
                        <div key={i} className={`p-10 rounded-[2.5rem] border-2 bg-white flex flex-col md:flex-row items-center gap-10 ${BORDER_COLOR_MAP[flag.risk_color as RiskColor] || 'border-slate-200'}`}>
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-200">🚨</div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600">{flag.flag_type}</h4>
                            <p className="text-base font-bold text-slate-800 italic leading-snug">"{flag.trigger_plain}"</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-4 py-1 rounded-full inline-block mt-2">Instruction: {flag.user_action_plain}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5.0 Timeline View */}
                {includeTimeline && checkins.length > 0 && (
                  <section className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-1 bg-clinical-600"></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">5.0 Symptom Variance Timeline</h2>
                    </div>
                    <div className="h-64 w-full bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8', fontWeight: 900}} />
                          <YAxis hide domain={[0, 10]} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                          <Line type="monotone" dataKey="sleep_quality" stroke="#af7ac5" strokeWidth={4} dot={false} />
                          <Line type="monotone" dataKey="mood_low" stroke="#48c9b0" strokeWidth={4} dot={false} />
                          <Line type="monotone" dataKey="anxiety" stroke="#ec7063" strokeWidth={4} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                <div className="pt-24 border-t-2 border-slate-900 text-center space-y-4">
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] leading-relaxed max-w-2xl mx-auto">
                        SYNTHESIS GENERATED BY BIOMATH CORE AI. THIS DOCUMENT IS NOT A REPLACEMENT FOR MEDICAL ADVICE. VALIDATE FINDINGS WITH A LICENSED PROFESSIONAL.
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-20 rounded-[5rem] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-clinical-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="text-[10rem] mb-6 animate-float relative z-10">📑</div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-4xl font-black tracking-tighter uppercase italic">Synthesize Report</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              The MRX engine will analyze your medication history and symptom trends to create a structured clinical summary.
            </p>
          </div>
          <div className="pt-10 relative z-10">
            {medications.length > 0 && checkins.length > 0 ? (
              <button 
                onClick={generateReport} 
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-12 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.8em] shadow-3xl hover:scale-[1.01] active:scale-95 transition-all"
              >
                Initialize Synthesis ➔
              </button>
            ) : (
              <div className="p-8 bg-rose-50 dark:bg-rose-500/10 rounded-3xl border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest">
                Data Insufficient: Add Medications & Logs to proceed.
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-12 space-y-12 animate-in fade-in duration-300">
           <div className="relative">
              <div className="w-32 h-32 border-[12px] border-slate-100 dark:border-white/5 rounded-full"></div>
              <div className="absolute inset-0 w-32 h-32 border-[12px] border-clinical-600 border-t-transparent rounded-full animate-spin"></div>
           </div>
           <div className="text-center space-y-4">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Dr. BioMath is synthesizing...</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-clinical-500 animate-pulse">{steps[loadingStep]}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilder;