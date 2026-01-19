
/**
 * Simulated RxNorm Resolver for BioMath Core
 * In a production environment, this would call the NIH RxNorm API.
 */
export const resolveMedication = (name: string) => {
  const dictionary: Record<string, { ingredients: string[], cui: string, route: string }> = {
    'sertraline': { ingredients: ['Sertraline Hydrochloride'], cui: '36437', route: 'Oral' },
    'zoloft': { ingredients: ['Sertraline Hydrochloride'], cui: '36437', route: 'Oral' },
    'lexapro': { ingredients: ['Escitalopram Oxalate'], cui: '352741', route: 'Oral' },
    'escitalopram': { ingredients: ['Escitalopram Oxalate'], cui: '352741', route: 'Oral' },
    'fluoxetine': { ingredients: ['Fluoxetine'], cui: '4491', route: 'Oral' },
    'prozac': { ingredients: ['Fluoxetine'], cui: '4491', route: 'Oral' },
    'ibuprofen': { ingredients: ['Ibuprofen'], cui: '5640', route: 'Oral' },
    'advil': { ingredients: ['Ibuprofen'], cui: '5640', route: 'Oral' },
    'motrin': { ingredients: ['Ibuprofen'], cui: '5640', route: 'Oral' },
    'xanax': { ingredients: ['Alprazolam'], cui: '596', route: 'Oral' },
    'alprazolam': { ingredients: ['Alprazolam'], cui: '596', route: 'Oral' },
    'adderall': { ingredients: ['Amphetamine', 'Dextroamphetamine'], cui: '213169', route: 'Oral' },
    'vyvanse': { ingredients: ['Lisdexamfetamine'], cui: '1000', route: 'Oral' },
    'wellbutrin': { ingredients: ['Bupropion'], cui: '42347', route: 'Oral' },
    'bupropion': { ingredients: ['Bupropion'], cui: '42347', route: 'Oral' },
    'quetiapine': { ingredients: ['Quetiapine'], cui: '51272', route: 'Oral' },
    'seroquel': { ingredients: ['Quetiapine'], cui: '51272', route: 'Oral' },
    'atorvastatin': { ingredients: ['Atorvastatin'], cui: '83367', route: 'Oral' },
    'lipitor': { ingredients: ['Atorvastatin'], cui: '83367', route: 'Oral' },
    'levothyroxine': { ingredients: ['Levothyroxine Sodium'], cui: '10582', route: 'Oral' },
    'synthroid': { ingredients: ['Levothyroxine Sodium'], cui: '10582', route: 'Oral' },
    'metformin': { ingredients: ['Metformin Hydrochloride'], cui: '6809', route: 'Oral' },
    'glucophage': { ingredients: ['Metformin Hydrochloride'], cui: '6809', route: 'Oral' },
    'lisinopril': { ingredients: ['Lisinopril'], cui: '29046', route: 'Oral' },
    'zestril': { ingredients: ['Lisinopril'], cui: '29046', route: 'Oral' },
    'amlodipine': { ingredients: ['Amlodipine'], cui: '17767', route: 'Oral' },
    'norvasc': { ingredients: ['Amlodipine'], cui: '17767', route: 'Oral' },
    'simvastatin': { ingredients: ['Simvastatin'], cui: '36567', route: 'Oral' },
    'zocor': { ingredients: ['Simvastatin'], cui: '36567', route: 'Oral' },
    'omeprazole': { ingredients: ['Omeprazole'], cui: '7646', route: 'Oral' },
    'prilosec': { ingredients: ['Omeprazole'], cui: '7646', route: 'Oral' },
    'aspirin': { ingredients: ['Aspirin'], cui: '1191', route: 'Oral' },
    'acetaminophen': { ingredients: ['Acetaminophen'], cui: '161', route: 'Oral' },
    'tylenol': { ingredients: ['Acetaminophen'], cui: '161', route: 'Oral' },
    'naproxen': { ingredients: ['Naproxen'], cui: '7258', route: 'Oral' },
    'aleve': { ingredients: ['Naproxen'], cui: '7258', route: 'Oral' },
  };

  const normalizedKey = name.toLowerCase().trim();
  return dictionary[normalizedKey] || { 
    ingredients: [name], 
    cui: 'UNKNOWN', 
    route: 'Oral' 
  };
};

export const getInteractionKnowledge = (ingredients: string[]) => {
  // Mock precomputed interaction facts based on ingredients
  const facts = [];
  if (ingredients.some(i => i.includes('Alprazolam')) && ingredients.some(i => i.includes('Sertraline'))) {
    facts.push({
      drug_a: 'Alprazolam',
      drug_b: 'Sertraline',
      mechanism: 'CNS_DEPRESSANT_LOAD',
      severity: 'YELLOW',
      summary: 'Combined use may increase drowsiness and coordination issues.'
    });
  }
  return facts;
};
