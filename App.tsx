import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Medication, SymptomEntry, UserProfile, Viewpoint, MedicationEvent } from './types';
import { analyzeMedicationData, ApiError } from './geminiService';
import MedicationList from './components/MedicationList';
import DailyCheckIn from './components/DailyCheckIn';
import Home from './components/Home';
import Timeline from './components/Timeline';
import InteractionMap from './components/InteractionMap';
import ReportBuilder from './components/ReportBuilder';
import SafetyCenter from './components/SafetyCenter';
import AccountSetup from './components/AccountSetup';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import HealthAssistant from './components/HealthAssistant';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Footer from './components/Footer';
import Legal from './components/Legal';
import FAQ from './components/FAQ';
import SystemDiagnostics from './components/SystemDiagnostics';
import ToolsHub from './components/ToolsHub';
import ShareReportView from './components/ShareReportView';
import CaregiverView from './components/CaregiverView';
import VoiceAssistantWidget from './components/VoiceAssistantWidget';
import { calculateStabilityIndex } from './utils/analytics';
import { buildAnalysisCacheKey } from './utils/analysisCacheKey';
import { INITIAL_SCORES } from './constants';
import { ChatHistoryProvider, ChatMessage } from './hooks/useChatHistory';
import { api, clearToken, getToken, setToken, ApiError as ClientApiError, type ChatMessagePayload } from './services/apiClient';
import { useI18n } from './i18n/I18nContext';
import { isLocale } from './i18n/languages';
import { normalizePreferredVoice } from './types';

const defaultProfile = (userId = '', email = ''): UserProfile => ({
  id: userId,
  email,
  name: '',
  age_years: null,
  sex_at_birth: 'UNKNOWN',
  weight_kg: null,
  height_cm: null,
  preferred_units: 'METRIC',
  preferred_voice: 'Rachel',
  speech_speed: 1.0,
  preferred_language: 'en',
  pregnancy_possible: false,
  preexisting_conditions: [],
  known_allergies: [],
  allergies_confirmed_none: false,
  adverse_drug_reactions: [],
  current_supplements: [],
  smoking_status: null,
  alcohol_use: null,
  kidney_function: null,
  liver_function: null,
  is_pregnant: null,
  is_breastfeeding: null,
  on_blood_thinner: null,
  pharmacogenomics_notes: '',
  goals: [],
  onboarded: false,
  is_subscribed: false,
  ai_audit_consent: false,
  emergency_region: null
});

const App: React.FC = () => {
  const { t, setLocale } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('home');
  const [legalSection, setLegalSection] = useState('privacy');
  const [isSyncing, setIsSyncing] = useState(false);
  const [stabilityIndex, setStabilityIndex] = useState(1.0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mrx_theme');
      return (saved as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch {
      return 'light';
    }
  });

  const [profile, setProfile] = useState<UserProfile>(defaultProfile());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationEvents, setMedicationEvents] = useState<MedicationEvent[]>([]);
  const [checkins, setCheckins] = useState<SymptomEntry[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [viewpoint, setViewpoint] = useState<Viewpoint>(Viewpoint.BALANCED);

  const [checkinDraft, setCheckinDraft] = useState({
    scores: { ...INITIAL_SCORES },
    factors: { alcohol: 'NONE' as const, stress: false }
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSaveRef = useRef(true);
  const analysisCacheKeyRef = useRef<string | null>(null);

  const publicRoute = (() => {
    const path = window.location.pathname;
    const share = path.match(/^\/share\/([^/]+)/);
    if (share) return { type: 'share' as const, token: share[1] };
    const caregiver = path.match(/^\/caregiver\/([^/]+)/);
    if (caregiver) return { type: 'caregiver' as const, token: caregiver[1] };
    return null;
  })();

  const applyBootstrap = useCallback((data: {
    profile: unknown;
    medications: unknown[];
    medicationEvents: unknown[];
    checkins: unknown[];
    analysisResult: unknown;
    chatMessages?: ChatMessagePayload[];
  }) => {
    if (data.profile) {
      const p = data.profile as UserProfile;
      setProfile({ ...p, preferred_voice: normalizePreferredVoice(p.preferred_voice) });
    } else {
      setProfile(defaultProfile());
    }
    setMedications(data.medications as Medication[]);
    setMedicationEvents(data.medicationEvents as MedicationEvent[]);
    setCheckins(data.checkins as SymptomEntry[]);
    setAnalysisResult(data.analysisResult);
    setChatMessages((data.chatMessages as ChatMessage[]) || []);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') !== 'success' || !getToken()) return;
    api.billing.confirmMock()
      .then((res) => {
        if (res.profile) {
          setProfile((p) => ({ ...p, ...(res.profile as UserProfile) }));
        }
      })
      .catch(() => {})
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.data.bootstrap();
        applyBootstrap(data);
        setIsAuthenticated(true);
      } catch {
        clearToken();
      } finally {
        setIsLoading(false);
        skipSaveRef.current = false;
      }
    };
    bootstrap();
  }, [applyBootstrap]);

  useEffect(() => {
    const lang = profile.preferred_language;
    if (lang && isLocale(lang)) setLocale(lang);
  }, [profile.preferred_language, setLocale]);

  const handleLanguageChange = (code: string) => {
    if (!isLocale(code)) return;
    setLocale(code);
    setProfile((p) => ({ ...p, preferred_language: code }));
  };

  useEffect(() => {
    localStorage.setItem('mrx_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    setStabilityIndex(calculateStabilityIndex(checkins, medications));
  }, [checkins, medications, theme]);

  const persistData = useCallback(async () => {
    if (!isAuthenticated || skipSaveRef.current) return;
    try {
      await api.data.sync({
        profile,
        medications,
        medicationEvents,
        checkins
      });
      setSaveError(null);
    } catch (err) {
      const message = err instanceof ClientApiError ? err.message : 'Failed to save data';
      setSaveError(message);
      console.error('Failed to save data:', err);
    }
  }, [isAuthenticated, profile, medications, medicationEvents, checkins]);

  useEffect(() => {
    if (!isAuthenticated || skipSaveRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistData();
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isAuthenticated, profile, medications, medicationEvents, checkins, persistData]);

  const runSynthesis = useCallback(
    async (currentMeds: Medication[], currentEvents: MedicationEvent[], currentLogs: SymptomEntry[]) => {
      if (currentLogs.length === 0 || currentMeds.length === 0 || !profile.is_subscribed) return;

      const cacheKey = buildAnalysisCacheKey(
        currentMeds,
        currentEvents,
        currentLogs,
        profile,
        viewpoint
      );
      if (cacheKey === analysisCacheKeyRef.current && analysisResult) return;

      setIsSyncing(true);
      setAiError(null);
      try {
        const result = await analyzeMedicationData(
          currentMeds,
          currentEvents,
          currentLogs.slice(0, 14),
          viewpoint,
          profile
        );
        setAnalysisResult(result);
        analysisCacheKeyRef.current = cacheKey;
        await api.data.saveAnalysis(result);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'AI analysis failed';
        setAiError(message);
        console.error(err);
      } finally {
        setIsSyncing(false);
      }
    },
    [profile, viewpoint, analysisResult]
  );

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const clearAllData = async () => {
    try {
      await api.data.deleteAccount();
    } catch (err) {
      console.error(err);
    }
    clearToken();
    window.location.reload();
  };

  const handleMedicationUpdate = (newMeds: Medication[], newEvents: MedicationEvent[]) => {
    setMedications(newMeds);
    setMedicationEvents(newEvents);
    runSynthesis(newMeds, newEvents, checkins);
  };

  const handleCheckinSubmit = (entry: SymptomEntry) => {
    const updated = [entry, ...checkins];
    setCheckins(updated);
    runSynthesis(medications, medicationEvents, updated);
    setCheckinDraft({ scores: { ...INITIAL_SCORES }, factors: { alcohol: 'NONE' as const, stress: false } });
    setActiveTab('home');
  };

  const handleGuestLanguageChange = (code: string) => {
    if (isLocale(code)) setLocale(code);
  };

  const completeAuth = async (result: { token: string }) => {
    setToken(result.token);
    const data = await api.data.bootstrap();
    applyBootstrap(data);
    setIsAuthenticated(true);
  };

  const handleAuth = async (mode: 'login' | 'register', email: string, password: string, name?: string) => {
    setAuthError(null);
    skipSaveRef.current = true;
    try {
      const result =
        mode === 'register'
          ? await api.auth.register(email, password, name)
          : await api.auth.login(email, password);
      await completeAuth(result);
    } catch (err) {
      const message = err instanceof ClientApiError ? err.message : 'Authentication failed';
      setAuthError(message);
      throw err;
    } finally {
      skipSaveRef.current = false;
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    setAuthError(null);
    skipSaveRef.current = true;
    try {
      const result = await api.auth.google(credential);
      await completeAuth(result);
    } catch (err) {
      const message = err instanceof ClientApiError ? err.message : 'Google sign-in failed';
      setAuthError(message);
      throw err;
    } finally {
      skipSaveRef.current = false;
    }
  };

  const handleLogout = () => {
    skipSaveRef.current = true;
    clearToken();
    setIsAuthenticated(false);
    setProfile(defaultProfile());
    setMedications([]);
    setMedicationEvents([]);
    setCheckins([]);
    setAnalysisResult(null);
    skipSaveRef.current = false;
  };

  const handleOpenLegal = (section: string = 'privacy') => {
    setLegalSection(section);
    setActiveTab('legal');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mrx-canvas dark:bg-mrx-canvas-dark">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-clinical-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (publicRoute?.type === 'share') {
    return <ShareReportView token={publicRoute.token} />;
  }

  if (publicRoute?.type === 'caregiver') {
    return <CaregiverView token={publicRoute.token} />;
  }

  const voiceAccess =
    !isAuthenticated ? 'public' : !profile.is_subscribed || !profile.onboarded ? 'locked' : 'full';

  const voiceWidget = (
    <VoiceAssistantWidget
      access={voiceAccess}
      medications={medications}
      checkins={checkins}
      profile={profile}
      analysisResult={analysisResult}
      onNavigate={voiceAccess === 'full' ? setActiveTab : undefined}
      onUpdateProfile={voiceAccess === 'full' ? setProfile : undefined}
    />
  );

  const authenticatedShell = (content: React.ReactNode) => (
    <ChatHistoryProvider initialMessages={chatMessages} greeting={t('voice.greeting')}>
      {content}
      {voiceWidget}
    </ChatHistoryProvider>
  );

  if (!isAuthenticated) {
    return (
      <>
        <Auth
          onAuth={handleAuth}
          onGoogleAuth={handleGoogleAuth}
          authError={authError}
          theme={theme}
          toggleTheme={toggleTheme}
          onLanguageChange={handleGuestLanguageChange}
        />
        {voiceWidget}
      </>
    );
  }

  if (!profile.is_subscribed || !profile.onboarded) {
    return authenticatedShell(
      <AccountSetup
        theme={theme}
        toggleTheme={toggleTheme}
        initialProfile={profile}
        onComplete={(p) => setProfile({ ...p, id: profile.id, email: profile.email })}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            medications={medications}
            checkins={checkins}
            analysisResult={analysisResult}
            isSyncing={isSyncing}
            aiError={aiError}
            onNavigateToReports={() => setActiveTab('reports')}
            stabilityIndex={stabilityIndex}
            onNavigate={setActiveTab}
          />
        );
      case 'assistant':
        return (
          <HealthAssistant
            medications={medications}
            checkins={checkins}
            profile={profile}
            analysisResult={analysisResult}
            onUpdateProfile={setProfile}
          />
        );
      case 'timeline':
        return (
          <Timeline
            medications={medications}
            checkins={checkins}
            events={medicationEvents}
            theme={theme}
            viewpoint={viewpoint}
            onViewpointChange={setViewpoint}
            onNavigate={setActiveTab}
          />
        );
      case 'interactions':
        return (
          <InteractionMap medications={medications} profile={profile} analysisResult={analysisResult} onNavigate={setActiveTab} />
        );
      case 'meds':
        return (
          <MedicationList
            medications={medications}
            medicationEvents={medicationEvents}
            onUpdate={handleMedicationUpdate}
            onFirstMedAdded={() => setActiveTab('home')}
          />
        );
      case 'checkin':
        return (
          <DailyCheckIn
            medications={medications}
            onSubmit={handleCheckinSubmit}
            draft={checkinDraft}
            setDraft={setCheckinDraft as any}
          />
        );
      case 'reports':
        return (
          <ReportBuilder
            medications={medications}
            medicationEvents={medicationEvents}
            checkins={checkins}
            profile={profile}
            cachedAnalysis={analysisResult}
            viewpoint={viewpoint}
            onViewpointChange={setViewpoint}
          />
        );
      case 'safety':
        return (
          <SafetyCenter
            checkins={checkins}
            medications={medications}
            analysisResult={analysisResult}
            stabilityIndex={stabilityIndex}
            profile={profile}
          />
        );
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} />;
      case 'settings':
        return (
          <Settings
            profile={profile}
            setProfile={setProfile}
            theme={theme}
            toggleTheme={toggleTheme}
            clearAllData={clearAllData}
            onLogout={handleLogout}
          />
        );
      case 'legal':
        return <Legal initialSection={legalSection} />;
      case 'faq':
        return <FAQ />;
      case 'tools':
        return <ToolsHub profile={profile} setProfile={setProfile} onNavigate={setActiveTab} />;
      case 'diagnostics':
        return <SystemDiagnostics />;
      default:
        return (
          <Home
            medications={medications}
            checkins={checkins}
            analysisResult={analysisResult}
            isSyncing={isSyncing}
            aiError={aiError}
            onNavigateToReports={() => setActiveTab('reports')}
            stabilityIndex={stabilityIndex}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return authenticatedShell(
    <div className="flex h-screen overflow-hidden bg-mrx-canvas dark:bg-mrx-canvas-dark transition-colors duration-500 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header profile={profile} theme={theme} toggleTheme={toggleTheme} isSyncing={isSyncing} saveError={saveError} activeTab={activeTab} />
        <main className="flex-1 p-0">
          <div className="max-w-7xl mx-auto pb-8">{renderContent()}</div>
        </main>

        <div className="w-full text-center py-5 px-6 no-print bg-mrx-inset/60 dark:bg-mrx-inset-dark/60 border-t border-mrx-line dark:border-mrx-line-dark">
          <p className="text-xs text-gray-500 dark:text-zinc-500">{t('common.disclaimer')}</p>
        </div>

        <Footer
          onOpenLegal={handleOpenLegal}
          onOpenFAQ={() => setActiveTab('faq')}
          onLanguageChange={handleLanguageChange}
          theme={theme}
          toggleTheme={toggleTheme}
          isAuthenticated
          onSignOut={handleLogout}
        />
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
