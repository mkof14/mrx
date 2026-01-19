
import React from 'react';
import SectionHero from './SectionHero';

const Legal: React.FC = () => {
  return (
    <div className="animate-slide-up pb-32">
      <SectionHero 
        title="Legal" 
        subtitle="Clinical Governance & Privacy" 
        icon="⚖️" 
        color="#94a3b8" 
      />

      <div className="max-w-4xl mx-auto px-6 space-y-20">
        {/* Medical Non-Advice Section */}
        <section className="bg-rose-500/10 border border-rose-500/20 p-10 rounded-[3rem] space-y-6">
           <h3 className="text-xl font-black uppercase text-rose-600 tracking-tighter italic">Clinical Boundries</h3>
           <p className="text-sm font-bold text-rose-900 dark:text-rose-200 leading-relaxed italic">
             BioMath Core, Inc. ("the Company") provides MRX.Health as a software-as-a-service (SaaS) tool intended for data organization and pattern visualization. The Company is NOT a medical provider. No information provided by the interface, including Dr. BioMath or the Health Assistant, shall be interpreted as clinical advice. Users are strictly prohibited from modifying their pharmacological intake based solely on MRX outputs.
           </p>
        </section>

        {/* Terms of Sync */}
        <section className="space-y-8">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-6">Terms of Sync</h3>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-12 rounded-[4rem] space-y-10 shadow-2xl">
              <div className="space-y-4">
                 <h4 className="text-2xl font-black uppercase tracking-tight leading-none italic">1.0 Biological Data License</h4>
                 <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                    By inputting medication and symptom data, you grant BioMath Core a limited, non-exclusive license to process this data for the purpose of generating your reports. This data remains yours.
                 </p>
              </div>
              <div className="space-y-4">
                 <h4 className="text-2xl font-black uppercase tracking-tight leading-none italic">2.0 User Accountability</h4>
                 <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                    You are solely responsible for the accuracy of your medication logs. BioMath Core relies on the precision of your input to generate neural synthesis.
                 </p>
              </div>
           </div>
        </section>

        {/* Privacy Protocol */}
        <section className="space-y-8">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] ml-6">Privacy Protocol</h3>
           <div className="bg-slate-900 text-white p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-500/10 rounded-full blur-[100px]"></div>
              <div className="space-y-4 relative z-10">
                 <h4 className="text-2xl font-black uppercase tracking-tight leading-none italic">3.0 Zero-Knowledge Storage</h4>
                 <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                    Your clinical data is stored in a decentralized, encrypted format. BioMath Core employees cannot access your raw symptom logs or personal identity without explicit cryptographic keys provided by the user.
                 </p>
              </div>
              <div className="space-y-4 relative z-10">
                 <h4 className="text-2xl font-black uppercase tracking-tight leading-none italic">4.0 Data Portability</h4>
                 <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                    You retain the right to export your Bio-History or permanently erase your profile from the neural link at any time via the Settings panel.
                 </p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Legal;
