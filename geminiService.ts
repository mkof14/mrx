
import { Viewpoint, UserProfile } from './types';
import { api, ApiError } from './services/apiClient';

export async function analyzeMedicationData(
  medications: unknown[],
  medicationEvents: unknown[],
  checkins: unknown[],
  viewpoint: Viewpoint,
  _userProfile: UserProfile
) {
  return api.ai.analyze({ medications, medicationEvents, checkins, viewpoint });
}

export async function scanMedicationImage(base64: string, mimeType?: string) {
  return api.ai.scan(base64, mimeType);
}

export async function parseMedicationText(text: string, locale?: string) {
  return api.ai.parseMedication(text, locale);
}

export async function generateSpeech(text: string, voice = 'Rachel') {
  return api.ai.tts(text, voice);
}

export function connectLiveSession(_callbacks: unknown, _userProfile: UserProfile): never {
  throw new ApiError(
    503,
    'Live voice consult requires a secure WebSocket proxy (Phase 2). Use Neural Chat for text assistance.'
  );
}

export { ApiError };
