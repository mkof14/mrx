import React, { useState, useEffect } from 'react';
import PageShell from './PageShell';
import PageCard, { PageSectionTitle } from './PageCard';
import { api } from '../services/apiClient';
import { useI18n } from '../i18n/I18nContext';

const SystemDiagnostics: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const { t } = useI18n();
  const [hwStatus, setHwStatus] = useState({ mic: 'PENDING', cam: 'PENDING', storage: 'PENDING' });
  const [aiPing, setAiPing] = useState<{ status: string; latency: number | null; configured: boolean }>({
    status: 'IDLE',
    latency: null,
    configured: false
  });
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (msg: string) => setTestLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));

  useEffect(() => {
    checkHardware();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await api.ai.status();
      setAiPing((prev) => ({ ...prev, configured: status.configured }));
      addLog(status.configured ? 'Server AI bridge: configured' : 'Server AI bridge: GEMINI_API_KEY missing');
      if (status.tts?.configured) {
        addLog(`TTS provider: ${status.tts.provider || 'unknown'}`);
      } else {
        addLog('TTS: set ELEVENLABS_API_KEY (recommended) or GEMINI_API_KEY');
      }
    } catch {
      addLog('CRITICAL: Cannot reach MRX API server');
    }
  };

  const checkHardware = async () => {
    addLog('Initializing Hardware Handshake...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setHwStatus((prev) => ({ ...prev, mic: 'ACTIVE' }));
      addLog('Microphone hardware verified and accessible.');
    } catch {
      setHwStatus((prev) => ({ ...prev, mic: 'BLOCKED' }));
      addLog('Microphone access denied or hardware missing.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setHwStatus((prev) => ({ ...prev, cam: 'ACTIVE' }));
      addLog('Camera hardware verified for Vision tasks.');
    } catch {
      setHwStatus((prev) => ({ ...prev, cam: 'BLOCKED' }));
      addLog('Camera access denied (Vision scanner limited).');
    }

    addLog('Data stored on secure server (not browser localStorage).');
    setHwStatus((prev) => ({ ...prev, storage: 'Server DB' }));
  };

  const runFullDiagnostic = async () => {
    setIsTesting(true);
    setAiPing((prev) => ({ ...prev, status: 'TESTING' }));
    addLog('STRESS TEST: Sending heartbeat to server AI bridge...');

    try {
      const result = await api.ai.diagnostic();
      if (result.status === 'STABLE' && result.latency) {
        setAiPing({ status: 'STABLE', latency: result.latency, configured: result.configured });
        addLog(`SUCCESS: AI Cluster responded in ${result.latency}ms via secure proxy.`);
      } else {
        throw new Error(result.error || 'Diagnostic failed');
      }
    } catch {
      setAiPing((prev) => ({ ...prev, status: 'FAILED', latency: null }));
      addLog('CRITICAL: AI Core sync failed. Check server GEMINI_API_KEY.');
    } finally {
      setIsTesting(false);
    }
  };

  const services = [
    { name: t('diag.svcAnalysis'), id: 'gemini-2.5-pro', role: t('page.reports.subtitle'), type: 'AI' },
    { name: t('diag.svcScan'), id: 'gemini-2.5-flash', role: t('meds.scan'), type: 'Vision' },
    { name: t('diag.svcChat'), id: 'gemini-2.5-flash', role: t('page.assistant.subtitle'), type: 'Chat' },
    { name: t('diag.svcVoice'), id: 'ElevenLabs', role: t('voice.subtitle'), type: 'Voice' },
    { name: t('diag.svcWellness'), id: 'local', role: t('home.stability.title'), type: 'Score' }
  ];

  const inner = (
    <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PageCard padding="md" className="text-center bg-mrx-inset dark:bg-mrx-inset-dark">
            <span className="text-xs font-semibold text-gray-500 block mb-2">{t('diag.latency')}</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{aiPing.latency ? `${aiPing.latency}ms` : '—'}</div>
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${aiPing.status === 'STABLE' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {aiPing.status}
            </div>
          </PageCard>

          <PageCard padding="md" className="text-center bg-mrx-inset dark:bg-mrx-inset-dark">
            <span className="text-xs font-semibold text-gray-500 block mb-2">{t('diag.mic')}</span>
            <div className={`text-2xl font-bold ${hwStatus.mic === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {hwStatus.mic === 'ACTIVE' ? t('diag.ready') : t('diag.error')}
            </div>
          </PageCard>

          <PageCard padding="md" className="text-center bg-mrx-inset dark:bg-mrx-inset-dark">
            <span className="text-xs font-semibold text-gray-500 block mb-2">{t('diag.camera')}</span>
            <div className={`text-3xl font-bold ${hwStatus.cam === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {hwStatus.cam === 'ACTIVE' ? t('diag.ready') : t('diag.error')}
            </div>
          </PageCard>

          <PageCard padding="md" className="text-center bg-mrx-inset dark:bg-mrx-inset-dark">
            <span className="text-xs font-semibold text-gray-500 block mb-2">{t('diag.storage')}</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{hwStatus.storage}</div>
          </PageCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <PageCard padding="sm" className="lg:col-span-8 flex flex-col h-[420px]">
            <div className="flex justify-between items-center mb-4">
              <PageSectionTitle>{t('diag.testTitle')}</PageSectionTitle>
              <button
                type="button"
                onClick={runFullDiagnostic}
                disabled={isTesting}
                className="mrx-btn-primary px-4 py-2 text-xs disabled:opacity-50"
              >
                {isTesting ? t('diag.testing') : t('diag.testBtn')}
              </button>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto custom-scrollbar border border-white/5">
              {testLog.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="opacity-40 mr-2">&gt;</span>
                  {log}
                </div>
              ))}
              {isTesting && <div className="animate-pulse text-emerald-300">…</div>}
            </div>
          </PageCard>

          <PageCard padding="sm" className="lg:col-span-4 bg-clinical-600 text-white flex flex-col justify-center">
            <h4 className="text-lg font-bold mb-3">{t('diag.envTitle')}</h4>
            <div className="space-y-2 text-xs opacity-90">
              <div className="flex justify-between"><span>MRX</span><span>1.1</span></div>
              <div className="flex justify-between"><span>AI</span><span>{aiPing.configured ? 'OK' : '—'}</span></div>
              <div className="flex justify-between"><span>{t('settings.account')}</span><span>JWT</span></div>
            </div>
          </PageCard>
        </div>

        <PageCard padding="sm">
          <PageSectionTitle className="mb-4">{t('diag.servicesTitle')}</PageSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-mrx-inset dark:bg-mrx-inset-dark rounded-xl border border-mrx-line dark:border-mrx-line-dark hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h5>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-semibold shrink-0">{s.type}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{s.role}</p>
                <p className="text-[9px] font-mono text-slate-400 mt-2 truncate">{s.id}</p>
              </div>
            ))}
          </div>
        </PageCard>
    </>
  );

  if (embedded) {
    return <div className="p-4 space-y-4 bg-mrx-canvas dark:bg-mrx-canvas-dark">{inner}</div>;
  }

  return <PageShell tabId="diagnostics">{inner}</PageShell>;
};

export default SystemDiagnostics;
