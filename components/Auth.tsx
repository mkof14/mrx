
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Footer from './Footer';
import Legal from './Legal';
import FAQ from './FAQ';
import MrxLogo from './MrxLogo';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import PasswordField from './PasswordField';
import MedTicker from './MedTicker';
import LiveScanDemo from './LiveScanDemo';
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
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [initialLegalSection, setInitialLegalSection] = useState('privacy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [funFactIdx, setFunFactIdx] = useState(0);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const funFacts = ['auth.funFact1', 'auth.funFact2', 'auth.funFact3', 'auth.funFact4'] as const;

  const benefits = [
    { icon: '💊', titleKey: 'auth.benefit1Title' as const, textKey: 'auth.benefit1Text' as const, accent: 'border-clinical-400/50 bg-clinical-500/10' },
    { icon: '📈', titleKey: 'auth.benefit2Title' as const, textKey: 'auth.benefit2Text' as const, accent: 'border-emerald-400/50 bg-emerald-500/10' },
    { icon: '⚠️', titleKey: 'auth.benefit3Title' as const, textKey: 'auth.benefit3Text' as const, accent: 'border-amber-400/50 bg-amber-500/10' }
  ] as const;

  const steps = [
    { icon: '➕', titleKey: 'home.step1' as const, descKey: 'home.step1desc' as const, delay: '0ms' },
    { icon: '🔍', titleKey: 'home.step2' as const, descKey: 'home.step2desc' as const, delay: '100ms' },
    { icon: '📝', titleKey: 'home.step3' as const, descKey: 'home.step3desc' as const, delay: '200ms' }
  ] as const;

  const handleLocaleChange = (code: string) => {
    if (isLocale(code)) setLocale(code);
    onLanguageChange?.(code);
  };

  useEffect(() => {
    api.auth.googleStatus().then((r) => setGoogleConfigured(r.configured)).catch(() => setGoogleConfigured(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFunFactIdx((i) => (i + 1) % funFacts.length), 5000);
    return () => clearInterval(id);
  }, [funFacts.length]);

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

  const openSignIn = (register = false) => {
    setIsRegistering(register);
    setShowLoginForm(true);
  };

  const floatingIcons = ['💊', '🧬', '📈', '🛡️', '🎙️', '🧩'];

  return (
    <div className="min-h-screen bg-mrx-canvas dark:bg-mrx-canvas-dark flex flex-col transition-colors duration-300 relative overflow-x-hidden font-sans">
      {/* Animated public background */}
      <div className="absolute inset-0 mrx-public-grid animate-grid-scroll pointer-events-none opacity-60" />
      <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] bg-clinical-500/15 blur-[130px] rounded-full animate-aurora pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-8%] w-[45%] h-[45%] bg-emerald-500/12 blur-[110px] rounded-full animate-aurora [animation-delay:4s] pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[30%] h-[30%] bg-violet-500/10 blur-[90px] rounded-full animate-glow-pulse pointer-events-none" />
      {floatingIcons.map((icon, i) => (
        <span
          key={icon}
          className="absolute text-lg sm:text-xl opacity-[0.1] dark:opacity-[0.14] pointer-events-none select-none"
          style={{
            top: `${8 + (i * 14) % 72}%`,
            left: `${4 + (i * 17) % 88}%`,
            animationDelay: `${i * 0.65}s`,
            animationDuration: `${4.5 + (i % 3)}s`
          }}
          aria-hidden
        >
          {icon}
        </span>
      ))}

      {!showLoginForm && <MedTicker />}

      <nav className="sticky top-0 z-50 w-full border-b border-mrx-line dark:border-mrx-line-dark bg-mrx-canvas/85 dark:bg-mrx-sidebar-dark/85 backdrop-blur-md animate-fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
          <MrxLogo size="md" className="cursor-pointer" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <LanguageSelector align="right" onChange={handleLocaleChange} />
            {!showLoginForm ? (
              <button
                type="button"
                onClick={() => openSignIn(false)}
                className="mrx-btn-rainbow px-4 sm:px-6 py-2.5 text-xs sm:text-sm"
              >
                {t('nav.signInUp')}
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
              <div className="space-y-5 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-clinical-50 dark:bg-clinical-950/40 border border-clinical-200 dark:border-clinical-800 text-clinical-700 dark:text-clinical-300 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('home.live.tag')}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight leading-[1.12]">
                  {t('auth.heroTitle1')}
                  <br />
                  <span className="text-clinical-600 dark:text-clinical-400">{t('auth.heroTitle2')}</span>
                </h1>
                <p className="text-gray-600 dark:text-zinc-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {t('auth.heroSubtitle')}
                </p>

                <div className="max-w-xl mx-auto lg:mx-0 text-left">
                  <p className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-2">
                    {t('auth.whatYouGet')}
                  </p>
                  <ul className="space-y-2">
                    {benefits.map(({ icon, titleKey, textKey, accent }) => (
                      <li
                        key={titleKey}
                        className={`flex gap-3 p-3 rounded-xl border ${accent} backdrop-blur-sm`}
                      >
                        <span className="w-8 h-8 shrink-0 rounded-lg bg-white/70 dark:bg-white/10 flex items-center justify-center text-base leading-none">
                          {icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t(titleKey)}</p>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{t(textKey)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mrx-card dark:bg-mrx-panel-dark rounded-xl p-3 border border-clinical-200/50 dark:border-clinical-900/50 bg-clinical-50/50 dark:bg-clinical-950/20 max-w-xl mx-auto lg:mx-0">
                  <p className="text-[9px] font-black text-clinical-600 uppercase tracking-widest mb-1.5">
                    💡 {t('auth.didYouKnow')}
                  </p>
                  <p key={funFactIdx} className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed animate-fact-in">
                    {t(funFacts[funFactIdx])}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openSignIn(true)}
                  className="mrx-btn-rainbow px-6 py-2.5 text-sm"
                >
                  {t('auth.startTracking')} →
                </button>
              </div>

              <div className="animate-in zoom-in-95 duration-700 delay-150">
                <LiveScanDemo />
              </div>
            </div>

            {/* How it works — 3 simple steps */}
            <div className="pt-2 space-y-3">
              <p className="text-center text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                {t('auth.commonQuestions')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {steps.map(({ icon, titleKey, descKey, delay }) => (
                  <div
                    key={titleKey}
                    className="mrx-card dark:bg-mrx-panel-dark rounded-xl p-4 border border-mrx-line dark:border-mrx-line-dark hover:border-clinical-400/40 transition-colors opacity-0 animate-fade-up"
                    style={{ animationDelay: delay }}
                  >
                    <span className="text-lg block mb-2 leading-none">{icon}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t(titleKey)}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{t(descKey)}</p>
                  </div>
                ))}
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
                <button type="submit" disabled={isSubmitting} className="w-full mrx-btn-rainbow py-4 disabled:opacity-50">
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
