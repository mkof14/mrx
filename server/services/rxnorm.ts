const RXNAV_BASE = 'https://rxnav.nlm.nih.gov/REST';

const LOCAL_FALLBACK: Record<string, { ingredients: string[]; rxcui: string; route: string }> = {
  sertraline: { ingredients: ['Sertraline Hydrochloride'], rxcui: '36437', route: 'Oral' },
  zoloft: { ingredients: ['Sertraline Hydrochloride'], rxcui: '36437', route: 'Oral' },
  lexapro: { ingredients: ['Escitalopram Oxalate'], rxcui: '352741', route: 'Oral' },
  escitalopram: { ingredients: ['Escitalopram Oxalate'], rxcui: '352741', route: 'Oral' },
  ibuprofen: { ingredients: ['Ibuprofen'], rxcui: '5640', route: 'Oral' },
  xanax: { ingredients: ['Alprazolam'], rxcui: '596', route: 'Oral' },
  alprazolam: { ingredients: ['Alprazolam'], rxcui: '596', route: 'Oral' },
  metformin: { ingredients: ['Metformin Hydrochloride'], rxcui: '6809', route: 'Oral' },
  lisinopril: { ingredients: ['Lisinopril'], rxcui: '29046', route: 'Oral' }
};

export interface ResolvedMedication {
  display_name: string;
  active_ingredients: string[];
  rxcui: string | null;
  route: string;
  source: 'rxnorm' | 'local' | 'fallback';
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function resolveMedication(name: string): Promise<ResolvedMedication> {
  const trimmed = name.trim();
  const key = trimmed.toLowerCase();

  const local = LOCAL_FALLBACK[key];
  if (local) {
    return {
      display_name: trimmed,
      active_ingredients: local.ingredients,
      rxcui: local.rxcui,
      route: local.route,
      source: 'local'
    };
  }

  type ApproxResponse = {
    approximateGroup?: { candidate?: Array<{ rxcui?: string; name?: string }> };
  };

  const approx = await fetchJson<ApproxResponse>(
    `${RXNAV_BASE}/approximateTerm.json?term=${encodeURIComponent(trimmed)}&maxEntries=1`
  );

  const rxcui = approx?.approximateGroup?.candidate?.[0]?.rxcui;
  if (!rxcui) {
    return {
      display_name: trimmed,
      active_ingredients: [trimmed],
      rxcui: null,
      route: 'Oral',
      source: 'fallback'
    };
  }

  type RelatedResponse = {
    relatedGroup?: { conceptGroup?: Array<{ tty?: string; conceptProperties?: Array<{ name?: string }> }> };
  };

  const related = await fetchJson<RelatedResponse>(
    `${RXNAV_BASE}/rxcui/${rxcui}/related.json?tty=IN`
  );

  const ingredients =
    related?.relatedGroup?.conceptGroup
      ?.flatMap((g) => g.conceptProperties?.map((c) => c.name).filter(Boolean) as string[])
      .filter(Boolean) || [];

  return {
    display_name: trimmed,
    active_ingredients: ingredients.length > 0 ? ingredients : [trimmed],
    rxcui,
    route: 'Oral',
    source: 'rxnorm'
  };
}

/** Normalize UPC/EAN/NDC digits for RxNav NDC lookup. */
function normalizeBarcode(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12) return digits.slice(0, 11);
  return digits;
}

function formatNdc(digits: string): string | null {
  if (digits.length === 11) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return null;
}

export async function resolveBarcode(code: string): Promise<ResolvedMedication> {
  const digits = normalizeBarcode(code.trim());
  const ndc = formatNdc(digits);

  if (ndc) {
    type NdcResponse = {
      ndcStatus?: { rxcui?: string; conceptName?: string; status?: string };
    };
    const ndcRes = await fetchJson<NdcResponse>(
      `${RXNAV_BASE}/ndcstatus.json?ndc=${encodeURIComponent(ndc)}`
    );
    const status = ndcRes?.ndcStatus;
    if (status?.rxcui) {
      const name = status.conceptName || ndc;
      const resolved = await resolveMedication(name);
      return { ...resolved, display_name: name, rxcui: status.rxcui, source: 'rxnorm' };
    }
  }

  if (digits.length >= 8) {
    type PropertiesResponse = {
      ndcProperties?: { ndcProperty?: Array<{ rxcui?: string; name?: string }> };
    };
    const props = await fetchJson<PropertiesResponse>(
      `${RXNAV_BASE}/ndcproperties.json?id=${encodeURIComponent(digits)}`
    );
    const prop = props?.ndcProperties?.ndcProperty?.[0];
    if (prop?.name) {
      const resolved = await resolveMedication(prop.name);
      return { ...resolved, display_name: prop.name, rxcui: prop.rxcui || resolved.rxcui };
    }
  }

  return {
    display_name: code.trim(),
    active_ingredients: [code.trim()],
    rxcui: null,
    route: 'Oral',
    source: 'fallback'
  };
}

export function extractRxcuis(medications: unknown[]): string[] {
  const cuis = new Set<string>();
  for (const med of medications) {
    const m = med as { normalized?: { rxcui?: string | null } };
    if (m.normalized?.rxcui) cuis.add(m.normalized.rxcui);
  }
  return [...cuis];
}
