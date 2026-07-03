import React, { useState, useRef, useEffect } from 'react';
import { Medication, SymptomEntry, UserProfile, AIVoice, ELEVENLABS_VOICE_OPTIONS, normalizePreferredVoice } from '../types';
import { generateSpeech } from '../geminiService';
import { streamAssistant } from '../services/apiClient';
import { historyForAssistantApi, isChatErrorPlaceholder } from '../utils/chatHistory';
import { resolveVoiceError } from '../utils/voiceErrors';
import { useI18n } from '../i18n/I18nContext';
import PageShell from './PageShell';
import PageCard from './PageCard';
import { LiveDot } from './ui/MrxUI';
import { PageGuide } from './ui/PageGuide';
import { playTtsAudio } from '../utils/audio';
import { summarizeForVoice } from '../utils/ttsText';
import { useChatHistory, type ChatMessage } from '../hooks/useChatHistory';

interface Props {
  medications: Medication[];
  checkins: SymptomEntry[];
  profile: UserProfile;
  analysisResult?: any;
  onUpdateProfile?: (p: UserProfile) => void;
}

const HealthAssistant: React.FC<Props> = ({ medications, checkins, profile, analysisResult, onUpdateProfile }) => {
  const { locale, t } = useI18n();
  const { messages, setMessages, saveMessages } = useChatHistory();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReading, setIsReading] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isProcessing]);

  const handleSend = async (customText?: string) => {
    const query = (customText || input).trim();
    if (!query || isProcessing) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: query }, { role: 'assistant', content: '' }]);
    setIsProcessing(true);

    try {
      let fullContent = '';
      let links: { title: string; uri: string }[] = [];

      await streamAssistant(
        query,
        {
          locale,
          capabilities: true,
          history: historyForAssistantApi(messages)
        },
        (data) => {
          fullContent += data.text || '';
          const metadata = data.groundingMetadata as { groundingChunks?: Array<{ web?: { title: string; uri: string } }> } | null;
          if (metadata?.groundingChunks) {
            links = metadata.groundingChunks.filter((c) => c.web).map((c) => c.web!);
          }

          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'assistant') {
              last.content = fullContent;
              last.groundingLinks = links;
            }
            return next;
          });
        }
      );

      setMessages((prev) => {
        const cleaned = prev.filter(
          (m, i) => !(m.role === 'assistant' && i < prev.length - 1 && isChatErrorPlaceholder(m.content))
        );
        saveMessages(cleaned);
        return cleaned;
      });
    } catch (err) {
      console.error('Assistant stream error:', err);
      const msg = resolveVoiceError(err, {
        default: t('voice.error'),
        quota: t('voice.errorQuota'),
        network: t('voice.errorNetwork'),
        config: t('voice.errorConfig')
      });
      setMessages((prev) => {
        const next: ChatMessage[] = [...prev.slice(0, -1), { role: 'assistant', content: msg }];
        return next;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadAloud = async (text: string, index: number) => {
    if (isReading !== null) return;
    setIsReading(index);
    try {
      const result = await generateSpeech(summarizeForVoice(text), profile.preferred_voice);
      if (result.audio) {
        audioContextRef.current = await playTtsAudio(result, profile.speech_speed, audioContextRef.current);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReading(null);
    }
  };

  const voices: AIVoice[] = ELEVENLABS_VOICE_OPTIONS;
  const speeds = [0.75, 1.0, 1.25, 1.5];

  const quickQuestions = [
    { key: 'assistant.quick1' as const, icon: '🔗', color: 'border-violet-200 bg-violet-500/10 dark:border-violet-800' },
    { key: 'assistant.quick2' as const, icon: '⚠️', color: 'border-amber-200 bg-amber-500/10 dark:border-amber-800' },
    { key: 'assistant.quick3' as const, icon: '📝', color: 'border-emerald-200 bg-emerald-500/10 dark:border-emerald-800' }
  ];

  return (
    <PageShell tabId="assistant">
      <div className="flex flex-col min-h-[50vh] max-w-5xl mx-auto w-full space-y-4">
        <PageGuide
          icon="🧠"
          title={t('page.assistant.guideTitle')}
          text={t('page.assistant.guideText')}
          steps={[t('page.assistant.guideStep1'), t('page.assistant.guideStep2'), t('page.assistant.guideStep3')]}
          accent="#6366f1"
        />

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-clinical-500/10 text-clinical-700 dark:text-clinical-300 border border-clinical-200 dark:border-clinical-800">
            💊 {t('assistant.contextMeds').replace('{count}', String(medications.length))}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
            📈 {t('assistant.contextCheckins').replace('{count}', String(checkins.length))}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {quickQuestions.map(({ key, icon, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSend(t(key))}
              disabled={isProcessing}
              className={`flex items-start gap-3 p-3 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 ${color}`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">{t(key)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <PageCard padding="xs" className="flex-1 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">{t('assistant.voiceLabel')}</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {voices.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdateProfile && onUpdateProfile({ ...profile, preferred_voice: v })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${normalizePreferredVoice(profile.preferred_voice) === v ? 'bg-clinical-600 border-clinical-600 text-white' : 'bg-mrx-inset dark:bg-mrx-inset-dark border-transparent text-slate-500'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </PageCard>

          <PageCard padding="xs" className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">{t('assistant.speedLabel')}</span>
            <div className="flex gap-1">
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateProfile && onUpdateProfile({ ...profile, speech_speed: s })}
                  className={`w-9 py-1 rounded-lg text-[10px] font-semibold border transition-all ${profile.speech_speed === s ? 'bg-clinical-600 border-clinical-600 text-white' : 'bg-mrx-inset dark:bg-mrx-inset-dark border-transparent text-slate-500'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </PageCard>
        </div>

        <PageCard padding="sm" className="flex-1 flex flex-col min-h-[360px] max-h-[55vh] overflow-hidden border-2 border-clinical-200/40 dark:border-clinical-800/40">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-mrx-line dark:border-mrx-line-dark">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-clinical-500 to-violet-600 flex items-center justify-center text-xl shadow-mrx-sm">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{t('page.assistant.title')}</p>
              <LiveDot label={t('home.live.tag')} />
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-0">
            {messages.length === 0 && !isProcessing && (
              <div className="text-center py-8 px-4">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">{t('assistant.emptyWelcome')}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-clinical-500/15 flex items-center justify-center text-sm mt-1">🤖</span>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl relative group ${
                    m.role === 'user'
                      ? 'bg-clinical-600 text-white rounded-br-md'
                      : 'bg-mrx-inset dark:bg-mrx-inset-dark text-slate-900 dark:text-white border border-mrx-line dark:border-mrx-line-dark rounded-bl-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content || (isProcessing && i === messages.length - 1 ? '…' : '')}</div>

                  {m.role === 'assistant' && m.content && (
                    <button
                      type="button"
                      onClick={() => handleReadAloud(m.content, i)}
                      className={`absolute -bottom-2 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-mrx-sm transition-all ${isReading === i ? 'bg-clinical-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-clinical-500'}`}
                    >
                      {isReading === i ? '🔊' : '🔈'}
                    </button>
                  )}

                  {m.groundingLinks && m.groundingLinks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-mrx-line dark:border-mrx-line-dark space-y-2">
                      <p className="text-[10px] font-semibold text-slate-400">{t('assistant.grounding')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.groundingLinks.map((link, j) => (
                          <a
                            key={j}
                            href={link.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-mrx-panel-dark rounded-lg text-[10px] text-clinical-600 font-semibold hover:bg-clinical-500/10 transition-colors"
                          >
                            🔗 {link.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-clinical-600/20 flex items-center justify-center text-sm mt-1">👤</span>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl flex gap-1.5 border border-mrx-line dark:border-mrx-line-dark">
                  <div className="w-2 h-2 rounded-full bg-clinical-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-clinical-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-clinical-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </PageCard>

        <div className="flex gap-2 p-1.5 bg-mrx-inset dark:bg-mrx-inset-dark rounded-2xl border border-mrx-line dark:border-mrx-line-dark">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-white dark:bg-mrx-panel-dark border border-transparent focus:border-clinical-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
            placeholder={t('assistant.placeholder')}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isProcessing || !input.trim()}
            className="bg-clinical-600 text-white px-5 rounded-xl text-lg shadow-mrx-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            ➔
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default HealthAssistant;