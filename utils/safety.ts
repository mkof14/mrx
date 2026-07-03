import {
  Medication,
  SymptomEntry,
  SafetyEscalation,
  RiskColor
} from '../types';

export interface SafetyAlert {
  id: string;
  type: 'LOCAL' | 'AI' | 'STABILITY';
  sev: SafetyEscalation;
  color: RiskColor;
  text: string;
  action?: string;
}

interface AnalysisResult {
  safety_flags?: Array<{
    flag_type?: string;
    risk_color?: string;
    trigger_plain?: string;
    user_action_plain?: string;
  }>;
  interaction_findings?: Array<{
    severity_color?: string;
    ingredient_a?: string;
    ingredient_b?: string;
  }>;
}

const SEV_MAP: Record<string, SafetyEscalation> = {
  EMERGENCY: SafetyEscalation.EMERGENCY,
  URGENT: SafetyEscalation.URGENT,
  CAUTION: SafetyEscalation.CAUTION,
  NONE: SafetyEscalation.NONE
};

const COLOR_MAP: Record<string, RiskColor> = {
  RED: RiskColor.RED,
  ORANGE: RiskColor.ORANGE,
  YELLOW: RiskColor.YELLOW,
  BLUE: RiskColor.BLUE,
  GRAY: RiskColor.GRAY
};

export function buildSafetyAlerts(
  checkins: SymptomEntry[],
  medications: Medication[],
  analysisResult: AnalysisResult | null | undefined,
  stabilityIndex: number
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const latestScores = checkins[0]?.symptom_scales;

  if (latestScores) {
    if ((latestScores.palpitations || 0) > 8 && (latestScores.anxiety || 0) > 8) {
      alerts.push({
        id: 'local-cardio',
        type: 'LOCAL',
        sev: SafetyEscalation.EMERGENCY,
        color: RiskColor.RED,
        text: 'Severe cardiovascular response detected. Immediate professional evaluation is mandatory.',
        action: 'Call emergency services if symptoms are acute.'
      });
    }
    if ((latestScores.nausea || 0) > 8 && (latestScores.headache || 0) > 8) {
      alerts.push({
        id: 'local-neuro',
        type: 'LOCAL',
        sev: SafetyEscalation.URGENT,
        color: RiskColor.ORANGE,
        text: 'Acute neurological discomfort pattern detected in recent check-in.',
        action: 'Contact your clinician if symptoms persist.'
      });
    }
  }

  if (stabilityIndex < 0.45 && medications.length > 0 && checkins.length >= 3) {
    alerts.push({
      id: 'stability-low',
      type: 'STABILITY',
      sev: SafetyEscalation.CAUTION,
      color: RiskColor.YELLOW,
      text: `Bio-stability index is low (${(stabilityIndex * 100).toFixed(0)}%). Symptom variance exceeds your baseline.`,
      action: 'Review recent medication changes and discuss with your doctor.'
    });
  }

  for (const flag of analysisResult?.safety_flags || []) {
    const color = COLOR_MAP[flag.risk_color || 'ORANGE'] || RiskColor.ORANGE;
    const sev =
      color === RiskColor.RED
        ? SafetyEscalation.EMERGENCY
        : color === RiskColor.ORANGE
          ? SafetyEscalation.URGENT
          : SafetyEscalation.CAUTION;

    alerts.push({
      id: `ai-${flag.flag_type || 'flag'}-${alerts.length}`,
      type: 'AI',
      sev,
      color,
      text: flag.trigger_plain || 'AI safety flag detected.',
      action: flag.user_action_plain
    });
  }

  const criticalInteractions = (analysisResult?.interaction_findings || []).filter(
    (i) => i.severity_color === 'RED'
  );
  if (criticalInteractions.length > 0 && !alerts.some((a) => a.sev === SafetyEscalation.EMERGENCY)) {
    alerts.push({
      id: 'ai-ddi-critical',
      type: 'AI',
      sev: SafetyEscalation.URGENT,
      color: RiskColor.RED,
      text: `${criticalInteractions.length} critical drug interaction(s) detected: ${criticalInteractions
        .map((i) => `${i.ingredient_a} + ${i.ingredient_b}`)
        .join('; ')}`,
      action: 'Review the Interaction Map and consult your pharmacist or doctor.'
    });
  }

  const rank = (s: SafetyEscalation) =>
    s === SafetyEscalation.EMERGENCY ? 4 : s === SafetyEscalation.URGENT ? 3 : s === SafetyEscalation.CAUTION ? 2 : 1;

  return alerts.sort((a, b) => rank(b.sev) - rank(a.sev));
}

export function hasEmergencyAlert(alerts: SafetyAlert[]): boolean {
  return alerts.some((a) => a.sev === SafetyEscalation.EMERGENCY);
}
