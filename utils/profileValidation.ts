import type { UserProfile } from '../types';

export interface ProfileValidationResult {
  valid: boolean;
  errors: string[];
}

export function parseAge(value: string): number | null {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 1 || n > 120) return null;
  return n;
}

export function validateProfileBasics(profile: UserProfile, requireAllergiesConfirm = false): ProfileValidationResult {
  const errors: string[] = [];

  if (!profile.name?.trim() || profile.name.trim().length < 2) {
    errors.push('name');
  }

  if (profile.age_years == null || profile.age_years < 1 || profile.age_years > 120) {
    errors.push('age');
  }

  if (profile.weight_kg != null && (profile.weight_kg < 20 || profile.weight_kg > 300)) {
    errors.push('weight');
  }

  if (profile.height_cm != null && (profile.height_cm < 50 || profile.height_cm > 250)) {
    errors.push('height');
  }

  if (requireAllergiesConfirm && profile.known_allergies.length === 0 && !profile.allergies_confirmed_none) {
    errors.push('allergies');
  }

  return { valid: errors.length === 0, errors };
}

export function normalizeProfileFields(profile: UserProfile): UserProfile {
  return {
    ...profile,
    name: profile.name?.trim() || '',
    age_years: profile.age_years && profile.age_years > 0 ? profile.age_years : null,
    preexisting_conditions: profile.preexisting_conditions.filter(Boolean),
    known_allergies: profile.known_allergies.filter(Boolean)
  };
}
