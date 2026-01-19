
import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import Legal from './Legal';
import FAQ from './FAQ';

interface AuthProps {
  onLogin: (email: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, theme, toggleTheme }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeScanName, setActiveScanName] = useState('Analyzing...');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [initialLegalSection, setInitialLegalSection] = useState('privacy');
  const [scanColorIdx, setScanColorIdx] = useState(0);

  const scanColors = [
    'rgba(59, 130, 246, 0.8)', // Blue
    'rgba(16, 185, 129, 0.8)', // Emerald
    'rgba(139, 92, 246, 0.8)', // Purple
    'rgba(245, 158, 11, 0.8)', // Amber
  ];

  useEffect(() => {
    const names = ['Sertraline', 'Amoxicillin', 'Metformin', 'Escitalopram', 'Ibuprofen', 'Lisinopril', 'Xanax'];
    let idx = 0;
    const interval = setInterval(() => {
      setActiveScanName(names[idx]);
      setScanColorIdx((prev) => (prev + 1) % scanColors.length);
      idx = (idx + 1) % names.length;
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  const handleGoogleLogin = () => {
    // Simulated Google Auth
    onLogin('google-user@gmail.com');
  };

  const openLegal = (section: string = 'privacy') => {
    setInitialLegalSection(section);
    setShowLegalModal(true);
  };

  const openFAQ = () => {
    setShowFAQModal(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex flex-col transition-colors duration-700 relative overflow-x-hidden font-sans">
      {/* Visual background accents */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-soft pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full animate-float pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="sticky top-0 left-0 right-0 p-8 flex justify-between items-center z-50 max-w-7xl mx-auto w-full bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-12 transition-transform">M</div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase group-hover:text-blue-600 transition-colors">MRX.Health</span>
            <span className="text-[6px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 leading-none">Medication Reactions eXplorer</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all">
            {theme === 'light' ? '🌘' : '☀️'}
          </button>
          {!showLoginForm && (
            <button 
              onClick={() => { setIsRegistering(false); setShowLoginForm(true); }}
              className="bg-slate-900/10 dark:bg-white/10 backdrop-blur-xl text-slate-900 dark:text-white border border-slate-900/20 dark:border-white/20 px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Log In
            </button>
          )}
          {showLoginForm && (
            <button 
              onClick={() => setShowLoginForm(false)}
              className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors px-6"
            >
              Close
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {!showLoginForm ? (
          /* LANDING VIEW */
          <div className="max-w-6xl w-full space-y-20 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="space-y-6">
                  <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">
                    Know your medicine <br/>
                    <span className="text-blue-600">inside out.</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-lg md:text-2xl max-w-xl mx-auto lg:mx-0 leading-tight italic">
                    Stop the guesswork. We track your pills and monitor how you feel, keeping you safe and your doctor informed.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <button 
                    onClick={() => { setIsRegistering(true); setShowLoginForm(true); }}
                    className="bg-blue-600 text-white px-20 py-8 rounded-[3rem] font-black text-2xl shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto uppercase tracking-wider"
                  >
                    Start Tracking ➔
                  </button>
                </div>
              </div>

              {/* REFINED HYPER-SCANNER ANIMATION */}
              <div className="relative bg-slate-950 rounded-[4rem] p-10 md:p-12 border border-white/5 shadow-[0_0_120px_rgba(59,130,246,0.1)] overflow-hidden animate-in zoom-in-95 duration-1000 delay-300 min-h-[480px]">
                
                {/* RUNNING PIXEL TRACKS (Horizontal) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                   <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-running-track" style={{ backgroundSize: '200% 100%' }}></div>
                   <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-running-track [animation-delay:0.5s]" style={{ backgroundSize: '200% 100%' }}></div>
                   <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-running-track [animation-delay:1s]" style={{ backgroundSize: '200% 100%' }}></div>
                </div>

                {/* VERTICAL SCANNERS (Shifting Colors) */}
                <div className="absolute inset-x-0 h-[3px] top-0 animate-scanner z-20 overflow-hidden" style={{ transition: 'background-color 1s' }}>
                  <div className="absolute inset-0 animate-color-shift bg-current shadow-[0_0_25px_currentColor]" style={{ color: scanColors[scanColorIdx], backgroundColor: 'currentColor' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" style={{ width: '200%' }}></div>
                </div>
                
                <div className="space-y-10 relative z-30">
                  <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden backdrop-blur-sm group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.2)]">💊</div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] animate-pulse">Bio-Scan: {activeScanName}</span>
                        <div className="flex gap-1">
                           <div className="w-1 h-1 bg-blue-500 animate-ping"></div>
                           <span className="text-[7px] font-black text-white/30 uppercase">Live</span>
                        </div>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden relative">
                         <div className="absolute inset-0 bg-blue-500 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute inset-x-0 h-[0.5px] bg-blue-500/20 bottom-0 animate-shimmer"></div>
                    <div className="space-y-0.5">
                      <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Molecular ID</span>
                      <h4 className="text-lg font-black text-white tracking-widest uppercase italic group-hover:text-blue-400 transition-colors duration-500">{activeScanName}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center space-y-0.5 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-shimmer group-hover:duration-500"></div>
                       <span className="text-emerald-500 font-black text-[8px] uppercase tracking-widest">Stability</span>
                       <span className="text-white font-black text-[10px] uppercase">Optimal</span>
                    </div>
                    <div className="h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center space-y-0.5 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-shimmer [animation-delay:0.7s]"></div>
                       <span className="text-blue-500 font-black text-[8px] uppercase tracking-widest">Interactions</span>
                       <span className="text-white font-black text-[10px] uppercase">Checked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LOGIN / REGISTER FORM */
          <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500 py-10">
            <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-12 shadow-3xl border border-slate-100 dark:border-white/5 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                  {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <div className="h-1 w-8 bg-blue-600 mx-auto rounded-full mt-2"></div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.63H24v9.3h12.98c-.58 2.85-2.18 5.25-4.59 6.81l7.41 5.76c4.34-4.01 6.88-9.92 6.88-17.24z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.41-5.76c-2.11 1.41-4.81 2.24-8.48 2.24-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Google Login
                </button>
                
                <div className="relative flex items-center py-2">
                   <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                   <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Email</span>
                   <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all dark:text-white"
                  />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all dark:text-white"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                  >
                    {isRegistering ? 'Sign Up' : 'Log In'}
                  </button>
                </form>
              </div>

              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
              >
                {isRegistering ? 'Already have an account? Log In' : 'New here? Create a profile'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mandatory Medical Observation Disclaimer */}
      <div className="w-full text-center py-8 px-6 no-print">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 italic">
          No medical advice. Just what’s happening.
        </p>
      </div>

      <Footer onOpenLegal={openLegal} onOpenFAQ={openFAQ} />

      {/* MODALS RENDERED HERE FOR AUTH CONTEXT */}
      {showLegalModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                 <div className="flex items-center gap-4">
                    <span className="text-3xl">⚖️</span>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic dark:text-white">Knowledge Hub</h3>
                 </div>
                 <button onClick={() => setShowLegalModal(false)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 <Legal initialSection={initialLegalSection} />
              </div>
           </div>
        </div>
      )}

      {showFAQModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                 <div className="flex items-center gap-4">
                    <span className="text-3xl">❓</span>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic dark:text-white">Common Questions</h3>
                 </div>
                 <button onClick={() => setShowFAQModal(false)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 <FAQ />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
