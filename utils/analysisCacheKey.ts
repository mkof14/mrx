import type { Medication, MedicationEvent, SymptomEntry, UserProfile } from '../types';

/** Stable hash so we skip re-running AI when nothing material changed. */
export function buildAnalysisCacheKey(
  meds: Medication[],
  events: MedicationEvent[],
  checkins: SymptomEntry[],
  profile: UserProfile,
  viewpoint: string
): string {
  const payload = {
    viewpoint,
    profile: {
      allergies: profile.known_allergies,
      conditions: profile.preexisting_conditions,
      age: profile.age_years,
      sex: profile.sex_at_birth
    },
    meds: meds.map((m) => ({
      id: m.id,
      name: m.display_name,
      status: m.status,
      dose: m.current_dose,
      rxcui: m.normalized?.rxcui
    })),
    events: events.slice(0, 20).map((e) => ({ t: e.event_type, m: e.med_id, iso: e.event_iso })),
    checkins: checkins.slice(0, 14).map((c) => ({ iso: c.log_iso, s: c.symptom_scales }))
  };
  return JSON.stringify(payload);
}
