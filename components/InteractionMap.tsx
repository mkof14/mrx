
import React, { useState, useMemo } from 'react';
import { Medication, RiskColor, UserProfile } from '../types';
import { COLOR_MAP, BORDER_COLOR_MAP, TEXT_COLOR_MAP } from '../constants';
import SectionHero from './SectionHero';

interface Props {
  medications: Medication[];
  profile: UserProfile;
  analysisResult: any;
}

const InteractionMap: React.FC<Props> = ({ medications, profile, analysisResult }) => {
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [hoveredMedId, setHoveredMedId] = useState<string | null>(null);

  const interactions = useMemo(() => analysisResult?.interaction_findings || [], [analysisResult]);

  const getInteraction = (med1: Medication, med2: Medication) => {
    return interactions.find((int: any) => 
      (int.ingredient_a.toLowerCase().includes(med1.display_name.toLowerCase()) && int.ingredient_b.toLowerCase().includes(med2.display_name.toLowerCase())) ||
      (int.ingredient_b.toLowerCase().includes(med1.display_name.toLowerCase()) && int.ingredient_a.toLowerCase().includes(med2.display_name.toLowerCase()))
    );
  };

  if (medications.length < 1) {
    return (
      <div className="animate-slide-up pb-32 text-center">
        <SectionHero title="Safety Matrix" subtitle="Molecular Interaction Triage" icon="🧩" color="#f59e0b" />
        <div className="bg-white dark:bg-slate-900 rounded-[5rem] border border-slate-200 dark:border-white/5 p-24 shadow-2xl max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="text-9xl mb-4 animate-float">🧩</div>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Neutral State</h3>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm leading-relaxed">
            Add at least one medication to initialize the cross-molecule interaction engine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up pb-32">
      <SectionHero title="Safety Matrix" subtitle="Molecular Interaction Triage" icon="🧩" color="#f59e0b" />

      <div className="max-w-6xl mx-auto px-6 space-y-16">
        
        {/* The Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-[5.5rem] border border-slate-200 dark:border-white/5 p-12 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-1000"></div>
          
          <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 px-4">
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Protocol Matrix v2.1</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Cross-referencing active chemical profiles.</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Critical', color: 'RED' },
                { label: 'Warning', color: 'ORANGE' },
                { label: 'Minor', color: 'YELLOW' },
              ].map(legend => (
                <div key={legend.color} className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${COLOR_MAP[legend.color as RiskColor]}`}></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{legend.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar pb-6">
            <table className="w-full border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="p-4"></th>
                  {medications.map(med => (
                    <th 
                      key={med.id} 
                      className={`p-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 transform -rotate-45 text-left min-w-[140px] ${hoveredMedId === med.id ? 'text-amber-500 scale-110' : 'text-slate-400'}`}
                    >
                      {med.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medications.map((medRow, idx) => (
                  <tr key={medRow.id}>
                    <td 
                      className={`p-4 text-[10px] font-black uppercase tracking-[0.3em] text-right border-r border-slate-100 dark:border-white/5 transition-all duration-300 ${hoveredMedId === medRow.id ? 'text-amber-500 scale-105' : 'text-slate-500'}`}
                      onMouseEnter={() => setHoveredMedId(medRow.id)}
                      onMouseLeave={() => setHoveredMedId(null)}
                    >
                      {medRow.display_name}
                    </td>
                    {medications.map((medCol, idy) => {
                      const interaction = getInteraction(medRow, medCol);
                      const riskColor = (interaction?.severity_color || 'GRAY') as RiskColor;
                      const isSelf = idx === idy;
                      
                      return (
                        <td key={idy} className="p-2">
                          <button 
                            disabled={isSelf}
                            onMouseEnter={() => setHoveredMedId(medRow.id)}
                            onMouseLeave={() => setHoveredMedId(null)}
                            onClick={() => interaction && setSelectedCell(interaction)}
                            className={`w-full h-16 rounded-[2rem] transition-all duration-500 border-2 flex items-center justify-center font-black text-[9px] uppercase tracking-widest ${isSelf ? 'bg-slate-50 dark:bg-white/5 opacity-10 cursor-not-allowed border-transparent' : `${BORDER_COLOR_MAP[riskColor]} ${COLOR_MAP[riskColor]} ${riskColor !== RiskColor.GRAY ? 'shadow-lg hover:scale-110 ring-4 ring-white dark:ring-slate-900' : 'opacity-20 hover:opacity-100'}`}`}
                          >
                            {isSelf ? 'CORE' : interaction ? interaction.severity_color : 'OK'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Interaction Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {interactions.length > 0 ? interactions.map((int: any, i: number) => (
            <div 
              key={i} 
              onClick={() => setSelectedCell(int)}
              className={`bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 shadow-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-amber-500/10 ${BORDER_COLOR_MAP[int.severity_color as RiskColor]}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner ${COLOR_MAP[int.severity_color as RiskColor]}`}>
                    {int.severity_color === 'RED' ? '🆘' : '⚠️'}
                  </div>
                  <div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">{int.ingredient_a} <span className="text-clinical-500">&</span> {int.ingredient_b}</h4>
                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] mt-3 ${TEXT_COLOR_MAP[int.severity_color as RiskColor]}`}>{int.severity_color} LEVEL RISK</p>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{int.summary_plain}"</p>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-40 bg-white dark:bg-slate-900/40 rounded-[6rem] border-4 border-dashed border-slate-200 dark:border-white/5 text-center space-y-10 shadow-inner">
              <div className="w-40 h-40 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                 <span className="text-8xl animate-float">🛡️</span>
              </div>
              <div className="space-y-4">
                <h4 className="text-5xl font-black uppercase tracking-tighter italic text-emerald-600">Bio-Compatibility Verified</h4>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 max-w-sm mx-auto leading-loose">The MRX engine detects zero high-risk molecular collisions across your current treatment strategy.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deep Mechanism Drawer */}
      {selectedCell && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 max-w-4xl w-full rounded-[6rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] overflow-hidden border border-white/5 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-950 p-16 text-white relative">
               <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
               <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-6">
                    <span className="text-[10px] font-black text-clinical-500 uppercase tracking-[0.6em]">Molecular Triage Detail</span>
                    <h4 className="text-7xl font-black tracking-tighter uppercase leading-none italic">
                      {selectedCell.ingredient_a} <br/>
                      <span className="text-clinical-500">+</span> {selectedCell.ingredient_b}
                    </h4>
                  </div>
                  <button onClick={() => setSelectedCell(null)} className="w-20 h-20 rounded-[2.5rem] bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-6xl font-light transition-all shadow-2xl">×</button>
               </div>
            </div>
            <div className="p-16 space-y-16">
              <div className="space-y-8">
                 <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Clinical Synthesis</h5>
                 <p className="text-4xl text-slate-800 dark:text-slate-100 font-bold leading-tight italic">"{selectedCell.summary_plain}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Mechanism of Action</h5>
                  <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-slate-100 dark:border-white/10">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic uppercase tracking-[0.1em]">
                      {selectedCell.mechanism}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Physiological Indicators</h5>
                  <div className="space-y-4">
                    {selectedCell.watch_for?.map((s: string, j: number) => (
                      <div key={j} className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-rose-500/5 text-rose-600 border border-rose-500/10 shadow-sm">
                        <span className="text-3xl">🚨</span>
                        <span className="text-xs font-black uppercase tracking-widest">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCell(null)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-14 rounded-[3.5rem] font-black text-sm uppercase tracking-[0.8em] shadow-3xl hover:scale-[1.01] active:scale-95 transition-all"
              >
                Acknowledge Risk ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionMap;
