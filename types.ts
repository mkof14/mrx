
export enum Viewpoint {
  CONSERVATIVE = 'CONSERVATIVE',
  BALANCED = 'BALANCED',
  EXPLORATORY = 'EXPLORATORY'
}

export enum RiskColor {
  RED = 'RED',
  ORANGE = 'ORANGE',
  YELLOW = 'YELLOW',
  BLUE = 'BLUE',
  GRAY = 'GRAY'
}

export enum SafetyEscalation {
  NONE = 'NONE',
  CAUTION = 'CAUTION',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY'
}

export interface Medication {
  id: string;
  display_name: string;
  normalized: {
    active_ingredients: string[];
    route: string | null;
    form: string | null;
    rxcui?: string | null;
  };
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  current_dose: {
    amount: string | null;
    unit: string | null;
    frequency_per_day: number | null;
    schedule_notes: string | null;
  };
}

export interface MedicationEvent {
  event_id: string;
  med_id: string;
  event_type: 'START' | 'DOSE_INCREASE' | 'DOSE_DECREASE' | 'STOP' | 'PAUSE' | 'RESUME' | 'MISSED_DOSE';
  event_iso: string;
  dose_snapshot: {
    amount: string | null;
    unit: string | null;
    frequency_per_day: number | null;
  };
  notes: string | null;
}

export interface SymptomEntry {
  log_iso: string;
  sleep_hours: number | null;
  alcohol: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | null;
  high_stress: boolean | null;
  new_supplement: boolean | null;
  symptom_scales: {
    sleep_quality: number | null;
    anxiety: number | null;
    mood_low: number | null;
    irritability: number | null;
    energy_low: number | null;
    focus_low: number | null;
    libido_low: number | null;
    nausea: number | null;
    headache: number | null;
    palpitations: number | null;
  };
  notes: string | null;
}

export type AIVoice = 'Rachel' | 'Adam' | 'Bella' | 'Antoni' | 'Elli';

/** Voices shown in UI when ElevenLabs is the TTS provider */
export const ELEVENLABS_VOICE_OPTIONS: AIVoice[] = ['Rachel', 'Adam', 'Bella', 'Antoni', 'Elli'];

/** Legacy Gemini voices — mapped to ElevenLabs on the server */
export const LEGACY_GEMINI_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'] as const;

export type LegacyGeminiVoice = (typeof LEGACY_GEMINI_VOICES)[number];

export function normalizePreferredVoice(voice?: string): AIVoice {
  const map: Record<string, AIVoice> = {
    Rachel: 'Rachel',
    Adam: 'Adam',
    Bella: 'Bella',
    Antoni: 'Antoni',
    Elli: 'Elli',
    Zephyr: 'Rachel',
    Puck: 'Antoni',
    Charon: 'Adam',
    Kore: 'Bella',
    Fenrir: 'Elli'
  };
  return map[voice || ''] || 'Rachel';
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  age_years: number | null;
  sex_at_birth: 'FEMALE' | 'MALE' | 'UNKNOWN' | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  preferred_units: 'METRIC' | 'IMPERIAL';
  preferred_voice: AIVoice;
  speech_speed: number;
  preferred_language?: 'en' | 'es' | 'de' | 'fr' | 'zh' | 'he' | 'ar' | 'uk' | 'ru';
  pregnancy_possible: boolean | null;
  preexisting_conditions: string[];
  known_allergies: string[];
  allergies_confirmed_none?: boolean;
  adverse_drug_reactions: string[];
  current_supplements: string[];
  smoking_status: 'NEVER' | 'FORMER' | 'CURRENT' | null;
  alcohol_use: 'NONE' | 'OCCASIONAL' | 'REGULAR' | null;
  kidney_function: 'NORMAL' | 'REDUCED' | 'DIALYSIS' | 'UNKNOWN' | null;
  liver_function: 'NORMAL' | 'REDUCED' | 'UNKNOWN' | null;
  is_pregnant: boolean | null;
  is_breastfeeding: boolean | null;
  on_blood_thinner: boolean | null;
  pharmacogenomics_notes?: string;
  goals: string[];
  onboarded: boolean;
  is_subscribed: boolean;
  subscription_end_date?: string;
  ai_audit_consent?: boolean;
  emergency_region?: 'US' | 'EU' | 'RU' | 'UK' | 'IL' | 'CN' | 'DEFAULT' | null;
}
