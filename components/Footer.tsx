
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="no-print mt-20 py-16 px-6 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#020617] backdrop-blur-md">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 font-black text-lg shadow-xl">⬡</div>
              <span className="text-[10px] font-black tracking-[0.4em] text-slate-900 dark:text-white uppercase">MRX.Health</span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">A product of BioMath Core Intelligence, Inc.</p>
          </div>

          <nav className="flex flex-wrap gap-x-12 gap-y-4">
            {['Privacy Protocol', 'Terms of Sync', 'Clinical FAQ', 'System Status'].map(link => (
              <a key={link} href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-clinical-500 transition-colors">
                {link}
              </a>
            ))}
          </nav>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            © {currentYear} BioMath Core, Inc.
          </div>
        </div>

        {/* Global Medical Disclaimer */}
        <div className="p-8 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 leading-loose italic uppercase tracking-wider text-center max-w-4xl mx-auto">
            DISCLAIMER: MRX.Health and BioMath Core Intelligence are analytical tools and DO NOT provide medical advice, diagnosis, or treatment. All AI-generated content and neural synthesis are for educational purposes only. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication. Never disregard professional medical advice or delay in seeking it because of something you have read on this interface.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
