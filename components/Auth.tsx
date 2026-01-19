
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (email: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, theme, toggleTheme }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-clinical-500/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-float"></div>

      {/* Theme Toggle on Auth Page */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={toggleTheme}
          className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 text-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-slate-200 dark:border-white/10 shadow-xl"
        >
          {theme === 'light' ? '🌘' : '☀️'}
        </button>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10 space-y-4">
          <div className="w-20 h-20 bg-slate-900 dark:bg-white rounded-3xl flex items-center justify-center text-white dark:text-slate-900 font-black text-4xl shadow-2xl mx-auto transform hover:rotate-6 transition-transform">⬡</div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">MRX<span className="text-clinical-500">.</span>HEALTH</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Clinical Neural Interface v2.5</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-white/5 space-y-8 animate-in zoom-in-95 duration-700">
          
          {/* Sign In / Sign Up Toggles */}
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!isRegistering ? 'bg-white dark:bg-slate-800 text-clinical-600 shadow-md' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isRegistering ? 'bg-white dark:bg-slate-800 text-clinical-600 shadow-md' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {isRegistering ? 'Create Profile' : 'Access Core'}
            </h2>
            <p className="text-xs font-bold text-slate-400">
              {isRegistering ? 'Start your biological journey today.' : 'Resume your pharmacological monitoring.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">✉</div>
                <input 
                  type="email" 
                  required
                  placeholder="Clinical Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5 pl-12 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white placeholder:text-slate-400"
                />
              </div>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔒</div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Secure Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5 pl-12 font-bold text-sm outline-none focus:border-clinical-500 transition-all dark:text-white placeholder:text-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-xl opacity-40 hover:opacity-100 transition-opacity"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-clinical-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-clinical-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isRegistering ? 'Initialize' : 'Authenticate'}
            </button>
          </form>

          <div className="relative py-2 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/5"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Or Link With</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/5"></div>
          </div>

          <button 
            onClick={() => onLogin('google-user@gmail.com')}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="G" />
            Google Connect
          </button>
        </div>

        <div className="mt-12 text-center space-y-4 opacity-40">
           <div className="flex justify-center gap-8">
              {['Privacy', 'Security', 'Compliance'].map(item => (
                <span key={item} className="text-[9px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-clinical-500">{item}</span>
              ))}
           </div>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
             © {new Date().getFullYear()} BIOMATH CORE, INC.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
