function joinList(value: unknown): string {
  return Array.isArray(value) ? value.filter(Boolean).join(', ') : '';
}

export function formatClinicalProfileSummary(profile: Record<string, unknown>): string {
  const lines = [
    `Name: ${profile.name || 'unknown'}`,
    `Age: ${profile.age_years ?? '?'} | Sex: ${profile.sex_at_birth ?? '?'}`,
    `Weight kg: ${profile.weight_kg ?? '?'} | Height cm: ${profile.height_cm ?? '?'}`,
    `Allergies: ${joinList(profile.known_allergies) || 'none reported'}`,
    `Conditions: ${joinList(profile.preexisting_conditions) || 'none reported'}`,
    `Past adverse drug reactions: ${joinList(profile.adverse_drug_reactions).replace(/,/g, ';') || 'none reported'}`,
    `Supplements/OTC: ${joinList(profile.current_supplements) || 'none reported'}`,
    `Smoking: ${profile.smoking_status || 'unknown'} | Alcohol: ${profile.alcohol_use || 'unknown'}`,
    `Kidney function: ${profile.kidney_function || 'unknown'} | Liver: ${profile.liver_function || 'unknown'}`,
    `Pregnant: ${profile.is_pregnant ?? '?'} | Breastfeeding: ${profile.is_breastfeeding ?? '?'}`,
    `Blood thinner / anticoagulant: ${profile.on_blood_thinner ? 'yes' : profile.on_blood_thinner === false ? 'no' : 'unknown'}`,
    `Pharmacogenomics notes: ${profile.pharmacogenomics_notes || 'none'}`
  ];
  return lines.join('\n');
}
