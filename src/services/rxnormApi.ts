import { VERIFIED_DRUGS } from '../data/mockDrugs';

export interface RxNormResolution {
  rxcui: string;
  name: string;
  synonyms: string[];
  source: 'Live NIH RxNav API' | 'Drug Scope Verified Registry';
  latencyMs: number;
}

export async function resolveRxNormIdentifier(query: string): Promise<RxNormResolution> {
  const startTime = performance.now();
  const trimmed = query.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(trimmed)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const idGroup = data?.idGroup;
      if (idGroup?.rxnormId && idGroup.rxnormId.length > 0) {
        const rxcui = idGroup.rxnormId[0];
        const elapsed = Math.round(performance.now() - startTime);
        return {
          rxcui,
          name: trimmed,
          synonyms: idGroup.name ? [idGroup.name] : [],
          source: 'Live NIH RxNav API',
          latencyMs: elapsed
        };
      }
    }
  } catch (err) {
    // Graceful fallback to verified registry
  }

  // Fallback to verified database
  const matched = VERIFIED_DRUGS.find(
    (d) =>
      d.genericName.toLowerCase().includes(trimmed.toLowerCase()) ||
      d.brandNames.some((b) => b.toLowerCase().includes(trimmed.toLowerCase())) ||
      d.synonyms.some((s) => s.toLowerCase().includes(trimmed.toLowerCase()))
  );

  const elapsed = Math.round(performance.now() - startTime);

  if (matched) {
    return {
      rxcui: matched.rxNormCui,
      name: matched.genericName,
      synonyms: [...matched.brandNames, ...matched.synonyms],
      source: 'Drug Scope Verified Registry',
      latencyMs: elapsed
    };
  }

  return {
    rxcui: 'RX-UNRESOLVED',
    name: trimmed,
    synonyms: [],
    source: 'Drug Scope Verified Registry',
    latencyMs: elapsed
  };
}
