export type MedFillSource = 'type' | 'photo' | 'paste' | 'voice' | 'barcode';

export interface ParsedMedication {
  name?: string;
  strength?: string;
  unit?: string;
  frequency?: number;
  notes?: string;
}

export interface DoseFormState {
  amount: string;
  unit: string;
  frequency: number;
  startDate: string;
  notes: string;
}

export function frequencyLabel(freq: number, t: (k: string) => string): string {
  if (freq === 1) return t('meds.freq1');
  if (freq === 2) return t('meds.freq2');
  if (freq === 3) return t('meds.freq3');
  return `${freq}× / day`;
}

export function applyParsedMedication(
  parsed: ParsedMedication,
  setDose: (fn: (d: DoseFormState) => DoseFormState) => void
): Partial<DoseFormState> {
  const next: Partial<DoseFormState> = {};
  if (parsed.strength) next.amount = String(parsed.strength);
  if (parsed.unit) next.unit = parsed.unit;
  if (parsed.frequency && parsed.frequency > 0) next.frequency = Math.min(6, Math.round(parsed.frequency));
  if (parsed.notes) next.notes = parsed.notes;
  if (Object.keys(next).length) {
    setDose((d) => ({ ...d, ...next }));
  }
  return next;
}
