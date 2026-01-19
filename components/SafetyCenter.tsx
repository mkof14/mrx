
import React, { useState } from 'react';
import { SymptomEntry, Medication, SafetyEscalation, RiskColor } from '../types';
import { COLOR_MAP } from '../constants';
import SectionHero from './SectionHero';

interface Props {
  checkins: SymptomEntry[];
  medications: Medication[];
}

const SafetyCenter: React.FC<Props> = ({ checkins, medications }) => {
  const latestScores = checkins[0]?.symptom_scales;
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);

  const getTriageGuidance = () => {
    const alerts = [];
    if (latestScores) {
      if ((latestScores.palpitations || 0) > 8 && (latestScores.anxiety || 0) > 8) {
        alerts.push({ 
          type: 'CRITICAL', 
          sev: SafetyEscalation.EMERGENCY, 
          color: RiskColor.RED,
          text: 'Severe cardiovascular response detected. Immediate professional evaluation is mandatory.' 
        });
      }
    }
    return alerts;
  };

  const alerts = getTriageGuidance();
  const hasEmergency = alerts.some(a => a.sev === SafetyEscalation.EMERGENCY);

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero 
        title="Emergency" 
        subtitle="Critical Safety Triage" 
        icon="🚨" 
        color="#ef4444" 
      />

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {hasEmergency && (
          <div className="bg-rose-600 text-white p-12 rounded-[4rem] shadow-2xl space-y-8 border-4 border-white/20 animate-pulse">
            <h2 className="text-6xl font-black tracking-tighter uppercase leading-none italic">Safety Trigger</h2>
            <button onClick={() => setShowEmergencyOverlay(true)} className="w-full bg-white text-rose-600 py-10 rounded-[3rem] font-black text-xl uppercase tracking-[0.4em]">Emergency Protocol</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-10">
            <h3 className="text-4xl font-black tracking-tighter uppercase">Triage Status</h3>
            {alerts.length === 0 ? (
              <div className="p-12 bg-emerald-500/5 rounded-[3rem] border border-emerald-500/10 text-center space-y-4">
                <span className="text-7xl">🛡️</span>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest leading-relaxed italic">Bio-Stability Nominal. No acute risks detected.</p>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border-2 shadow-lg space-y-4 bg-rose-50 border-rose-200 text-rose-900`}>
                  <p className="text-sm font-bold italic leading-relaxed">"{alert.text}"</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-10 border border-white/5 shadow-2xl relative overflow-hidden">
            <h3 className="text-4xl font-black tracking-tighter uppercase">Medical Policy</h3>
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic uppercase tracking-wider">
              MRX.Health is an analytical tool by BioMath Core. It is NOT a replacement for medical diagnosis. All neural insights are for educational purposes. Always consult a physician.
            </p>
          </div>
        </div>
      </div>

      {showEmergencyOverlay && (
        <div className="fixed inset-0 z-[2000] bg-rose-700 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
           <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic mb-10">Seek Help Now</h1>
           <p className="text-3xl font-black text-white uppercase tracking-tight mb-12">Call 911 Immediately</p>
           <button onClick={() => setShowEmergencyOverlay(false)} className="bg-white text-rose-700 px-16 py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-2xl">Close Guidance</button>
        </div>
      )}
    </div>
  );
};

export default SafetyCenter;
