import { normalizeVoiceName } from '../services/elevenlabs.js';

export function defaultProfile(userId: string, email: string, name?: string) {
  return {
    id: userId,
    email,
    name: name || '',
    age_years: null,
    sex_at_birth: 'UNKNOWN' as const,
    weight_kg: null,
    height_cm: null,
    preferred_units: 'METRIC' as const,
    preferred_voice: 'Rachel' as const,
    speech_speed: 1.0,
    preferred_language: 'en' as const,
    pregnancy_possible: false,
    preexisting_conditions: [] as string[],
    known_allergies: [] as string[],
    allergies_confirmed_none: false,
    adverse_drug_reactions: [] as string[],
    current_supplements: [] as string[],
    smoking_status: null,
    alcohol_use: null,
    kidney_function: null,
    liver_function: null,
    is_pregnant: null,
    is_breastfeeding: null,
    on_blood_thinner: null,
    pharmacogenomics_notes: '',
    goals: [] as string[],
    onboarded: false,
    is_subscribed: false
  };
}

export function isValidProfile(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return typeof p.email === 'string' && typeof p.onboarded === 'boolean';
}

export function resolveProfile(userId: string, email: string, stored: unknown) {
  const base = isValidProfile(stored)
    ? { ...defaultProfile(userId, email), ...(stored as Record<string, unknown>), id: userId, email }
    : defaultProfile(userId, email);

  return {
    ...base,
    preferred_voice: normalizeVoiceName(String(base.preferred_voice || 'Rachel'))
  };
}
