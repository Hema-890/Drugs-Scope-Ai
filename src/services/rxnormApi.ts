import { VERIFIED_DRUGS } from '../data/mockDrugs';

export interface MedicationSuggestion {
  name: string;
  rxcui?: string;
  type: 'generic' | 'brand' | 'combination' | 'substance';
  synonyms?: string[];
}

export interface ResolvedMedicationIdentity {
  status: 'RESOLVED' | 'UNRECOGNIZED' | 'AMBIGUOUS';
  inputQuery: string;
  genericName: string;
  brandName?: string;
  rxcui: string;
  drugClass: string;
  formType: 'generic_ingredient' | 'brand_name' | 'combination_product' | 'substance' | 'salt_form' | 'unknown';
  activeIngredients: string[];
  synonyms: string[];
  atcCode?: string;
  source: 'Live NIH RxNav API' | 'Drug Scope Clinical Terminology Registry';
  unresolvedReason?: string;
  latencyMs: number;
}

// Curated reference dictionary of essential medicines, brands, combinations, and substances
const CLINICAL_TERMINOLOGY_MAP: Record<
  string,
  {
    genericName: string;
    brandName?: string;
    rxcui: string;
    drugClass: string;
    formType: 'generic_ingredient' | 'brand_name' | 'combination_product' | 'substance' | 'salt_form';
    activeIngredients: string[];
    synonyms: string[];
    atcCode?: string;
  }
> = {
  // Anticoagulants
  warfarin: {
    genericName: 'Warfarin',
    brandName: 'Coumadin',
    rxcui: '11289',
    drugClass: 'Vitamin K Antagonist (Anticoagulant)',
    formType: 'generic_ingredient',
    activeIngredients: ['Warfarin'],
    synonyms: ['Coumadin', 'Jantoven', 'Marevan'],
    atcCode: 'B01AA03'
  },
  coumadin: {
    genericName: 'Warfarin',
    brandName: 'Coumadin',
    rxcui: '11289',
    drugClass: 'Vitamin K Antagonist (Anticoagulant)',
    formType: 'brand_name',
    activeIngredients: ['Warfarin'],
    synonyms: ['Warfarin', 'Jantoven'],
    atcCode: 'B01AA03'
  },
  // Antiarrhythmics
  amiodarone: {
    genericName: 'Amiodarone',
    brandName: 'Cordarone',
    rxcui: '703',
    drugClass: 'Class III Antiarrhythmic / CYP2C9 Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Amiodarone'],
    synonyms: ['Cordarone', 'Pacerone', 'Nexterone'],
    atcCode: 'C01BD01'
  },
  cordarone: {
    genericName: 'Amiodarone',
    brandName: 'Cordarone',
    rxcui: '703',
    drugClass: 'Class III Antiarrhythmic / CYP2C9 Inhibitor',
    formType: 'brand_name',
    activeIngredients: ['Amiodarone'],
    synonyms: ['Amiodarone', 'Pacerone'],
    atcCode: 'C01BD01'
  },
  // Analgesics & NSAIDs
  aspirin: {
    genericName: 'Aspirin',
    brandName: 'Bayer Aspirin',
    rxcui: '1191',
    drugClass: 'Salicylate / Irreversible COX-1 Inhibitor / Antiplatelet',
    formType: 'generic_ingredient',
    activeIngredients: ['Acetylsalicylic acid'],
    synonyms: ['Acetylsalicylic Acid', 'ASA', 'Ecotrin', 'Bayer'],
    atcCode: 'B01AC06'
  },
  bayer: {
    genericName: 'Aspirin',
    brandName: 'Bayer Aspirin',
    rxcui: '1191',
    drugClass: 'Salicylate / Antiplatelet',
    formType: 'brand_name',
    activeIngredients: ['Acetylsalicylic acid'],
    synonyms: ['Aspirin', 'ASA'],
    atcCode: 'B01AC06'
  },
  ibuprofen: {
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    rxcui: '5640',
    drugClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    formType: 'generic_ingredient',
    activeIngredients: ['Ibuprofen'],
    synonyms: ['Advil', 'Motrin', 'Nurofen', 'Brufen'],
    atcCode: 'M01AE01'
  },
  advil: {
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    rxcui: '5640',
    drugClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    formType: 'brand_name',
    activeIngredients: ['Ibuprofen'],
    synonyms: ['Ibuprofen', 'Motrin'],
    atcCode: 'M01AE01'
  },
  paracetamol: {
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    rxcui: '161',
    drugClass: 'Central Analgesic / Antipyretic',
    formType: 'generic_ingredient',
    activeIngredients: ['Acetaminophen'],
    synonyms: ['Acetaminophen', 'Tylenol', 'Panadol', 'APAP'],
    atcCode: 'N02BE01'
  },
  acetaminophen: {
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    rxcui: '161',
    drugClass: 'Central Analgesic / Antipyretic',
    formType: 'generic_ingredient',
    activeIngredients: ['Acetaminophen'],
    synonyms: ['Paracetamol', 'Tylenol', 'Panadol', 'APAP'],
    atcCode: 'N02BE01'
  },
  tylenol: {
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    rxcui: '161',
    drugClass: 'Central Analgesic / Antipyretic',
    formType: 'brand_name',
    activeIngredients: ['Acetaminophen'],
    synonyms: ['Paracetamol', 'Acetaminophen', 'Panadol'],
    atcCode: 'N02BE01'
  },
  // Antidiabetic
  metformin: {
    genericName: 'Metformin',
    brandName: 'Glucophage',
    rxcui: '6809',
    drugClass: 'Biguanide Antidiabetic Agent',
    formType: 'generic_ingredient',
    activeIngredients: ['Metformin hydrochloride'],
    synonyms: ['Glucophage', 'Fortamet', 'Glumetza'],
    atcCode: 'A10BA02'
  },
  glucophage: {
    genericName: 'Metformin',
    brandName: 'Glucophage',
    rxcui: '6809',
    drugClass: 'Biguanide Antidiabetic Agent',
    formType: 'brand_name',
    activeIngredients: ['Metformin hydrochloride'],
    synonyms: ['Metformin'],
    atcCode: 'A10BA02'
  },
  // Substances
  alcohol: {
    genericName: 'Ethanol',
    brandName: 'Alcohol',
    rxcui: '4053',
    drugClass: 'Central Nervous System Depressant / Metabolic Xenobiotic',
    formType: 'substance',
    activeIngredients: ['Ethanol'],
    synonyms: ['Ethanol', 'Ethyl alcohol', 'Alcoholic beverages'],
    atcCode: 'V03AB16'
  },
  ethanol: {
    genericName: 'Ethanol',
    brandName: 'Alcohol',
    rxcui: '4053',
    drugClass: 'Central Nervous System Depressant / Metabolic Xenobiotic',
    formType: 'substance',
    activeIngredients: ['Ethanol'],
    synonyms: ['Alcohol', 'Ethyl alcohol'],
    atcCode: 'V03AB16'
  },
  // Antibiotics
  amoxicillin: {
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    rxcui: '723',
    drugClass: 'Aminopenicillin Beta-lactam Antibiotic',
    formType: 'generic_ingredient',
    activeIngredients: ['Amoxicillin trihydrate'],
    synonyms: ['Amoxil', 'Trimox', 'Moxatag'],
    atcCode: 'J01CA04'
  },
  amoxil: {
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    rxcui: '723',
    drugClass: 'Aminopenicillin Beta-lactam Antibiotic',
    formType: 'brand_name',
    activeIngredients: ['Amoxicillin trihydrate'],
    synonyms: ['Amoxicillin'],
    atcCode: 'J01CA04'
  },
  augmentin: {
    genericName: 'Amoxicillin and Clavulanate Potassium',
    brandName: 'Augmentin',
    rxcui: '18631',
    drugClass: 'Beta-lactam + Beta-lactamase Inhibitor Combination',
    formType: 'combination_product',
    activeIngredients: ['Amoxicillin', 'Clavulanate potassium'],
    synonyms: ['Amoxicillin / Clavulanate'],
    atcCode: 'J01CR02'
  },
  // Antiplatelet
  clopidogrel: {
    genericName: 'Clopidogrel',
    brandName: 'Plavix',
    rxcui: '32968',
    drugClass: 'Thienopyridine P2Y12 Platelet Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Clopidogrel bisulfate'],
    synonyms: ['Plavix', 'Iscover'],
    atcCode: 'B01AC04'
  },
  plavix: {
    genericName: 'Clopidogrel',
    brandName: 'Plavix',
    rxcui: '32968',
    drugClass: 'Thienopyridine P2Y12 Platelet Inhibitor',
    formType: 'brand_name',
    activeIngredients: ['Clopidogrel bisulfate'],
    synonyms: ['Clopidogrel'],
    atcCode: 'B01AC04'
  },
  // Proton Pump Inhibitor
  omeprazole: {
    genericName: 'Omeprazole',
    brandName: 'Prilosec',
    rxcui: '7646',
    drugClass: 'Proton Pump Inhibitor / CYP2C19 Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Omeprazole magnesium'],
    synonyms: ['Prilosec', 'Losec', 'Zegerid'],
    atcCode: 'A02BC01'
  },
  prilosec: {
    genericName: 'Omeprazole',
    brandName: 'Prilosec',
    rxcui: '7646',
    drugClass: 'Proton Pump Inhibitor / CYP2C19 Inhibitor',
    formType: 'brand_name',
    activeIngredients: ['Omeprazole magnesium'],
    synonyms: ['Omeprazole'],
    atcCode: 'A02BC01'
  },
  // Antivirals (Paxlovid)
  paxlovid: {
    genericName: 'Nirmatrelvir and Ritonavir',
    brandName: 'Paxlovid',
    rxcui: '2587847',
    drugClass: 'SARS-CoV-2 3CL Protease Inhibitor + CYP3A4 Booster',
    formType: 'combination_product',
    activeIngredients: ['Nirmatrelvir', 'Ritonavir'],
    synonyms: ['Nirmatrelvir / Ritonavir'],
    atcCode: 'J05AE30'
  },
  nirmatrelvir: {
    genericName: 'Nirmatrelvir',
    brandName: 'Paxlovid component',
    rxcui: '2587843',
    drugClass: 'SARS-CoV-2 3CL Protease Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Nirmatrelvir'],
    synonyms: ['PF-07321332'],
    atcCode: 'J05AE30'
  },
  ritonavir: {
    genericName: 'Ritonavir',
    brandName: 'Norvir',
    rxcui: '85762',
    drugClass: 'HIV-1 Protease Inhibitor / Potent CYP3A4 Inactivator',
    formType: 'generic_ingredient',
    activeIngredients: ['Ritonavir'],
    synonyms: ['Norvir'],
    atcCode: 'J05AE03'
  },
  // Cardiovascular RAAS
  lisinopril: {
    genericName: 'Lisinopril',
    brandName: 'Zestril',
    rxcui: '29046',
    drugClass: 'Angiotensin-Converting Enzyme (ACE) Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Lisinopril dihydrate'],
    synonyms: ['Prinivil', 'Zestril', 'Qbrelis'],
    atcCode: 'C09AA03'
  },
  spironolactone: {
    genericName: 'Spironolactone',
    brandName: 'Aldactone',
    rxcui: '9997',
    drugClass: 'Aldosterone Receptor Antagonist / Potassium-Sparing Diuretic',
    formType: 'generic_ingredient',
    activeIngredients: ['Spironolactone'],
    synonyms: ['Aldactone', 'CaroSpir'],
    atcCode: 'C03DA01'
  },
  aldactone: {
    genericName: 'Spironolactone',
    brandName: 'Aldactone',
    rxcui: '9997',
    drugClass: 'Aldosterone Receptor Antagonist / Potassium-Sparing Diuretic',
    formType: 'brand_name',
    activeIngredients: ['Spironolactone'],
    synonyms: ['Spironolactone'],
    atcCode: 'C03DA01'
  },
  // Statins
  simvastatin: {
    genericName: 'Simvastatin',
    brandName: 'Zocor',
    rxcui: '36567',
    drugClass: 'HMG-CoA Reductase Inhibitor (CYP3A4 substrate)',
    formType: 'generic_ingredient',
    activeIngredients: ['Simvastatin'],
    synonyms: ['Zocor', 'Flolipid'],
    atcCode: 'C10AA01'
  },
  zocor: {
    genericName: 'Simvastatin',
    brandName: 'Zocor',
    rxcui: '36567',
    drugClass: 'HMG-CoA Reductase Inhibitor',
    formType: 'brand_name',
    activeIngredients: ['Simvastatin'],
    synonyms: ['Simvastatin'],
    atcCode: 'C10AA01'
  },
  atorvastatin: {
    genericName: 'Atorvastatin',
    brandName: 'Lipitor',
    rxcui: '83367',
    drugClass: 'HMG-CoA Reductase Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Atorvastatin calcium'],
    synonyms: ['Lipitor'],
    atcCode: 'C10AA05'
  },
  lipitor: {
    genericName: 'Atorvastatin',
    brandName: 'Lipitor',
    rxcui: '83367',
    drugClass: 'HMG-CoA Reductase Inhibitor',
    formType: 'brand_name',
    activeIngredients: ['Atorvastatin calcium'],
    synonyms: ['Atorvastatin'],
    atcCode: 'C10AA05'
  },
  // Cardiac Glycoside
  digoxin: {
    genericName: 'Digoxin',
    brandName: 'Lanoxin',
    rxcui: '3407',
    drugClass: 'Cardiac Glycoside (P-gp substrate, narrow therapeutic index)',
    formType: 'generic_ingredient',
    activeIngredients: ['Digoxin'],
    synonyms: ['Lanoxin', 'Digitek'],
    atcCode: 'C01AA05'
  },
  // Antifungals
  fluconazole: {
    genericName: 'Fluconazole',
    brandName: 'Diflucan',
    rxcui: '4450',
    drugClass: 'Triazole Antifungal / Moderate CYP2C9 & CYP3A4 Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Fluconazole'],
    synonyms: ['Diflucan'],
    atcCode: 'J02AC01'
  },
  diflucan: {
    genericName: 'Fluconazole',
    brandName: 'Diflucan',
    rxcui: '4450',
    drugClass: 'Triazole Antifungal',
    formType: 'brand_name',
    activeIngredients: ['Fluconazole'],
    synonyms: ['Fluconazole'],
    atcCode: 'J02AC01'
  },
  // Immunosuppressant / Antimetabolite
  methotrexate: {
    genericName: 'Methotrexate',
    brandName: 'Trexall',
    rxcui: '6851',
    drugClass: 'Folate Antimetabolite / Immunosuppressant',
    formType: 'generic_ingredient',
    activeIngredients: ['Methotrexate sodium'],
    synonyms: ['Trexall', 'Otrexup', 'Rasuvo', 'Rheumatrex'],
    atcCode: 'L01BA01'
  },
  // Fluoroquinolone
  ciprofloxacin: {
    genericName: 'Ciprofloxacin',
    brandName: 'Cipro',
    rxcui: '2551',
    drugClass: 'Fluoroquinolone Antibacterial / CYP1A2 Inhibitor',
    formType: 'generic_ingredient',
    activeIngredients: ['Ciprofloxacin hydrochloride'],
    synonyms: ['Cipro'],
    atcCode: 'J01MA02'
  }
};

/**
 * Autocomplete suggestions for medication inputs
 * Combines live NIH RxNav spellings/approximate terms with the clinical dictionary
 */
export async function autocompleteMedications(query: string): Promise<MedicationSuggestion[]> {
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) return [];

  const results: Map<string, MedicationSuggestion> = new Map();

  // 1. Clinical terminology dictionary matching
  for (const [key, item] of Object.entries(CLINICAL_TERMINOLOGY_MAP)) {
    if (
      key.includes(clean) ||
      item.genericName.toLowerCase().includes(clean) ||
      item.synonyms.some((s) => s.toLowerCase().includes(clean))
    ) {
      const display = item.formType === 'brand_name' && item.brandName ? item.brandName : item.genericName;
      results.set(display.toLowerCase(), {
        name: display,
        rxcui: item.rxcui,
        type: item.formType === 'brand_name' ? 'brand' : item.formType === 'combination_product' ? 'combination' : 'generic',
        synonyms: item.synonyms
      });
    }
  }

  // 2. Query live NIH RxNav API for external spelling / approximate term matching
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const rxNavUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(clean)}&maxEntries=5`;
    const res = await fetch(rxNavUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const candidates = data?.approximateGroup?.candidate || [];
      for (const c of candidates) {
        if (c.rxcui && c.name && !results.has(c.name.toLowerCase())) {
          results.set(c.name.toLowerCase(), {
            name: c.name,
            rxcui: c.rxcui,
            type: 'generic'
          });
        }
      }
    }
  } catch {
    // Continue with clinical results if offline
  }

  return Array.from(results.values()).slice(0, 8);
}

/**
 * Robust Medication Identity Resolution
 * Resolves standard RxCUI, generic name, brand name, drug class, and formulation type.
 * Never silently substitutes a different drug. Returns UNRECOGNIZED when invalid.
 */
export async function resolveStandardMedicationIdentity(query: string): Promise<ResolvedMedicationIdentity> {
  const startTime = performance.now();
  const trimmed = query.trim();
  const cleanKey = trimmed.toLowerCase();

  // 1. Check verified clinical terminology map
  if (CLINICAL_TERMINOLOGY_MAP[cleanKey]) {
    const item = CLINICAL_TERMINOLOGY_MAP[cleanKey];
    const elapsed = Math.round(performance.now() - startTime);
    return {
      status: 'RESOLVED',
      inputQuery: trimmed,
      genericName: item.genericName,
      brandName: item.brandName,
      rxcui: item.rxcui,
      drugClass: item.drugClass,
      formType: item.formType,
      activeIngredients: item.activeIngredients,
      synonyms: item.synonyms,
      atcCode: item.atcCode,
      source: 'Drug Scope Clinical Terminology Registry',
      latencyMs: elapsed
    };
  }

  // Check verified drugs database (VERIFIED_DRUGS)
  const drugMatch = VERIFIED_DRUGS.find(
    (d) =>
      d.genericName.toLowerCase() === cleanKey ||
      d.brandNames.some((b) => b.toLowerCase() === cleanKey) ||
      d.synonyms.some((s) => s.toLowerCase() === cleanKey)
  );

  if (drugMatch) {
    const isBrand = drugMatch.brandNames.some((b) => b.toLowerCase() === cleanKey);
    const elapsed = Math.round(performance.now() - startTime);
    return {
      status: 'RESOLVED',
      inputQuery: trimmed,
      genericName: drugMatch.genericName,
      brandName: isBrand ? trimmed : drugMatch.brandNames[0],
      rxcui: drugMatch.rxNormCui,
      drugClass: drugMatch.drugClass,
      formType: isBrand ? 'brand_name' : 'generic_ingredient',
      activeIngredients: [drugMatch.genericName],
      synonyms: [...drugMatch.brandNames, ...drugMatch.synonyms],
      atcCode: drugMatch.atcCode,
      source: 'Drug Scope Clinical Terminology Registry',
      latencyMs: elapsed
    };
  }

  // 2. Query live NIH RxNav API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const rxcuiUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(trimmed)}`;
    const rxcuiRes = await fetch(rxcuiUrl, { signal: controller.signal });

    if (rxcuiRes.ok) {
      const data = await rxcuiRes.json();
      const idGroup = data?.idGroup;
      if (idGroup?.rxnormId && idGroup.rxnormId.length > 0) {
        const rxcui = idGroup.rxnormId[0];

        // Fetch properties for RxCUI
        const propUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allProperties.json?prop=all`;
        const propRes = await fetch(propUrl, { signal: controller.signal });
        clearTimeout(timeout);

        let genericName = trimmed;
        let tty = '';
        if (propRes.ok) {
          const propData = await propRes.json();
          const propList = propData?.propConceptGroup?.propConcept || [];
          const nameProp = propList.find((p: any) => p.propName === 'RxNorm Name');
          const ttyProp = propList.find((p: any) => p.propName === 'TTY');
          if (nameProp?.propValue) genericName = nameProp.propValue;
          if (ttyProp?.propValue) tty = ttyProp.propValue;
        }

        const elapsed = Math.round(performance.now() - startTime);
        return {
          status: 'RESOLVED',
          inputQuery: trimmed,
          genericName,
          rxcui,
          drugClass: 'FDA / RxNorm Standardized Pharmaceutical Agent',
          formType: tty === 'BN' ? 'brand_name' : 'generic_ingredient',
          activeIngredients: [genericName],
          synonyms: idGroup.name ? [idGroup.name] : [],
          source: 'Live NIH RxNav API',
          latencyMs: elapsed
        };
      }
    }
    clearTimeout(timeout);
  } catch {
    // Proceed to unresolvable handling
  }

  // 3. Unrecognized medication
  const elapsed = Math.round(performance.now() - startTime);
  return {
    status: 'UNRECOGNIZED',
    inputQuery: trimmed,
    genericName: '',
    rxcui: 'RX-UNRESOLVED',
    drugClass: 'Unverified Input',
    formType: 'unknown',
    activeIngredients: [],
    synonyms: [],
    unresolvedReason: `"${trimmed}" could not be reliably resolved to a validated pharmaceutical entity in the NIH RxNorm or FDA ingredient metathesaurus. Please check the spelling or enter the active generic ingredient.`,
    source: 'Drug Scope Clinical Terminology Registry',
    latencyMs: elapsed
  };
}

// Retain legacy resolveRxNormIdentifier export for backwards compatibility
export async function resolveRxNormIdentifier(query: string) {
  const result = await resolveStandardMedicationIdentity(query);
  return {
    rxcui: result.rxcui,
    name: result.genericName || query,
    synonyms: result.synonyms,
    source: result.source,
    latencyMs: result.latencyMs
  };
}
