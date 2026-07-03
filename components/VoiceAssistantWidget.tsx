import React from 'react';
import { Medication, SymptomEntry, UserProfile } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { getLocaleMeta } from '../i18n/languages';
import { useVoiceWidget } from '../i18n/VoiceWidgetContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { speakWithBrowser } from '../utils/browserSpeech';

export type VoiceAccess = 'public' | 'locked' | 'full';

interface Props {
  access?: VoiceAccess;
  medications?: Medication[];
  checkins?: SymptomEntry[];
  profile?: UserProfile;
  analysisResult?: unknown;
  onNavigate?: (tab: string) => void;
  onUpdateProfile?: (p: UserProfile) => void;
}

function AudioBars({ level, active, color }: { level: number; active: boolean; color: string }) {
  const bars = [0.4, 0.7, 1, 0.65, 0.5];
  return (
    <div className="flex items-end gap-0.5 h-6" aria-hidden>
      {bars.map((scale, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-75"
          style={{
            height: active ? `${Math.max(4, level * 24 * scale)}px` : '4px',
            backgroundColor: active ? color : '#94a3b8',
            opacity: active ? 0.9 : 0.35
          }}
        />
      ))}
    </div>
  );
}

function VoiceFab({
  isListening,
  onClick,
  label,
  title
}: {
  isListening?: boolean;
  onClick: () => void;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed z-[9999] right-5 bottom-6 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-mrx-lg ${
        isListening ? 'animate-pulse' : ''
      }`}
      aria-label={label}
      title={title}
    >
      <span className="relative flex h-14 w-14">
        <span
          className={`absolute inset-0 rounded-full bg-clinical-500 opacity-30 ${isListening ? 'animate-ping' : ''}`}
        />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-clinical-600 text-white shadow-mrx-lg ring-4 ring-white/80 dark:ring-mrx-panel-dark/80">
          <span className="font-bold text-lg tracking-tight">M</span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-md">
            🎤
          </span>
        </span>
      </span>
    </button>
  );
}

function speakWithBrowserLocalized(text: string, lang: string) {
  void speakWithBrowser(text, lang, 0.95);
}

const VoiceAssistantWidget: React.FC<Props> = ({
  access = 'full',
  medications = [],
  checkins = [],
  profile,
  analysisResult,
  onNavigate,
  onUpdateProfile
}) => {
  const { t, locale } = useI18n();
  const { isOpen, openVoice, closeVoice } = useVoiceWidget();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const spokeRef = React.useRef(false);

  const guestMessage =
    access === 'public' ? t('voice.authRequired') : t('voice.subscriptionRequired');
  const guestSubtitle =
    access === 'public' ? t('voice.lockedSubtitle') : t('voice.subscriptionSubtitle');

  const safeProfile: UserProfile =
    profile ??
    ({
      id: '',
      email: '',
      name: '',
      age_years: null,
      sex_at_birth: 'UNKNOWN',
      weight_kg: null,
      height_cm: null,
      preferred_units: 'METRIC',
      preferred_voice: 'Rachel',
      speech_speed: 1.0,
      preferred_language: locale,
      pregnancy_possible: false,
      preexisting_conditions: [],
      known_allergies: [],
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
      is_subscribed: false
    } as UserProfile);

  const voice = useVoiceAssistant({
    locale,
    profile: safeProfile,
    onNavigate,
    greeting: t('voice.greeting'),
    errorMessages: {
      default: t('voice.error'),
      quota: t('voice.errorQuota'),
      network: t('voice.errorNetwork'),
      config: t('voice.errorConfig')
    }
  });

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [voice.messages, voice.isProcessing]);

  React.useEffect(() => {
    if (access === 'full' || !isOpen) {
      spokeRef.current = false;
      return;
    }
    if (spokeRef.current) return;
    spokeRef.current = true;
    speakWithBrowserLocalized(guestMessage, getLocaleMeta(locale).speechCode);
    return () => window.speechSynthesis?.cancel();
  }, [access, guestMessage, isOpen, locale]);

  const statusText =
    access !== 'full'
      ? guestSubtitle
      : voice.isListening
        ? t('voice.listening')
        : voice.isSpeaking
          ? t('voice.speaking')
          : voice.isProcessing
            ? t('voice.thinking')
            : t('voice.subtitle');

  if (access !== 'full') {
    return (
      <>
        {!isOpen && (
          <VoiceFab onClick={openVoice} label={t('voice.open')} title={t('voice.title')} />
        )}

        {isOpen && (
          <div className="fixed z-[9998] inset-x-3 bottom-6 lg:inset-auto lg:right-6 lg:bottom-6 lg:w-[420px] flex flex-col mrx-card dark:bg-mrx-panel-dark rounded-3xl shadow-mrx-xl overflow-hidden border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-mrx-line dark:border-mrx-line-dark bg-amber-50 dark:bg-amber-950/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-clinical-600 text-white flex items-center justify-center font-bold shrink-0">
                  M
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 truncate">{t('voice.title')}</h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 truncate">{statusText}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeVoice}
                className="w-8 h-8 rounded-lg hover:bg-white/80 dark:hover:bg-white/10 text-lg shrink-0"
                aria-label={t('voice.close')}
              >
                ×
              </button>
            </div>

            <div className="px-4 py-5 space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[95%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark text-gray-800 dark:text-zinc-100">
                  {guestMessage}
                </div>
              </div>
              <p className="text-[11px] text-center text-gray-500 dark:text-zinc-500">
                {access === 'public' ? t('auth.logIn') : t('auth.startTracking')}
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {!isOpen && (
        <VoiceFab
          onClick={openVoice}
          isListening={voice.isListening}
          label={t('voice.open')}
          title={t('voice.title')}
        />
      )}

      {isOpen && (
        <div className="fixed z-[9998] inset-x-3 bottom-6 lg:inset-auto lg:right-6 lg:bottom-6 lg:w-[420px] max-h-[min(78vh,640px)] flex flex-col mrx-card dark:bg-mrx-panel-dark rounded-3xl shadow-mrx-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-mrx-line dark:border-mrx-line-dark bg-clinical-50 dark:bg-mrx-inset-dark">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-clinical-600 text-white flex items-center justify-center font-bold shrink-0">
                M
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 truncate">{t('voice.title')}</h3>
                <p className="text-[11px] text-clinical-600 dark:text-zinc-400 truncate">{statusText}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeVoice}
              className="w-8 h-8 rounded-lg hover:bg-white/80 dark:hover:bg-white/10 text-lg shrink-0"
              aria-label={t('voice.close')}
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[160px] max-h-[280px] custom-scrollbar">
            {voice.messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-clinical-600 text-white'
                      : 'bg-white dark:bg-mrx-inset-dark border border-mrx-line dark:border-mrx-line-dark text-gray-800 dark:text-zinc-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-mrx-line dark:border-mrx-line-dark space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={voice.toggleMic}
                  disabled={!voice.speechSupported}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-lg border transition-all ${
                    voice.micEnabled
                      ? 'bg-rose-500 text-white border-rose-500 shadow-mrx-sm'
                      : 'bg-mrx-panel dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark'
                  }`}
                  title={voice.micEnabled ? t('voice.micOff') : t('voice.micOn')}
                >
                  🎤
                </button>
                <AudioBars level={voice.micLevel} active={voice.isListening} color="#ef4444" />
              </div>

              <div className="flex items-center gap-2">
                <AudioBars level={voice.speakerLevel} active={voice.isSpeaking} color="#2563eb" />
                <button
                  type="button"
                  onClick={() => voice.setSpeakerEnabled(!voice.speakerEnabled)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border transition-all ${
                    voice.speakerEnabled
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'bg-mrx-panel dark:bg-mrx-inset-dark border-mrx-line dark:border-mrx-line-dark opacity-60'
                  }`}
                  title={voice.speakerEnabled ? t('voice.speakerOff') : t('voice.speakerOn')}
                >
                  {voice.speakerEnabled ? '🔊' : '🔇'}
                </button>
              </div>
            </div>

            {!voice.speechSupported && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">{t('voice.noSpeech')}</p>
            )}

            {voice.ttsError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">{voice.ttsError}</p>
            )}

            <p className="text-[10px] text-gray-500 dark:text-zinc-500">{t('voice.hint')}</p>

            <div className="flex gap-2">
              <input
                value={voice.input}
                onChange={(e) => voice.setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && voice.sendMessage(voice.input)}
                placeholder={t('voice.placeholder')}
                className="flex-1 px-3 py-2.5 rounded-xl border border-mrx-line dark:border-mrx-line-dark bg-white dark:bg-mrx-inset-dark text-sm outline-none focus:ring-2 focus:ring-clinical-500 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => voice.sendMessage(voice.input)}
                disabled={voice.isProcessing || !voice.input.trim()}
                className="px-4 py-2 rounded-xl bg-clinical-600 text-white text-sm font-semibold disabled:opacity-40"
              >
                {t('voice.send')}
              </button>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('assistant');
                  closeVoice();
                }}
                className="w-full py-2 text-xs font-semibold text-clinical-600 hover:underline"
              >
                {t('voice.expand')} →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistantWidget;
