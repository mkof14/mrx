import { Medication } from '../types';

export interface InteractionFinding {
  ingredient_a: string;
  ingredient_b: string;
  severity_color?: string;
  summary_plain?: string;
  mechanism?: string;
  watch_for?: string[];
  source?: string;
}

function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(hydrochloride|hcl|sodium|oxalate|besylate|maleate)$/i, '')
    .trim();
}

export function getMedicationIngredients(med: Medication): string[] {
  const fromNormalized = med.normalized?.active_ingredients?.filter(Boolean) || [];
  if (fromNormalized.length > 0) return fromNormalized;
  return [med.display_name];
}

function ingredientsMatch(a: string, b: string): boolean {
  const na = normalizeIngredient(a);
  const nb = normalizeIngredient(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function medMatchesIngredient(med: Medication, ingredient: string): boolean {
  return getMedicationIngredients(med).some((ing) => ingredientsMatch(ing, ingredient));
}

export function findInteractionForPair(
  med1: Medication,
  med2: Medication,
  interactions: InteractionFinding[]
): InteractionFinding | undefined {
  return interactions.find(
    (int) =>
      (medMatchesIngredient(med1, int.ingredient_a) && medMatchesIngredient(med2, int.ingredient_b)) ||
      (medMatchesIngredient(med1, int.ingredient_b) && medMatchesIngredient(med2, int.ingredient_a))
  );
}

function pairKey(a: string, b: string): string {
  return [a.toLowerCase(), b.toLowerCase()].sort().join('|');
}

export function mergeInteractionLists(...lists: InteractionFinding[][]): InteractionFinding[] {
  const merged: InteractionFinding[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const item of list) {
      if (!item.ingredient_a || !item.ingredient_b) continue;
      const key = pairKey(item.ingredient_a, item.ingredient_b);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

export function countMedPairs(meds: Medication[]): number {
  const active = meds.filter((m) => m.status === 'ACTIVE');
  return (active.length * (active.length - 1)) / 2;
}
