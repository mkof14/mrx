
import React from 'react';

interface FooterProps {
  onOpenLegal?: (section?: string) => void;
  onOpenFAQ?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenFAQ }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="no-print mt-20 pb-16 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md w-full relative z-40">
      <div className="max-w-7xl mx-auto pt-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and mission */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-black text-xl shadow-xl">M</div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">MRX.Health</span>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm italic">
              Helping you track and understand your medicines safely. We use smart technology to keep you and your doctor informed.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</h4>
            <nav className="flex flex-col gap-3">
              <button onClick={() => onOpenLegal?.('features')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Features</button>
              <button onClick={() => onOpenLegal?.('dashboard')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Dashboard</button>
              <button onClick={() => onOpenLegal?.('reports')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Reports</button>
              <button onClick={() => onOpenLegal?.('safety')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Safety Map</button>
              <button onClick={onOpenFAQ} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">FAQ</button>
            </nav>
          </div>

          {/* Legal and Support */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</h4>
            <nav className="flex flex-col gap-3">
              <button onClick={() => onOpenLegal?.('privacy')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Privacy Policy</button>
              <button onClick={() => onOpenLegal?.('terms')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Terms of Use</button>
              <button onClick={() => onOpenLegal?.('governance')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Clinical Governance</button>
              <button onClick={() => onOpenLegal?.('help')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Help Center</button>
              <button onClick={() => onOpenLegal?.('compliance')} className="text-xs font-bold text-left text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Compliance</button>
            </nav>
          </div>
        </div>

        {/* Global Medical Disclaimer - Simple but critical */}
        <div className="p-10 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-inner group transition-all hover:border-rose-500/20">
          <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
            <div className="text-5xl group-hover:rotate-12 transition-transform duration-500">🚑</div>
            <div className="space-y-2">
              <h5 className="text-xs font-black text-rose-500 uppercase tracking-widest">Medical Disclaimer</h5>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic uppercase tracking-wider">
                MRX.Health is for information only. We do not give medical advice or tell you which medicines to take. Always talk to your doctor before changing your treatment. In an emergency, call your local emergency number (like 911) immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © {currentYear} MRX Health. Clinical Precision.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decentralized Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
