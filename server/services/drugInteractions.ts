const RXNAV_INTERACTION = 'https://rxnav.nlm.nih.gov/REST/interaction/list.json';

export interface VerifiedInteraction {
  ingredient_a: string;
  ingredient_b: string;
  severity_color: 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE' | 'GRAY';
  summary_plain: string;
  mechanism: string;
  watch_for: string[];
  source: 'rxnav' | 'ai';
}

function mapSeverity(description: string): VerifiedInteraction['severity_color'] {
  const d = description.toLowerCase();
  if (d.includes('major') || d.includes('contraind')) return 'RED';
  if (d.includes('moderate') || d.includes('significant')) return 'ORANGE';
  if (d.includes('minor') || d.includes('mild')) return 'YELLOW';
  return 'ORANGE';
}

export async function fetchVerifiedInteractions(rxcuis: string[]): Promise<VerifiedInteraction[]> {
  const valid = [...new Set(rxcuis.filter(Boolean))];
  if (valid.length < 2) return [];

  try {
    const url = `${RXNAV_INTERACTION}?rxcuis=${valid.join('+')}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      fullInteractionTypeGroup?: Array<{
        interactionPair?: Array<{
          interactionConcept?: Array<{ minConceptItem?: { name?: string } }>;
          severity?: string;
          description?: string;
        }>;
      }>;
    };

    const findings: VerifiedInteraction[] = [];
    const groups = data.fullInteractionTypeGroup || [];

    for (const group of groups) {
      for (const pair of group.interactionPair || []) {
        const concepts = pair.interactionConcept || [];
        const a = concepts[0]?.minConceptItem?.name;
        const b = concepts[1]?.minConceptItem?.name;
        if (!a || !b) continue;

        const description = pair.description || 'Potential drug interaction reported by RxNav.';
        findings.push({
          ingredient_a: a,
          ingredient_b: b,
          severity_color: mapSeverity(pair.severity || description),
          summary_plain: description,
          mechanism: pair.severity ? `RxNav severity: ${pair.severity}` : 'RxNav drug-drug interaction',
          watch_for: ['Monitor for new or worsening symptoms', 'Discuss with your pharmacist or doctor'],
          source: 'rxnav'
        });
      }
    }

    return findings;
  } catch (err) {
    console.error('RxNav interaction fetch failed:', err);
    return [];
  }
}

export function mergeInteractionFindings(
  verified: VerifiedInteraction[],
  aiFindings: unknown[]
): VerifiedInteraction[] {
  const merged: VerifiedInteraction[] = [...verified];
  const key = (a: string, b: string) => [a.toLowerCase(), b.toLowerCase()].sort().join('|');

  const seen = new Set(verified.map((v) => key(v.ingredient_a, v.ingredient_b)));

  for (const raw of aiFindings) {
    const f = raw as Partial<VerifiedInteraction>;
    if (!f.ingredient_a || !f.ingredient_b) continue;
    const k = key(f.ingredient_a, f.ingredient_b);
    if (!seen.has(k)) {
      merged.push({
        ingredient_a: f.ingredient_a,
        ingredient_b: f.ingredient_b,
        severity_color: f.severity_color || 'ORANGE',
        summary_plain: f.summary_plain || 'Potential interaction identified by AI analysis.',
        mechanism: f.mechanism || 'AI pharmacological synthesis',
        watch_for: f.watch_for || ['Monitor for new symptoms'],
        source: 'ai'
      });
      seen.add(k);
    }
  }

  return merged;
}
