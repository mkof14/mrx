import { useCallback, useEffect, useRef, useState } from 'react';
import { generateSpeech } from '../geminiService';
import { streamAssistant } from '../services/apiClient';
import { resolveVoiceError, type VoiceErrorMessages } from '../utils/voiceErrors';
import { historyForAssistantApi, isChatErrorPlaceholder } from '../utils/chatHistory';
import { playTtsAudio } from '../utils/audio';
import { speakWithBrowser } from '../utils/browserSpeech';
import { summarizeForVoice } from '../utils/ttsText';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  MicLevelMonitor,
  requestMicrophoneAccess
} from '../utils/speechRecognition';
import type { Locale } from '../i18n/languages';
import { getLocaleMeta } from '../i18n/languages';
import type { UserProfile } from '../types';
import { useOptionalChatHistory, type ChatMessage } from './useChatHistory';

export type { ChatMessage as VoiceMessage };

interface UseVoiceAssistantOptions {
  locale: Locale;
  profile: UserProfile;
  greeting: string;
  errorMessages: VoiceErrorMessages;
  onNavigate?: (tab: string) => void;
}

const NAV_COMMANDS: Record<string, string[]> = {
  home: ['overview', 'home', 'dashboard', 'обзор', 'главн', 'inicio', 'accueil'],
  meds: ['pill', 'medication', 'medicine', 'лекар', 'таблет', 'pastilla', 'medikament'],
  checkin: ['feel', 'check-in', 'checkin', 'symptom', 'самочув', 'чувств', 'síntoma'],
  assistant: ['ask', 'chat', 'question', 'спрос', 'вопрос', 'pregunt'],
  interactions: ['interaction', 'mix', 'взаимодей', 'interacción'],
  timeline: ['trend', 'progress', 'timeline', 'тренд', 'симптом'],
  reports: ['doctor', 'report', 'врач', 'doctor', 'médico'],
  safety: ['urgent', 'emergency', 'help', 'срочн', 'помощ', 'urgente'],
  settings: ['account', 'setting', 'data', 'аккаунт', 'настрой', 'cuenta']
};

function detectNavigation(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [tab, keywords] of Object.entries(NAV_COMMANDS)) {
    if (keywords.some((k) => lower.includes(k))) return tab;
  }
  return null;
}

export function useVoiceAssistant({
  locale,
  profile,
  onNavigate,
  greeting,
  errorMessages
}: UseVoiceAssistantOptions) {
  const chatCtx = useOptionalChatHistory();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: greeting }]);
  const messages = chatCtx?.messages ?? localMessages;
  const setMessages = chatCtx?.setMessages ?? setLocalMessages;

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [speakerLevel, setSpeakerLevel] = useState(0);
  const [speechSupported] = useState(isSpeechRecognitionSupported);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micMonitorRef = useRef<MicLevelMonitor | null>(null);
  const speakerAnimRef = useRef<number | null>(null);
  const micEnabledRef = useRef(micEnabled);
  const speakerEnabledRef = useRef(speakerEnabled);

  micEnabledRef.current = micEnabled;
  speakerEnabledRef.current = speakerEnabled;

  useEffect(() => {
    if (!chatCtx && greeting) {
      setLocalMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [chatCtx, greeting]);

  const animateSpeakerLevel = useCallback(() => {
    let t = 0;
    const tick = () => {
      t += 0.15;
      setSpeakerLevel(0.35 + Math.abs(Math.sin(t)) * 0.55);
      speakerAnimRef.current = requestAnimationFrame(tick);
    };
    speakerAnimRef.current = requestAnimationFrame(tick);
  }, []);

  const stopSpeakerAnim = useCallback(() => {
    if (speakerAnimRef.current) cancelAnimationFrame(speakerAnimRef.current);
    speakerAnimRef.current = null;
    setSpeakerLevel(0);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!speakerEnabledRef.current || !text.trim()) return;
      setIsSpeaking(true);
      setTtsError(null);
      animateSpeakerLevel();
      const spoken = summarizeForVoice(text);
      const lang = getLocaleMeta(locale).speechCode;
      try {
        const result = await generateSpeech(spoken, profile.preferred_voice);
        if (result.audio) {
          audioCtxRef.current = await playTtsAudio(result, profile.speech_speed, audioCtxRef.current);
        } else {
          await speakWithBrowser(spoken, lang, profile.speech_speed);
        }
      } catch (e) {
        console.error('Server TTS failed, trying browser speech:', e);
        try {
          await speakWithBrowser(spoken, lang, profile.speech_speed);
        } catch {
          setTtsError(e instanceof Error ? e.message : 'Voice playback failed');
        }
      } finally {
        stopSpeakerAnim();
        setIsSpeaking(false);
      }
    },
    [animateSpeakerLevel, locale, profile.preferred_voice, profile.speech_speed, stopSpeakerAnim]
  );

  const sendMessage = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isProcessing) return;

      const navTab = detectNavigation(trimmed);
      if (navTab && onNavigate) {
        onNavigate(navTab);
      }

      const history = historyForAssistantApi(chatCtx?.messages ?? messages);

      setMessages((prev) => [...prev, { role: 'user', content: trimmed }, { role: 'assistant', content: '' }]);
      setIsProcessing(true);

      try {
        let fullContent = '';
        await streamAssistant(
          trimmed,
          {
            locale,
            capabilities: true,
            history
          },
          (data) => {
            fullContent += data.text || '';
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') {
                last.content = fullContent;
              }
              return next;
            });
          }
        );

        setMessages((prev) => {
          const cleaned = prev.filter(
            (m, i) => !(m.role === 'assistant' && i < prev.length - 1 && isChatErrorPlaceholder(m.content))
          );
          if (chatCtx) chatCtx.saveMessages(cleaned);
          return cleaned;
        });

        if (fullContent.trim()) {
          await speak(fullContent);
        }
      } catch (err) {
        console.error('MRX Voice stream error:', err);
        const msg = resolveVoiceError(err, errorMessages);
        setMessages((prev) => {
          const withoutEmpty = prev.slice(0, -1);
          const next: ChatMessage[] = [...withoutEmpty, { role: 'assistant', content: msg }];
          return next;
        });
      } finally {
        setIsProcessing(false);
        if (micEnabledRef.current) {
          startListeningRef.current?.();
        }
      }
    },
    [chatCtx, errorMessages, isProcessing, locale, messages, onNavigate, setMessages, speak]
  );

  const startListeningRef = useRef<(() => void) | null>(null);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    micMonitorRef.current?.stop();
    micMonitorRef.current = null;
    setMicLevel(0);
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!speechSupported || isProcessing || isSpeaking) return;

    const lang = getLocaleMeta(locale).speechCode;
    const recognition = createSpeechRecognition(lang);
    if (!recognition) return;

    stopListening();
    setIsListening(true);

    const monitor = new MicLevelMonitor();
    micMonitorRef.current = monitor;
    await monitor.start(setMicLevel);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim();
      if (transcript && event.results[event.results.length - 1].isFinal) {
        setInput(transcript);
        stopListening();
        void sendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      stopListening();
      if (micEnabledRef.current) {
        setTimeout(() => startListeningRef.current?.(), 800);
      }
    };

    recognition.onend = () => {
      if (isListening && micEnabledRef.current && !isProcessing) {
        setMicLevel(0);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isProcessing, isListening, isSpeaking, locale, sendMessage, speechSupported, stopListening]);

  startListeningRef.current = startListening;

  const toggleMic = useCallback(async () => {
    if (!speechSupported) return;
    if (micEnabled) {
      setMicEnabled(false);
      stopListening();
      return;
    }
    const ok = await requestMicrophoneAccess();
    if (!ok) return;
    setMicEnabled(true);
    void startListening();
  }, [micEnabled, speechSupported, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeakerAnim();
    };
  }, [stopListening, stopSpeakerAnim]);

  return {
    messages,
    input,
    setInput,
    isProcessing,
    isListening,
    isSpeaking,
    micEnabled,
    speakerEnabled,
    setSpeakerEnabled,
    micLevel,
    speakerLevel,
    speechSupported,
    toggleMic,
    sendMessage,
    speak,
    ttsError
  };
}
