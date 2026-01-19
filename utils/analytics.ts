
import { SymptomEntry, Medication } from '../types';

/**
 * BioMath Stability Core
 * Calculates a physiological stability score (0.0 - 1.0)
 * Weights variance in critical symptoms (palpitations, anxiety) more heavily.
 */
export const calculateStabilityIndex = (checkins: SymptomEntry[], medications: Medication[] = []) => {
  if (checkins.length < 3) return 1.0;
  
  const recent = checkins.slice(0, 10);
  let totalWeightedVariance = 0;
  
  // High-risk medication inventory impacts sensitivity
  const hasHighRiskMeds = medications.some(m => {
    const n = m.display_name.toLowerCase();
    return ['adderall', 'xanax', 'lithium', 'clonazepam', 'zoloft', 'lexapro'].some(risk => n.includes(risk));
  });

  const sensitivityFactor = hasHighRiskMeds ? 1.5 : 1.0;

  // Keys to track with their clinical weights
  const weights: Record<string, number> = {
    mood_low: 1.0,
    anxiety: 1.5,
    energy_low: 1.0,
    palpitations: 2.5, // Cardiac awareness is a high-priority stability factor
    sleep_quality: 1.2
  };

  Object.entries(weights).forEach(([key, weight]) => {
    const values = recent.map(c => (c.symptom_scales as any)[key] || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    totalWeightedVariance += (variance * weight);
  });

  // Normalize: A score of 0 means extreme volatility, 1.0 means perfect stability
  const maxAcceptableVariance = 12 * sensitivityFactor;
  const index = Math.max(0, 1 - (totalWeightedVariance / maxAcceptableVariance));
  
  return parseFloat(index.toFixed(2));
};
