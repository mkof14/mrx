
import React, { useState, useEffect } from 'react';
import SectionHero from './SectionHero';

interface LegalProps {
  initialSection?: string;
}

const Legal: React.FC<LegalProps> = ({ initialSection = 'privacy' }) => {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const sections = [
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'safety', label: 'Safety Map', icon: '🛡️' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { id: 'terms', label: 'Terms of Use', icon: '📜' },
    { id: 'governance', label: 'Governance', icon: '🧬' },
    { id: 'help', label: 'Help Center', icon: '❓' },
    { id: 'compliance', label: 'Compliance', icon: '⚖️' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'features':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">System Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                <h4 className="text-lg font-black uppercase text-blue-600 mb-2">AI Interaction Matrix</h4>
                <p className="text-sm text-slate-500 leading-relaxed italic">Our proprietary BioMath Core analyzes millions of chemical pathways to identify potential collisions between your medications in real-time.</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                <h4 className="text-lg font-black uppercase text-emerald-600 mb-2">Neural Progress Tracking</h4>
                <p className="text-sm text-slate-500 leading-relaxed italic">Log your symptoms using our precision Bio-Feedback sliders to visualize how your body responds to treatment adjustments.</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                <h4 className="text-lg font-black uppercase text-purple-600 mb-2">Smart Scan Technology</h4>
                <p className="text-sm text-slate-500 leading-relaxed italic">Simply photograph your medication labels; our vision engine extracts dosage, active ingredients, and frequency automatically.</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                <h4 className="text-lg font-black uppercase text-rose-600 mb-2">Live Neural Consult</h4>
                <p className="text-sm text-slate-500 leading-relaxed italic">Engage in real-time voice conversations with the MRX companion to discuss symptom patterns and pharmacological theory.</p>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Dashboard Guide</h2>
            <p className="text-lg font-bold text-slate-500 leading-relaxed italic">The MRX Dashboard is your mission control for physiological stability.</p>
            <div className="space-y-6">
              <div className="p-10 bg-slate-900 rounded-[3rem] text-white">
                <h4 className="text-xl font-black uppercase text-clinical-500 mb-4">Understanding the Stability Index</h4>
                <p className="text-sm text-slate-400 leading-relaxed italic">The Stability Index (0-100%) measures the variance in your reported symptoms. A high score suggests your current pharmacological protocol is well-tolerated. Significant drops trigger a "Safety Flag," suggesting you consult your physician regarding potential side effects.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <span className="text-xs font-black uppercase text-blue-500 block mb-2">Active Summary</span>
                  <p className="text-xs text-slate-500 font-bold italic uppercase tracking-wider">A real-time AI generation that distills your recent logs into a single coherent status update.</p>
                </div>
                <div className="p-6 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <span className="text-xs font-black uppercase text-amber-500 block mb-2">Smart Insights</span>
                  <p className="text-xs text-slate-500 font-bold italic uppercase tracking-wider">Automated tips based on your specific medication profile and reported energy/mood levels.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Clinical Reports</h2>
            <div className="p-10 bg-blue-600 rounded-[3rem] text-white space-y-4">
              <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">The Bridge to Professional Care</h4>
              <p className="text-sm font-bold text-blue-100 leading-relaxed italic">MRX Reports are specifically designed to be read by doctors. We use standard medical terminology and structured data visualization to save you time during appointments.</p>
            </div>
            <div className="space-y-6 text-slate-600 dark:text-slate-400">
              <h5 className="font-black uppercase tracking-widest text-xs">Report Modules:</h5>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <span className="text-blue-500 font-bold">01.</span>
                  <p className="text-sm font-bold italic"><strong className="text-slate-900 dark:text-white">Molecular Inventory:</strong> A complete list of active ingredients, dosages, and brands currently in your system.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-blue-500 font-bold">02.</span>
                  <p className="text-sm font-bold italic"><strong className="text-slate-900 dark:text-white">Variance Timelines:</strong> Multi-line charts showing the correlation between dose changes and symptom fluctuations.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-blue-500 font-bold">03.</span>
                  <p className="text-sm font-bold italic"><strong className="text-slate-900 dark:text-white">Triage Summary:</strong> AI-generated discussion points to help your doctor quickly identify the most important changes.</p>
                </li>
              </ul>
            </div>
          </div>
        );
      case 'safety':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Safety Matrix Logic</h2>
            <div className="bg-rose-500/10 border border-rose-500/20 p-10 rounded-[3rem] space-y-4">
              <h4 className="text-xl font-black uppercase text-rose-600">Cross-Referencing Engine</h4>
              <p className="text-sm font-bold text-rose-900 dark:text-rose-200 leading-relaxed italic">The Safety Map uses a multi-layered analysis to check for Drug-Drug (DDI) and Drug-Symptom interactions. We categorize risks into four levels: CORE (Baseline), OK (Minimal Risk), WARNING (Monitor Closely), and CRITICAL (Immediate Action).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {['Metabolic Interference', 'Synergistic Effects', 'Toxicity Thresholds'].map(point => (
                 <div key={point} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 text-center">
                    <h5 className="text-[10px] font-black uppercase text-slate-900 dark:text-white mb-1">{point}</h5>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Monitoring</p>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Privacy Policy</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 italic font-bold text-sm leading-relaxed space-y-6">
              <p>At BioMath Core (MRX.Health), we treat your biological data with absolute sensitivity. This policy outlines our commitment to decentralized security and user-centric data ownership.</p>
              <div className="space-y-4">
                <h4 className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-xs">1. Data Ownership</h4>
                <p>You own 100% of the information you input. We do not sell, rent, or trade your clinical history to third-party advertisers or insurance providers. Your data is used exclusively to generate your personal health insights.</p>
                
                <h4 className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-xs">2. Zero-Knowledge Architecture</h4>
                <p>MRX.Health utilizes local-first storage and end-to-end encryption. While we provide cloud synchronization for your convenience, the raw content of your "How I Feel" logs is encrypted with your personal key before leaving your device.</p>
                
                <h4 className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-xs">3. External Processing</h4>
                <p>For advanced pharmacological analysis, we utilize the Gemini 2.5/3 Pro engines. This data is transmitted via secure API channels and is subject to strict "do-not-train" protocols to ensure your logs are never used to train public AI models.</p>
              </div>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Terms of Use</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 italic font-bold text-sm leading-relaxed space-y-6">
              <p>By accessing the MRX.Health platform, you agree to the following biological protocol terms. Please read these carefully.</p>
              <div className="space-y-4">
                <h4 className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-xs">1. Eligibility</h4>
                <p>This service is intended for individuals aged 18 and over. By using the platform, you represent that you meet this age requirement and have the legal capacity to manage your own health data.</p>
                
                <h4 className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-xs">2. User Responsibility</h4>
                <p>The accuracy of our AI's "Neural Synthesis" depends entirely on the precision of your input. You are responsible for ensuring your medication dosages and symptom reports are accurate. Failure to do so renders any AI-generated safety analysis void.</p>
                
                <h4 className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-xs">3. Liability Limitation</h4>
                <p>BioMath Core, Inc. is a software company, not a medical clinic. We are not liable for any health outcomes, missed interactions, or side effects. Our platform is a visualization tool; clinical decisions must be made by a human physician.</p>
              </div>
            </div>
          </div>
        );
      case 'governance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Clinical Governance</h2>
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-6">
               <h4 className="text-xl font-black uppercase text-clinical-500">Algorithmic Ethics Protocol</h4>
               <p className="text-sm text-slate-400 leading-relaxed italic">Our governance framework ensures that every AI-generated health insight is grounded in peer-reviewed pharmacological data. We utilize a "Three-Viewpoint Analysis" strategy to provide Conservative, Balanced, and Exploratory perspectives on patient safety.</p>
               <div className="pt-6 border-t border-white/5 space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Protocol ID: BMC-CORE-G3</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified: Active Monitoring v2.5.3</p>
               </div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Help Center</h2>
            <div className="space-y-6">
              {[
                { q: "Is my doctor already using MRX?", a: "Many clinicians are joining our partner portal. You can share your PDF report with them, or ask them to sign up for Clinical Bio-Sync." },
                { q: "What should I do if the AI misses an interaction?", a: "Always trust your doctor and pharmacist over AI outputs. MRX is a secondary observation tool, not a primary safety filter." },
                { q: "How do I export my data?", a: "Go to Settings > Data Portability to download a JSON or CSV file of your entire health history." }
              ].map((faq, i) => (
                <div key={i} className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                   <h5 className="font-black uppercase text-xs text-blue-600 mb-2">Q: {faq.q}</h5>
                   <p className="text-sm font-bold text-slate-500 italic">A: {faq.a}</p>
                </div>
              ))}
              <div className="p-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] text-center space-y-4">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400">Still have questions?</p>
                 <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Contact Neural Support</button>
              </div>
            </div>
          </div>
        );
      case 'compliance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Compliance</h2>
            <div className="space-y-6 text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
              <p>MRX.Health operates within the regulatory framework for wellness and tracking software. We are strictly defined as a data aggregation and visualization platform under current FDA guidelines for Mobile Medical Applications.</p>
              <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 space-y-4">
                <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white">Global Standards Alignment:</h5>
                <ul className="space-y-2 text-[10px] uppercase tracking-widest font-black">
                  <li className="flex items-center gap-2"><span className="text-emerald-500">●</span> GDPR Data Portability</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500">●</span> ISO 27001 InfoSec Readiness</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500">●</span> HIPAA-Ready Encryption Layers</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-full">
      {/* Internal Sidebar for Knowledge Hub */}
      <nav className="lg:w-64 shrink-0 flex flex-col gap-2">
        {sections.map(s => (
          <button 
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSection === s.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
          >
            <span className="text-lg">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-[500px] overflow-visible">
        {renderContent()}
      </div>
    </div>
  );
};

export default Legal;
