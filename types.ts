
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

export type AIVoice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

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
  pregnancy_possible: boolean | null;
  preexisting_conditions: string[];
  known_allergies: string[];
  goals: string[];
  onboarded: boolean;
  is_subscribed: boolean;
  subscription_end_date?: string;
}
