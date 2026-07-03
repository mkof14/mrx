
/**
 * Local RxNorm fallback when the server API is unavailable.
 * Primary resolution runs via POST /api/medications/resolve (NIH RxNorm API).
 */
export const resolveMedicationLocal = (name: string) => {
  const dictionary: Record<string, { ingredients: string[]; rxcui: string; route: string }> = {
    sertraline: { ingredients: ['Sertraline Hydrochloride'], rxcui: '36437', route: 'Oral' },
    zoloft: { ingredients: ['Sertraline Hydrochloride'], rxcui: '36437', route: 'Oral' },
    lexapro: { ingredients: ['Escitalopram Oxalate'], rxcui: '352741', route: 'Oral' },
    escitalopram: { ingredients: ['Escitalopram Oxalate'], rxcui: '352741', route: 'Oral' },
    fluoxetine: { ingredients: ['Fluoxetine'], rxcui: '4491', route: 'Oral' },
    prozac: { ingredients: ['Fluoxetine'], rxcui: '4491', route: 'Oral' },
    ibuprofen: { ingredients: ['Ibuprofen'], rxcui: '5640', route: 'Oral' },
    advil: { ingredients: ['Ibuprofen'], rxcui: '5640', route: 'Oral' },
    motrin: { ingredients: ['Ibuprofen'], rxcui: '5640', route: 'Oral' },
    xanax: { ingredients: ['Alprazolam'], rxcui: '596', route: 'Oral' },
    alprazolam: { ingredients: ['Alprazolam'], rxcui: '596', route: 'Oral' },
    adderall: { ingredients: ['Amphetamine', 'Dextroamphetamine'], rxcui: '213169', route: 'Oral' },
    vyvanse: { ingredients: ['Lisdexamfetamine'], rxcui: '1000', route: 'Oral' },
    wellbutrin: { ingredients: ['Bupropion'], rxcui: '42347', route: 'Oral' },
    bupropion: { ingredients: ['Bupropion'], rxcui: '42347', route: 'Oral' },
    quetiapine: { ingredients: ['Quetiapine'], rxcui: '51272', route: 'Oral' },
    seroquel: { ingredients: ['Quetiapine'], rxcui: '51272', route: 'Oral' },
    atorvastatin: { ingredients: ['Atorvastatin'], rxcui: '83367', route: 'Oral' },
    lipitor: { ingredients: ['Atorvastatin'], rxcui: '83367', route: 'Oral' },
    levothyroxine: { ingredients: ['Levothyroxine Sodium'], rxcui: '10582', route: 'Oral' },
    synthroid: { ingredients: ['Levothyroxine Sodium'], rxcui: '10582', route: 'Oral' },
    metformin: { ingredients: ['Metformin Hydrochloride'], rxcui: '6809', route: 'Oral' },
    glucophage: { ingredients: ['Metformin Hydrochloride'], rxcui: '6809', route: 'Oral' },
    lisinopril: { ingredients: ['Lisinopril'], rxcui: '29046', route: 'Oral' },
    zestril: { ingredients: ['Lisinopril'], rxcui: '29046', route: 'Oral' },
    amlodipine: { ingredients: ['Amlodipine'], rxcui: '17767', route: 'Oral' },
    norvasc: { ingredients: ['Amlodipine'], rxcui: '17767', route: 'Oral' },
    simvastatin: { ingredients: ['Simvastatin'], rxcui: '36567', route: 'Oral' },
    zocor: { ingredients: ['Simvastatin'], rxcui: '36567', route: 'Oral' },
    omeprazole: { ingredients: ['Omeprazole'], rxcui: '7646', route: 'Oral' },
    prilosec: { ingredients: ['Omeprazole'], rxcui: '7646', route: 'Oral' },
    aspirin: { ingredients: ['Aspirin'], rxcui: '1191', route: 'Oral' },
    acetaminophen: { ingredients: ['Acetaminophen'], rxcui: '161', route: 'Oral' },
    tylenol: { ingredients: ['Acetaminophen'], rxcui: '161', route: 'Oral' },
    naproxen: { ingredients: ['Naproxen'], rxcui: '7258', route: 'Oral' },
    aleve: { ingredients: ['Naproxen'], rxcui: '7258', route: 'Oral' }
  };

  const normalizedKey = name.toLowerCase().trim();
  return (
    dictionary[normalizedKey] || {
      ingredients: [name],
      rxcui: 'UNKNOWN',
      route: 'Oral'
    }
  );
};

/** @deprecated Use api.medications.resolve() — kept for offline fallback */
export const resolveMedication = resolveMedicationLocal;
