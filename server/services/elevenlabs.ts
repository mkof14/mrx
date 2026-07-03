export const ELEVENLABS_VOICES = {
  Rachel: { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel', tone: 'Calm, clear' },
  Adam: { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam', tone: 'Deep, steady' },
  Bella: { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella', tone: 'Soft, warm' },
  Antoni: { id: 'ErXwobaYiN019PkySvjV', label: 'Antoni', tone: 'Friendly male' },
  Elli: { id: 'MF3mGyEYCl7XYWbV9V6O', label: 'Elli', tone: 'Bright, youthful' }
} as const;

export type ElevenLabsVoiceName = keyof typeof ELEVENLABS_VOICES;

const LEGACY_GEMINI_VOICES: Record<string, ElevenLabsVoiceName> = {
  Zephyr: 'Rachel',
  Puck: 'Antoni',
  Charon: 'Adam',
  Kore: 'Bella',
  Fenrir: 'Elli'
};

const API_KEY = process.env.ELEVENLABS_API_KEY || '';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

export function isElevenLabsConfigured(): boolean {
  return Boolean(API_KEY);
}

export function getElevenLabsModelId(): string {
  return MODEL_ID;
}

export function normalizeVoiceName(voice?: string): ElevenLabsVoiceName {
  if (!voice) return 'Rachel';
  if (voice in ELEVENLABS_VOICES) return voice as ElevenLabsVoiceName;
  if (voice in LEGACY_GEMINI_VOICES) return LEGACY_GEMINI_VOICES[voice];
  return 'Rachel';
}

export function resolveVoiceId(voice?: string): string {
  return ELEVENLABS_VOICES[normalizeVoiceName(voice)].id;
}

export async function listElevenLabsVoices(): Promise<Array<{ id: string; name: string }>> {
  if (!API_KEY) return [];

  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': API_KEY }
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { voices?: Array<{ voice_id: string; name: string }> };
  return (data.voices || []).map((v) => ({ id: v.voice_id, name: v.name }));
}

export async function generateSpeechElevenLabs(text: string, voice?: string): Promise<string | null> {
  if (!API_KEY) {
    throw new Error('ElevenLabs API key is not configured');
  }

  const cleanText = text.trim().slice(0, 5000);
  if (!cleanText) return null;

  const voiceId = resolveVoiceId(voice);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.28,
        similarity_boost: 0.72,
        style: 0.35,
        use_speaker_boost: true
      }
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${detail}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString('base64');
}
