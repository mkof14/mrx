
import React from 'react';
import { SymptomEntry, Medication } from '../types';
import { SYMPTOM_CATEGORIES } from '../constants';
import SectionHero from './SectionHero';

interface Props {
  medications: Medication[];
  onSubmit: (entry: SymptomEntry) => void;
  draft: {
    scores: Record<string, number>;
    factors: { alcohol: any; stress: boolean };
  };
  setDraft: React.Dispatch<React.SetStateAction<{
    scores: Record<string, number>;
    factors: { alcohol: any; stress: boolean };
  }>>;
}

const DailyCheckIn: React.FC<Props> = ({ medications, onSubmit, draft, setDraft }) => {
  const { scores, factors } = draft;

  const updateScore = (id: string, value: number) => {
    setDraft(prev => ({ ...prev, scores: { ...prev.scores, [id]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: SymptomEntry = {
      log_iso: new Date().toISOString(),
      sleep_hours: 8,
      alcohol: factors.alcohol,
      high_stress: factors.stress,
      new_supplement: false,
      symptom_scales: { ...scores } as any,
      notes: ""
    };
    onSubmit(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up pb-32">
      <SectionHero 
        title="Check-In" 
        subtitle="Daily Bio-Feedback" 
        icon="📝" 
        color="#f59e0b" 
      />

      <div className="max-w-4xl mx-auto space-y-20 px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-10 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-2 text-center md:text-left">
             <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Biological Delta</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Precision reporting for clinical analysis.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mb-2"></div>
              <span className="text-[9px] font-black uppercase text-slate-400">Baseline</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-200 dark:bg-white/10"></div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mb-2"></div>
              <span className="text-[9px] font-black uppercase text-slate-400">Deviation</span>
            </div>
          </div>
        </div>

        <div className="space-y-16">
          {SYMPTOM_CATEGORIES.map(cat => {
            const val = scores[cat.id] || 0;
            const intensityColor = val > 7 ? 'text-red-500' : val > 3 ? 'text-amber-500' : 'text-blue-500';
            
            return (
              <div key={cat.id} className="group relative bg-white dark:bg-slate-900/40 p-12 rounded-[4rem] border border-slate-100 dark:border-white/5 transition-all hover:shadow-2xl">
                <div className="flex justify-between items-end mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-none">{cat.label}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{cat.description}</p>
                    </div>
                  </div>
                  <div className={`text-6xl font-black tracking-tighter italic leading-none transition-colors ${intensityColor}`}>
                    {val}
                  </div>
                </div>
                
                <div className="space-y-10">
                  <input 
                    type="range" min="0" max="10" 
                    value={val}
                    onChange={e => updateScore(cat.id, parseInt(e.target.value))}
                    className="bio-slider w-full"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                      <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest block mb-2">Score 0-3</span>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">{cat.lowBreakdown}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                      <span className="text-[9px] font-black uppercase text-red-500 tracking-widest block mb-2">Score 8-10</span>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">{cat.highBreakdown}</p>
                    </div>
                  </div>

                  <div className="p-8 bg-clinical-500/5 rounded-[2.5rem] border border-clinical-500/10">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic uppercase tracking-wider">
                      {cat.detailedExplanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          type="submit"
          className="w-full bg-[#020617] dark:bg-white text-white dark:text-slate-950 py-12 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.8em] shadow-2xl transition-all hover:scale-[1.01] active:scale-95 border-b-8 border-clinical-600"
        >
          Synchronize Log ➔
        </button>
      </div>
    </form>
  );
};

export default DailyCheckIn;
