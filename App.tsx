
import React, { useState, useEffect, useCallback } from 'react';
import { Medication, SymptomEntry, UserProfile, Viewpoint, MedicationEvent } from './types';
import { analyzeMedicationData } from './geminiService';
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
import CreativeStudio from './components/CreativeStudio';
import LiveConsult from './components/LiveConsult';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Footer from './components/Footer';
import Legal from './components/Legal';
import FAQ from './components/FAQ';
import SystemDiagnostics from './components/SystemDiagnostics';
import { calculateStabilityIndex } from './utils/analytics';
import { INITIAL_SCORES } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mrx_logged_in') === 'true';
  });
  
  const [activeTab, setActiveTab] = useState('home');
  const [legalSection, setLegalSection] = useState('privacy');
  const [isSyncing, setIsSyncing] = useState(false);
  const [stabilityIndex, setStabilityIndex] = useState(1.0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mrx_theme');
      return (saved as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch { return 'light'; }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mrx_profile');
      return saved ? JSON.parse(saved) : { 
        id: Math.random().toString(36).substr(2, 9),
        email: '',
        name: '',
        age_years: null, 
        sex_at_birth: 'UNKNOWN', 
        weight_kg: null,
        height_cm: null,
        preferred_units: 'METRIC',
        preferred_voice: 'Zephyr',
        speech_speed: 1.0,
        pregnancy_possible: false, 
        preexisting_conditions: [],
        known_allergies: [],
        goals: [], 
        onboarded: false,
        is_subscribed: false
      };
    } catch { 
      return { 
        id: Math.random().toString(36).substr(2, 9),
        email: '',
        name: '',
        age_years: null, 
        sex_at_birth: 'UNKNOWN', 
        weight_kg: null,
        height_cm: null,
        preferred_units: 'METRIC',
        preferred_voice: 'Zephyr',
        speech_speed: 1.0,
        pregnancy_possible: false, 
        preexisting_conditions: [],
        known_allergies: [],
        goals: [], 
        onboarded: false,
        is_subscribed: false
      }; 
    }
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const saved = localStorage.getItem('mrx_meds');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [medicationEvents, setMedicationEvents] = useState<MedicationEvent[]>(() => {
    try {
      const saved = localStorage.getItem('mrx_med_events');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [checkins, setCheckins] = useState<SymptomEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mrx_checkins');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [checkinDraft, setCheckinDraft] = useState({
    scores: { ...INITIAL_SCORES },
    factors: { alcohol: 'NONE' as any, stress: false }
  });

  const [analysisResult, setAnalysisResult] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('mrx_latest_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mrx_profile', JSON.stringify(profile));
      localStorage.setItem('mrx_meds', JSON.stringify(medications));
      localStorage.setItem('mrx_med_events', JSON.stringify(medicationEvents));
      localStorage.setItem('mrx_checkins', JSON.stringify(checkins));
      localStorage.setItem('mrx_theme', theme);
      localStorage.setItem('mrx_logged_in', isAuthenticated.toString());
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      setStabilityIndex(calculateStabilityIndex(checkins));
    } catch (err) { console.error(err); }
  }, [profile, medications, medicationEvents, checkins, theme, isAuthenticated]);

  const runSynthesis = useCallback(async (currentMeds: Medication[], currentEvents: MedicationEvent[], currentLogs: SymptomEntry[]) => {
    if (currentLogs.length === 0 || currentMeds.length === 0 || !profile.is_subscribed) return;
    setIsSyncing(true);
    try {
      const result = await analyzeMedicationData(currentMeds, currentEvents, currentLogs.slice(0, 14), Viewpoint.BALANCED, profile);
      if (result) {
        setAnalysisResult(result);
        localStorage.setItem('mrx_latest_analysis', JSON.stringify(result));
      }
    } catch (err) { console.error(err); } finally { setIsSyncing(false); }
  }, [profile]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const clearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleMedChange = (newMeds: Medication[]) => {
    setMedications(newMeds);
    runSynthesis(newMeds, medicationEvents, checkins);
  };

  const handleEventChange = (newEvents: MedicationEvent[]) => {
    setMedicationEvents(newEvents);
    runSynthesis(medications, newEvents, checkins);
  };

  const handleCheckinSubmit = (entry: SymptomEntry) => {
    const updated = [entry, ...checkins];
    setCheckins(updated);
    runSynthesis(medications, medicationEvents, updated);
    setCheckinDraft({ scores: { ...INITIAL_SCORES }, factors: { alcohol: 'NONE' as any, stress: false } });
    setActiveTab('home');
  };

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setProfile(p => ({ ...p, email }));
  };

  const handleOpenLegal = (section: string = 'privacy') => {
    setLegalSection(section);
    setActiveTab('legal');
  };

  // Auth Flow
  if (!isAuthenticated) return <Auth onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  
  // Setup Flow (Unified Pricing + Onboarding)
  if (!profile.is_subscribed || !profile.onboarded) {
    return <AccountSetup theme={theme} toggleTheme={toggleTheme} onComplete={(p) => setProfile(p)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home medications={medications} checkins={checkins} analysisResult={analysisResult} isSyncing={isSyncing} onNavigateToReports={() => setActiveTab('reports')} stabilityIndex={stabilityIndex} onNavigate={setActiveTab} />;
      case 'assistant': return <HealthAssistant medications={medications} checkins={checkins} profile={profile} onUpdateProfile={setProfile} />;
      case 'live': return <LiveConsult profile={profile} onUpdateProfile={setProfile} />;
      case 'studio': return <CreativeStudio />;
      case 'timeline': return <Timeline medications={medications} checkins={checkins} events={medicationEvents} theme={theme} />;
      case 'interactions': return <InteractionMap medications={medications} profile={profile} analysisResult={analysisResult} />;
      case 'meds': return <MedicationList medications={medications} setMedications={handleMedChange as any} medicationEvents={medicationEvents} setMedicationEvents={handleEventChange as any} onFirstMedAdded={() => setActiveTab('home')} />;
      case 'checkin': return <DailyCheckIn medications={medications} onSubmit={handleCheckinSubmit} draft={checkinDraft} setDraft={setCheckinDraft} />;
      case 'reports': return <ReportBuilder medications={medications} medicationEvents={medicationEvents} checkins={checkins} profile={profile} cachedAnalysis={analysisResult} />;
      case 'safety': return <SafetyCenter checkins={checkins} medications={medications} />;
      case 'profile': return <Profile profile={profile} setProfile={setProfile} />;
      case 'settings': return <Settings profile={profile} setProfile={setProfile} theme={theme} toggleTheme={toggleTheme} clearAllData={clearAllData} />;
      case 'legal': return <Legal initialSection={legalSection} />;
      case 'faq': return <FAQ />;
      case 'diagnostics': return <SystemDiagnostics />;
      default: return <Home medications={medications} checkins={checkins} analysisResult={analysisResult} isSyncing={isSyncing} onNavigateToReports={() => setActiveTab('reports')} stabilityIndex={stabilityIndex} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent transition-colors duration-500 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header profile={profile} theme={theme} toggleTheme={toggleTheme} isSyncing={isSyncing} />
        <main className="flex-1 p-0">
          <div className="max-w-7xl mx-auto pb-8">
            {renderContent()}
          </div>
        </main>
        
        {/* Global Medical Observation Disclaimer */}
        <div className="w-full text-center py-6 px-6 no-print bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm border-t border-slate-200/50 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 italic">
            No medical advice. Just what’s happening.
          </p>
        </div>

        <Footer onOpenLegal={handleOpenLegal} onOpenFAQ={() => setActiveTab('faq')} />
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
