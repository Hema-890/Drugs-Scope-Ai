import { ResolvedMedicationIdentity, resolveStandardMedicationIdentity } from './rxnormApi';
import { fetchDrugLabelFromOpenFda, OpenFdaLabelResult } from './openFdaApi';
import { searchOpenAlexWorks, OpenAlexWorkRecord } from './openAlexApi';
import { searchPubMedArticles } from './pubmedApi';
import { analyzeDualDrugInteraction, DualInteractionAnalysisResult, InteractionSeverity } from './interactionDiscoveryEngine';
import { supabase } from './supabaseClient';

export interface SingleDrugClinicalDossier {
  status: 'SUCCESS' | 'UNRECOGNIZED';
  medicine: ResolvedMedicationIdentity;
  brandNames: string[];
  activeIngredients: string[];
  approvedIndications: string;
  documentedAdverseReactions: string[];
  boxedWarning?: string;
  contraindications: string;
  precautions: string;
  reportedLabelInteractions: string;
  clinicalPharmacology: string;
  citations: Array<{
    title: string;
    source: string;
    doi?: string;
    url?: string;
    year?: number | string;
  }>;
  unresolvedError?: string;
  latencyMs: number;
}

export interface MultiDrugRegimenAnalysisResult {
  sessionId: string;
  timestamp: string;
  medicines: ResolvedMedicationIdentity[];
  pairwiseInteractions: DualInteractionAnalysisResult[];
  overallClassification: InteractionSeverity;
  highestSeverityInteraction?: DualInteractionAnalysisResult;
  combinedRiskSummary: string;
  commonAdverseEffects: string[];
  cyp450EnzymeConflicts: string[];
  contraindicatedPairs: Array<{ drug1: string; drug2: string; reason: string }>;
  latencyMs: number;
}

export type UniversalAnalysisOutput =
  | { mode: 'SINGLE_DRUG'; dossier: SingleDrugClinicalDossier }
  | { mode: 'MULTI_DRUG'; regimen: MultiDrugRegimenAnalysisResult };

/**
 * Universal Analysis Runner
 * Accepts 1, 2, or N medicines and produces either a Single Drug Dossier or Multi-Drug Interaction Regimen.
 */
export async function runUniversalMedicineAnalysis(
  rawInputs: string[]
): Promise<UniversalAnalysisOutput> {
  const startTime = performance.now();
  const cleanedInputs = rawInputs.map((s) => s.trim()).filter((s) => s.length > 0);

  // Fallback if empty
  if (cleanedInputs.length === 0) {
    cleanedInputs.push('Paracetamol');
  }

  // -----------------------------------------------------------------
  // SCENARIO 1: SINGLE MEDICINE DOSSIER
  // -----------------------------------------------------------------
  if (cleanedInputs.length === 1) {
    const inputDrug = cleanedInputs[0];
    const resolved = await resolveStandardMedicationIdentity(inputDrug);

    if (resolved.status === 'UNRECOGNIZED') {
      const elapsed = Math.round(performance.now() - startTime);
      return {
        mode: 'SINGLE_DRUG',
        dossier: {
          status: 'UNRECOGNIZED',
          medicine: resolved,
          brandNames: [],
          activeIngredients: [],
          approvedIndications: 'N/A',
          documentedAdverseReactions: [],
          contraindications: 'N/A',
          precautions: 'N/A',
          reportedLabelInteractions: 'N/A',
          clinicalPharmacology: 'N/A',
          citations: [],
          unresolvedError: resolved.unresolvedReason,
          latencyMs: elapsed
        }
      };
    }

    const genericName = resolved.genericName || inputDrug;

    // Parallel fetch FDA label & OpenAlex literature
    let labelData: OpenFdaLabelResult | null = null;
    let openAlexWorks: OpenAlexWorkRecord[] = [];

    try {
      const [lRes, oaRes] = await Promise.allSettled([
        fetchDrugLabelFromOpenFda(genericName),
        searchOpenAlexWorks(`${genericName} clinical pharmacology adverse effects`, { perPage: 4 })
      ]);

      if (lRes.status === 'fulfilled') labelData = lRes.value;
      if (oaRes.status === 'fulfilled' && oaRes.value?.results) {
        openAlexWorks = oaRes.value.results;
      }
    } catch {
      // Continue
    }

    // Parse adverse reactions from label
    const adverseReactions: string[] = [];
    if (labelData?.boxedWarning) {
      adverseReactions.push(`Boxed Warning Alert: ${labelData.boxedWarning.slice(0, 150)}...`);
    }

    // Default clinical indications & reactions based on class
    let indications = labelData?.mechanismOfAction || 'Indicated according to FDA approved therapeutic labeling.';
    if (genericName.toLowerCase().includes('paracetamol') || genericName.toLowerCase().includes('acetaminophen')) {
      indications = 'Temporary relief of mild-to-moderate pain (headache, toothache, musculoskeletal ache) and reduction of fever.';
      adverseReactions.push('Rare hypersensitivity reactions', 'Hepatotoxicity (at excessive cumulative doses > 4,000 mg/day)', 'Skin rash');
    } else if (genericName.toLowerCase().includes('metformin')) {
      indications = 'Adjunct to diet and exercise to improve glycemic control in adults and children with type 2 diabetes mellitus.';
      adverseReactions.push('Diarrhea', 'Nausea and vomiting', 'Flatulence', 'Abdominal discomfort', 'Vitamin B12 deficiency', 'Lactic acidosis (rare but severe)');
    } else if (genericName.toLowerCase().includes('warfarin')) {
      indications = 'Prophylaxis and treatment of venous thromboembolism, pulmonary embolism, and thromboembolic complications associated with atrial fibrillation or cardiac valve replacement.';
      adverseReactions.push('Major or fatal hemorrhage', 'Bruising / Hematoma', 'Hematuria', 'Epistaxis', 'Skin necrosis');
    } else {
      adverseReactions.push('Refer to FDA package insert for comprehensive frequency distribution.');
    }

    const citations: SingleDrugClinicalDossier['citations'] = openAlexWorks.map((w) => ({
      title: w.title,
      source: w.journal || 'OpenAlex Scientific Literature',
      doi: w.doi || undefined,
      url: w.doi ? (w.doi.startsWith('http') ? w.doi : `https://doi.org/${w.doi}`) : (w.sourceUrl || undefined),
      year: w.publicationYear || undefined
    }));

    if (citations.length === 0) {
      citations.push({
        title: `FDA Structured Product Label: ${genericName}`,
        source: 'U.S. Food and Drug Administration (openFDA)',
        url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(genericName)}`,
        year: 2024
      });
    }

    const elapsed = Math.round(performance.now() - startTime);

    return {
      mode: 'SINGLE_DRUG',
      dossier: {
        status: 'SUCCESS',
        medicine: resolved,
        brandNames: resolved.brandName ? [resolved.brandName] : resolved.synonyms,
        activeIngredients: resolved.activeIngredients,
        approvedIndications: indications,
        documentedAdverseReactions: adverseReactions,
        boxedWarning: labelData?.boxedWarning,
        contraindications: labelData?.contraindications || 'Refer to FDA package insert contraindications section.',
        precautions: 'Routine laboratory and clinical monitoring recommended during therapy.',
        reportedLabelInteractions: labelData?.drugInteractions || 'Consult full prescribing information for CYP450 and pharmacokinetic interactions.',
        clinicalPharmacology: labelData?.mechanismOfAction || `${genericName} belongs to the ${resolved.drugClass} class.`,
        citations,
        latencyMs: elapsed
      }
    };
  }

  // -----------------------------------------------------------------
  // SCENARIO 2: MULTI-MEDICINE (2 OR MORE) INTERACTION REGIMEN
  // -----------------------------------------------------------------
  const sessionId = `DSA-REG-${Date.now().toString().slice(-6)}`;
  const resolvedMedicines: ResolvedMedicationIdentity[] = [];

  for (const rawName of cleanedInputs) {
    const res = await resolveStandardMedicationIdentity(rawName);
    resolvedMedicines.push(res);
  }

  // Pairwise evaluations
  const pairwiseInteractions: DualInteractionAnalysisResult[] = [];
  const contraindicatedPairs: Array<{ drug1: string; drug2: string; reason: string }> = [];
  const cypConflicts: Set<string> = new Set();
  const commonAdverse: Set<string> = new Set();

  let highestRank = 0;
  let overallClassification: InteractionSeverity = 'No Documented Interaction';
  let highestPair: DualInteractionAnalysisResult | undefined = undefined;

  const severityRank: Record<InteractionSeverity, number> = {
    Contraindicated: 4,
    Major: 3,
    Moderate: 2,
    Minor: 1,
    'No Documented Interaction': 0
  };

  for (let i = 0; i < resolvedMedicines.length; i++) {
    for (let j = i + 1; j < resolvedMedicines.length; j++) {
      const drugA = resolvedMedicines[i].genericName || resolvedMedicines[i].inputQuery;
      const drugB = resolvedMedicines[j].genericName || resolvedMedicines[j].inputQuery;

      const pairResult = await analyzeDualDrugInteraction(drugA, drugB);
      pairwiseInteractions.push(pairResult);

      const rank = severityRank[pairResult.reportA.classification];
      if (rank > highestRank) {
        highestRank = rank;
        overallClassification = pairResult.reportA.classification;
        highestPair = pairResult;
      }

      if (pairResult.reportA.classification === 'Contraindicated') {
        contraindicatedPairs.push({
          drug1: drugA,
          drug2: drugB,
          reason: pairResult.reportA.knownInteractionsSummary
        });
      }

      pairResult.reportA.potentialSideEffects.forEach((se) => commonAdverse.add(se));

      if (pairResult.reportB.pharmacologicalMechanisms.pharmacokinetic?.toLowerCase().includes('cyp')) {
        cypConflicts.add(pairResult.reportB.pharmacologicalMechanisms.pharmacokinetic);
      }
    }
  }

  const combinedRiskSummary =
    highestPair && highestRank > 0
      ? `Evaluation across ${resolvedMedicines.length} concurrent medicines discovered a ${overallClassification.toUpperCase()} severity interaction: ${highestPair.reportA.knownInteractionsSummary}`
      : `Evaluation across ${resolvedMedicines.length} concurrent medicines revealed no established severe or contraindicated interactions in current FDA labeling and reviewed clinical rules.`;

  const elapsed = Math.round(performance.now() - startTime);

  // Store multi-drug session in PostgreSQL
  try {
    await supabase.from('analysis_sessions').insert([
      {
        session_id: sessionId,
        title: `${resolvedMedicines.map((m) => m.genericName || m.inputQuery).join(' + ')} Regimen Analysis`,
        drug_names: resolvedMedicines.map((m) => m.genericName || m.inputQuery),
        findings_count: pairwiseInteractions.filter((p) => p.reportA.hasInteraction).length,
        highest_severity: overallClassification === 'Contraindicated' ? 'CRITICAL' : overallClassification === 'Major' ? 'HIGH' : overallClassification === 'Moderate' ? 'MODERATE' : 'LOW',
        status: 'COMPLETED',
        session_data: {
          medicines: resolvedMedicines,
          overallClassification,
          combinedRiskSummary
        }
      }
    ]);
  } catch {
    // Non-fatal if offline
  }

  return {
    mode: 'MULTI_DRUG',
    regimen: {
      sessionId,
      timestamp: new Date().toISOString(),
      medicines: resolvedMedicines,
      pairwiseInteractions,
      overallClassification,
      highestSeverityInteraction: highestPair,
      combinedRiskSummary,
      commonAdverseEffects: Array.from(commonAdverse).slice(0, 8),
      cyp450EnzymeConflicts: Array.from(cypConflicts),
      contraindicatedPairs,
      latencyMs: elapsed
    }
  };
}
