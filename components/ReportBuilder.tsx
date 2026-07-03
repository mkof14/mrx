import React, { useState, useEffect, useMemo } from 'react';
import { Medication, SymptomEntry, MedicationEvent, Viewpoint, UserProfile, RiskColor } from '../types';
import { analyzeMedicationData } from '../geminiService';
import { SYMPTOM_CATEGORIES, COLOR_MAP, BORDER_COLOR_MAP, TEXT_COLOR_MAP } from '../constants';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import PageShell from './PageShell';
import BackButton from './BackButton';
import PageCard from './PageCard';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../services/apiClient';

interface Props {
  medications: Medication[];
  medicationEvents: MedicationEvent[];
  checkins: SymptomEntry[];
  profile: UserProfile;
  cachedAnalysis?: any;
  viewpoint: Viewpoint;
  onViewpointChange: (v: Viewpoint) => void;
}

const ReportBuilder: React.FC<Props> = ({
  medications,
  medicationEvents,
  checkins,
  profile,
  cachedAnalysis,
  viewpoint,
  onViewpointChange
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reportData, setReportData] = useState<any>(cachedAnalysis || null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  
  // PDF Inclusion Toggles
  const [includeBio, setIncludeBio] = useState(true);
  const [includeInventory, setIncludeInventory] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeSafety, setIncludeSafety] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(true);
  const [includeInteractions, setIncludeInteractions] = useState(true);

  const steps = [
    t('report.step1'),
    t('report.step2'),
    t('report.step3'),
    t('report.step4'),
    t('report.step5')
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => interval && clearInterval(interval);
  }, [loading]);

  const generateReport = async () => {
    if (checkins.length === 0 || medications.length === 0) return;
    setLoading(true);
    try {
      const data = await analyzeMedicationData(medications, medicationEvents, checkins, viewpoint, profile);
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

  const handleShareLink = async () => {
    if (!reportData) return;
    setShareLoading(true);
    setShareError(null);
    try {
      const res = await api.share.createReport(reportData, profile.name || undefined);
      setShareUrl(res.url);
    } catch {
      setShareError(t('report.shareError'));
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  if (reportData && !loading) {
    return (
      <PageShell tabId="reports" heroSubtitle={t('report.previewSubtitle')} className="pb-40">
        <BackButton onClick={() => setReportData(null)} className="no-print" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* LEFT: Composer Controls (no-print) */}
          <div className="lg:col-span-4 no-print space-y-6">
            <div className="bg-mrx-panel dark:bg-mrx-panel-dark/50 p-10 rounded-3xl border border-mrx-line dark:border-mrx-line-dark shadow-mrx-md dark:shadow-none space-y-8 sticky top-32">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('report.configTitle')}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t('report.configDesc')}</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: t('report.modBio'), state: includeBio, setter: setIncludeBio, icon: '🧬' },
                  { label: t('report.modMeds'), state: includeInventory, setter: setIncludeInventory, icon: '💊' },
                  { label: t('report.modSummary'), state: includeSummary, setter: setIncludeSummary, icon: '📄' },
                  { label: t('report.modSafety'), state: includeSafety, setter: setIncludeSafety, icon: '🚨' },
                  { label: t('report.modInteractions'), state: includeInteractions, setter: setIncludeInteractions, icon: '🧩' },
                  { label: t('report.modAudit'), state: includeAudit, setter: setIncludeAudit, icon: '📜' },
                  { label: t('report.modTimeline'), state: includeTimeline, setter: setIncludeTimeline, icon: '📈' },
                ].map(mod => (
                  <button 
                    key={mod.label}
                    onClick={() => mod.setter(!mod.state)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                      mod.state 
                        ? 'bg-clinical-600/5 border-clinical-600/40 text-clinical-600' 
                        : 'bg-mrx-inset dark:bg-mrx-inset-dark border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-lg transition-transform group-hover:scale-110 ${mod.state ? 'grayscale-0' : 'grayscale'}`}>{mod.icon}</span>
                      <span className="text-xs font-semibold">{mod.label}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${mod.state ? 'bg-clinical-600' : 'bg-slate-200 dark:bg-white/10'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${mod.state ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-mrx-line dark:border-mrx-line-dark space-y-4">
                <button
                  type="button"
                  onClick={handleShareLink}
                  disabled={shareLoading}
                  className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {shareLoading ? t('common.loading') : t('tools.shareLink')}
                </button>

                {shareUrl && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t('report.shareCreated')}</p>
                    <p className="text-[10px] break-all text-slate-600 dark:text-slate-400">{shareUrl}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={copyShareLink} className="text-xs font-bold text-clinical-600">
                        {shareCopied ? t('report.copied') : t('tools.copyLink')}
                      </button>
                    </div>
                    <div className="text-center pt-2">
                      <p className="text-[10px] font-semibold text-slate-500 mb-2">{t('tools.shareQr')}</p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`}
                        alt="QR"
                        className="mx-auto rounded-lg border border-mrx-line"
                        width={140}
                        height={140}
                      />
                    </div>
                  </div>
                )}

                {shareError && <p className="text-xs text-rose-500">{shareError}</p>}

                <button 
                    onClick={handleCopySummary} 
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${copyFeedback ? 'bg-emerald-500 text-white' : 'bg-mrx-inset dark:bg-mrx-inset-dark text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  {copyFeedback ? t('report.copied') : t('report.copySummary')}
                </button>
                <button onClick={() => window.print()} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-mrx-sm dark:shadow-none flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                  <span>🖨️</span> {t('report.savePdf')}
                </button>
                <button 
                  onClick={() => setReportData(null)} 
                  className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                >
                  {t('report.regenerate')}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview (A4 Sim) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[1rem] shadow-mrx-md dark:shadow-none border border-slate-300 overflow-hidden text-slate-900 min-h-[1200px] print:m-0 print:border-0 print:shadow-none font-sans">
              
              {/* Report Header */}
              <div className="bg-gray-800 p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-clinical-500/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                <div className="space-y-3 text-center md:text-left relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-mrx-md dark:shadow-none border-2 border-clinical-500">M</div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{t('report.docTitle')}</h1>
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-clinical-400">{t('report.docSubtitle')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold border border-white/10">{t('report.ref')}: MRX-{Math.floor(Date.now()/100000)}</div>
                     <div className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold border border-white/10">{t('report.statusOk')}</div>
                  </div>
                </div>
                <div className="text-right relative z-10 space-y-1">
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">{t('report.genDate')}</p>
                  <p className="text-lg font-black tracking-tighter uppercase italic">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-12 md:p-16 space-y-16">
                
                {/* 1.0 Patient Biometrics */}
                {includeBio && (
                  <section className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-1 bg-clinical-600"></div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('report.secBio')}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: t('report.statName'), val: profile.name || '—' },
                        { label: t('report.statAge'), val: profile.age_years ? `${profile.age_years} ${t('common.years')}` : '—' },
                        { label: t('report.statSex'), val: profile.sex_at_birth || '—' },
                        { label: t('report.statWellness'), val: `${(reportData.stability_index || 0.98 * 100).toFixed(0)}%` }
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
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('report.secMeds')}</h2>
                    </div>
                    <div className="border border-slate-200 rounded-3xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-500">{t('report.colDrug')}</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-500">{t('report.colDose')}</th>
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
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('report.secSummary')}</h2>
                    </div>
                    <div className="p-10 bg-[#f8fafc] rounded-2xl border border-slate-200 relative">
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
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">{t('report.secRisk')}</h2>
                    </div>
                    <div className="space-y-4">
                      {reportData.safety_flags.map((flag: any, i: number) => (
                        <div key={i} className={`p-10 rounded-2xl border-2 bg-white flex flex-col md:flex-row items-center gap-10 ${BORDER_COLOR_MAP[flag.risk_color as RiskColor] || 'border-slate-200'}`}>
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-200">🚨</div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-xs font-semibold text-rose-600">{flag.flag_type}</h4>
                            <p className="text-base font-bold text-slate-800 italic leading-snug">"{flag.trigger_plain}"</p>
                            <p className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-1 rounded-full inline-block mt-2">{t('report.actionLabel')}: {flag.user_action_plain}</p>
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
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('report.secTimeline')}</h2>
                    </div>
                    <div className="h-64 w-full bg-slate-50 rounded-2xl p-8 border border-slate-100">
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

                <div className="pt-24 border-t-2 border-slate-900 text-center space-y-6">
                   <div className="p-6 rounded-2xl border-2 border-rose-200 bg-rose-50 text-left max-w-2xl mx-auto">
                     <p className="text-[10px] font-black uppercase text-rose-600 tracking-wide mb-2">{t('footer.disclaimerTitle')}</p>
                     <p className="text-[11px] text-slate-700 leading-relaxed">{t('report.printDisclaimer')}</p>
                   </div>
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] leading-relaxed max-w-2xl mx-auto">
                        {t('report.footerDisclaimer')}
                   </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell tabId="reports" narrow heroSubtitle={t('report.buildSubtitle')}>
        <PageCard padding="sm" className="text-center">
          <div className="text-6xl mb-4">📑</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('report.buildTitle')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            {t('report.buildDesc')}
          </p>
          <div className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.values(Viewpoint).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onViewpointChange(v)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    viewpoint === v
                      ? 'bg-rose-600 text-white'
                      : 'bg-mrx-inset dark:bg-mrx-inset-dark text-slate-500 border border-mrx-line dark:border-mrx-line-dark'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {medications.length > 0 && checkins.length > 0 ? (
              <button type="button" onClick={generateReport} className="w-full mrx-btn-primary py-4">
                {t('report.buildBtn')} →
              </button>
            ) : (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                {t('report.needData')}
              </div>
            )}
          </div>
        </PageCard>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-mrx-overlay-dark/90 backdrop-blur-md flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-clinical-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-white">{t('report.loadingTitle')}</h3>
            <p className="text-sm text-clinical-300">{steps[loadingStep]}</p>
            <div className="flex justify-center gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${loadingStep >= i ? 'w-4 bg-clinical-400' : 'w-2 bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ReportBuilder;