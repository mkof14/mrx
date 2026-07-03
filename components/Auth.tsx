
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Footer from './Footer';
import Legal from './Legal';
import FAQ from './FAQ';
import MrxLogo from './MrxLogo';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import PasswordField from './PasswordField';
import { useI18n } from '../i18n/I18nContext';
import { isLocale } from '../i18n/languages';
import { api } from '../services/apiClient';

interface AuthProps {
  onAuth: (mode: 'login' | 'register', email: string, password: string, name?: string) => Promise<void>;
  onGoogleAuth: (credential: string) => Promise<void>;
  authError?: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLanguageChange?: (code: string) => void;
}

const Auth: React.FC<AuthProps> = ({
  onAuth,
  onGoogleAuth,
  authError,
  theme,
  toggleTheme,
  onLanguageChange
}) => {
  const { t, locale, setLocale } = useI18n();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeScanName, setActiveScanName] = useState('Sertraline');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [initialLegalSection, setInitialLegalSection] = useState('privacy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanColorIdx, setScanColorIdx] = useState(0);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const scanColors = [
    'rgba(37, 99, 235, 0.85)',
    'rgba(16, 185, 129, 0.85)',
    'rgba(139, 92, 246, 0.85)',
    'rgba(245, 158, 11, 0.85)'
  ];

  const handleLocaleChange = (code: string) => {
    if (isLocale(code)) setLocale(code);
    onLanguageChange?.(code);
  };

  useEffect(() => {
    const names = ['Sertraline', 'Amoxicillin', 'Metformin', 'Escitalopram', 'Ibuprofen', 'Lisinopril', 'Xanax'];
    let idx = 0;
    const interval = setInterval(() => {
      setActiveScanName(names[idx]);
      setScanColorIdx((prev) => (prev + 1) % scanColors.length);
      idx = (idx + 1) % names.length;
    }, 1800);
    return () => clearInterval(interval);
  }, [scanColors.length]);

  useEffect(() => {
    api.auth.googleStatus().then((r) => setGoogleConfigured(r.configured)).catch(() => setGoogleConfigured(false));
  }, []);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setIsSubmitting(true);
      try {
        await onGoogleAuth(credential);
      } catch {
        // error via authError prop
      } finally {
        setIsSubmitting(false);
      }
    },
    [onGoogleAuth]
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleConfigured || !showLoginForm || !googleBtnRef.current) return;

    const mountGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) void handleGoogleCredential(response.credential);
        }
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        locale
      });
    };

    if (window.google?.accounts?.id) {
      mountGoogleButton();
      return;
    }

    const existing = document.querySelector('script[data-mrx-google]');
    if (existing) {
      existing.addEventListener('load', mountGoogleButton);
      return () => existing.removeEventListener('load', mountGoogleButton);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.mrxGoogle = 'true';
    script.onload = mountGoogleButton;
    document.body.appendChild(script);
  }, [googleConfigured, showLoginForm, theme, locale, handleGoogleCredential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      await onAuth(isRegistering ? 'register' : 'login', email, password, isRegistering ? email.split('@')[0] : undefined);
    } catch {
      // error shown via authError prop
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLegal = (section: string = 'privacy') => {
    setInitialLegalSection(section);
    setShowLegalModal(true);
  };

  return (
    <div className="min-h-screen bg-mrx-canvas dark:bg-mrx-canvas-dark flex flex-col transition-colors duration-300 relative overflow-x-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-clinical-500/10 blur-[120px] rounded-full animate-pulse-soft pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full animate-float pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[25%] h-[25%] bg-violet-500/5 blur-[80px] rounded-full pointer-events-none" />

      <nav className="sticky top-0 z-50 w-full border-b border-mrx-line dark:border-mrx-line-dark bg-mrx-canvas/85 dark:bg-mrx-sidebar-dark/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto p-5 flex justify-between items-center gap-4">
          <MrxLogo size="md" className="cursor-pointer" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <LanguageSelector align="right" onChange={handleLocaleChange} />
            {!showLoginForm ? (
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setShowLoginForm(true);
                }}
                className="mrx-btn-primary px-5 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                {t('auth.logIn')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                className="text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-clinical-600 px-3"
              >
                {t('auth.close')}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {!showLoginForm ? (
          <div className="max-w-6xl w-full space-y-10 py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-clinical-50 dark:bg-clinical-950/40 border border-clinical-200 dark:border-clinical-800 text-clinical-700 dark:text-clinical-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('home.live.tag')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight leading-[1.08]">
                  {t('auth.heroTitle1')}
                  <br />
                  <span className="text-clinical-600 dark:text-clinical-400">{t('auth.heroTitle2')}</span>
                </h1>
                <p className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {t('auth.heroSubtitle')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setShowLoginForm(true);
                  }}
                  className="mrx-btn-primary px-10 py-4 text-base shadow-mrx-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  {t('auth.startTracking')} →
                </button>
              </div>

              <div className="relative rounded-2xl p-6 md:p-8 border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-clinical-950 shadow-mrx-lg overflow-hidden min-h-[340px] animate-in zoom-in-95 duration-700 delay-150">
                <div
                  className="absolute inset-x-0 h-[2px] top-0 animate-scanner z-20"
                  style={{ backgroundColor: scanColors[scanColorIdx], boxShadow: `0 0 24px ${scanColors[scanColorIdx]}` }}
                />
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-clinical-400 to-transparent animate-running-track" />
                  <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-running-track [animation-delay:0.6s]" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-clinical-600/30 rounded-xl flex items-center justify-center text-2xl">💊</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-clinical-400 uppercase tracking-widest">
                          {t('auth.scanBio')}: {activeScanName}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase">{t('auth.scanLive')}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-clinical-500 rounded-full animate-shimmer" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('auth.molecularId')}</span>
                    <p className="text-lg font-bold text-white mt-1">{activeScanName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">{t('auth.stability')}</span>
                      <p className="text-sm font-bold text-white mt-1">{t('auth.stabilityOptimal')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-clinical-500/10 border border-clinical-500/25 text-center">
                      <span className="text-[9px] font-bold text-clinical-400 uppercase">{t('nav.interactions')}</span>
                      <p className="text-sm font-bold text-white mt-1">{t('auth.interactionsChecked')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full py-8 animate-in fade-in slide-in-from-bottom-6 duration-400">
            <div className="relative mrx-card dark:bg-mrx-panel-dark rounded-3xl p-8 md:p-10 shadow-mrx-xl border border-mrx-line dark:border-mrx-line-dark space-y-7 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-clinical-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col items-center gap-4">
                <MrxLogo size="md" showText={false} />
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                    {isRegistering ? t('auth.createAccount') : t('auth.welcomeBack')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{t('auth.secureLogin')}</p>
                </div>
              </div>

              {authError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium text-center">
                  {authError}
                </div>
              )}

              {(googleConfigured && import.meta.env.VITE_GOOGLE_CLIENT_ID) ? (
                <div className="space-y-3">
                  <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-mrx-line dark:border-mrx-line-dark" />
                    <span className="mx-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {t('auth.orContinue')}
                    </span>
                    <div className="flex-grow border-t border-mrx-line dark:border-mrx-line-dark" />
                  </div>
                </div>
              ) : googleConfigured ? null : (
                <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500">{t('auth.googleUnavailable')}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mrx-label">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email')}
                    autoComplete="email"
                    className="mrx-input"
                  />
                </div>
                <div>
                  <label className="mrx-label">{t('auth.password')}</label>
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full mrx-btn-primary py-4 disabled:opacity-50">
                  {isSubmitting
                    ? t('auth.authenticating')
                    : isRegistering
                      ? t('auth.signUp')
                      : t('auth.logIn')}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-clinical-600 transition-colors"
              >
                {isRegistering ? t('auth.switchToLogin') : t('auth.switchToRegister')}
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="w-full text-center py-6 px-6 no-print">
        <p className="text-xs text-gray-400 dark:text-zinc-500">{t('common.disclaimer')}</p>
      </div>

      <Footer
        onOpenLegal={openLegal}
        onOpenFAQ={() => setShowFAQModal(true)}
        onLanguageChange={handleLocaleChange}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {showLegalModal && (
        <div className="fixed inset-0 z-[600] bg-black/55 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-mrx-panel dark:bg-mrx-panel-dark w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-mrx-xl flex flex-col overflow-hidden border border-mrx-line dark:border-mrx-line-dark">
            <div className="p-6 border-b border-mrx-line dark:border-mrx-line-dark flex justify-between items-center bg-mrx-inset dark:bg-mrx-inset-dark">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <h3 className="text-lg font-bold dark:text-white">{t('auth.knowledgeHub')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLegalModal(false)}
                className="w-10 h-10 rounded-xl bg-mrx-inset dark:bg-white/10 hover:bg-rose-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <Legal initialSection={initialLegalSection} />
            </div>
          </div>
        </div>
      )}

      {showFAQModal && (
        <div className="fixed inset-0 z-[600] bg-black/55 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-mrx-panel dark:bg-mrx-panel-dark w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-mrx-xl flex flex-col overflow-hidden border border-mrx-line dark:border-mrx-line-dark">
            <div className="p-6 border-b border-mrx-line dark:border-mrx-line-dark flex justify-between items-center bg-mrx-inset dark:bg-mrx-inset-dark">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❓</span>
                <h3 className="text-lg font-bold dark:text-white">{t('auth.commonQuestions')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFAQModal(false)}
                className="w-10 h-10 rounded-xl bg-mrx-inset dark:bg-white/10 hover:bg-rose-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <FAQ />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
