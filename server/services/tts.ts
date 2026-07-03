import { generateSpeech as generateSpeechGemini, isGeminiConfigured } from './gemini.js';
import {
  ELEVENLABS_VOICES,
  generateSpeechElevenLabs,
  isElevenLabsConfigured,
  normalizeVoiceName
} from './elevenlabs.js';
import { sanitizeTextForSpeech } from '../lib/ttsText.js';

export type TtsFormat = 'mp3' | 'pcm';
export type TtsProvider = 'elevenlabs' | 'gemini';

export interface TtsResult {
  audio: string | null;
  format: TtsFormat;
  sampleRate?: number;
  provider: TtsProvider;
  voice: string;
}

export function isTtsConfigured(): boolean {
  return isElevenLabsConfigured() || isGeminiConfigured();
}

export function getTtsProvider(): TtsProvider | null {
  if (isElevenLabsConfigured()) return 'elevenlabs';
  if (isGeminiConfigured()) return 'gemini';
  return null;
}

export function getAvailableVoices(): string[] {
  if (isElevenLabsConfigured()) {
    return Object.keys(ELEVENLABS_VOICES);
  }
  return ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
}

export async function generateSpeech(text: string, voice?: string): Promise<TtsResult> {
  const spokenText = sanitizeTextForSpeech(text);
  const normalizedVoice = isElevenLabsConfigured() ? normalizeVoiceName(voice) : voice || 'Zephyr';

  if (isElevenLabsConfigured()) {
    const audio = await generateSpeechElevenLabs(spokenText, normalizedVoice);
    return {
      audio,
      format: 'mp3',
      provider: 'elevenlabs',
      voice: normalizedVoice
    };
  }

  if (isGeminiConfigured()) {
    const audio = await generateSpeechGemini(spokenText, voice);
    return {
      audio,
      format: 'pcm',
      sampleRate: 24000,
      provider: 'gemini',
      voice: voice || 'Zephyr'
    };
  }

  throw new Error('No TTS provider configured. Set ELEVENLABS_API_KEY or GEMINI_API_KEY.');
}
