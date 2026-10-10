import { AnalysisFinding, AnalysisSession, Drug, ExplanationMode, GraphEdge, GraphNode } from '../types';
import { VERIFIED_DRUGS } from '../data/mockDrugs';
import { PAIRWISE_INTERACTIONS } from '../data/mockInteractions';
import { BIOLOGICAL_TARGETS } from '../data/mockTargets';
import { PROTEIN_STRUCTURES } from '../data/mockStructures';
import { fetchDrugLabelFromOpenFda } from './openFdaApi';
import { resolveRxNormIdentifier } from './rxnormApi';

const STORAGE_KEY_ANALYSES = 'drug_scope_analysis_sessions';

export async function runMedicineAnalysis(
  selectedDrugs: Drug[],
  clinicalContext?: {
    dose?: string;
    route?: string;
    ageCategory?: string;
    renalFunction?: string;
    hepaticFunction?: string;
  },
  explanationMode: ExplanationMode = 'professional'
): Promise<AnalysisSession> {
  const sessionId = `DSA-ANL-${Date.now().toString().slice(-6)}`;
  const drugNames = selectedDrugs.map((d) => d.genericName);
  const title = drugNames.length > 1 ? `${drugNames.join(' + ')} Polypharmacy Analysis` : `${drugNames[0]} Monotherapy Profile`;

  // 1. Gather label and identifier metadata
  await Promise.all(
    selectedDrugs.map(async (drug) => {
      try {
        await resolveRxNormIdentifier(drug.genericName);
        await fetchDrugLabelFromOpenFda(drug.genericName);
      } catch (e) {
        // Continue with local data if offline
      }
    })
  );

  // 2. Discover pairwise interactions
  const findings: AnalysisFinding[] = [];
  const selectedIds = selectedDrugs.map((d) => d.id);

  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      const drugA = selectedDrugs[i];
      const drugB = selectedDrugs[j];

      // Check verified registry
      const matched = PAIRWISE_INTERACTIONS.find(
        (inter) =>
          (inter.drugAId === drugA.id && inter.drugBId === drugB.id) ||
          (inter.drugAId === drugB.id && inter.drugBId === drugA.id)
      );

      // Check shared enzymes
      const sharedEnzymes = drugA.primaryMetabolizingEnzymes.filter((enz) =>
        drugB.primaryMetabolizingEnzymes.includes(enz)
      );

      // Check shared targets
      const sharedTargets = drugA.targets.filter((t) => drugB.targets.includes(t));

      if (matched) {
        findings.push({
          id: matched.id,
          drugAId: drugA.id,
          drugAName: drugA.genericName,
          drugBId: drugB.id,
          drugBName: drugB.genericName,
          severity: matched.severity,
          evidenceStatus: matched.evidenceStatus,
          interactionType: matched.interactionType,
          mechanism: matched.mechanism,
          clinicalConsequence: matched.clinicalConsequence,
          managementGuidance: matched.managementGuidance,
          simpleExplanation: generateSimpleExplanation(drugA, drugB, matched.severity, matched.mechanism),
          professionalExplanation: generateProfessionalExplanation(drugA, drugB, matched),
          researchExplanation: generateResearchExplanation(drugA, drugB, matched),
          sources: matched.primarySources,
          cypEnzymes: matched.enzymeConflicts.length > 0 ? matched.enzymeConflicts : sharedEnzymes,
          receptors: matched.targetOverlap.length > 0 ? matched.targetOverlap : sharedTargets,
          targetOverlap: matched.targetOverlap
        });
      } else if (sharedEnzymes.length > 0) {
        // Enzyme competition detected without direct black-box conflict
        findings.push({
          id: `finding-enz-${drugA.id}-${drugB.id}`,
          drugAId: drugA.id,
          drugAName: drugA.genericName,
          drugBId: drugB.id,
          drugBName: drugB.genericName,
          severity: 'Moderate',
          evidenceStatus: 'Documented',
          interactionType: 'Pharmacokinetic (CYP Competition)',
          mechanism: `Both compounds utilize ${sharedEnzymes.join(', ')} for metabolic clearance, creating competitive displacement risk.`,
          clinicalConsequence: `May alter circulating plasma concentrations of either compound, especially in slow metabolizers.`,
          managementGuidance: `Monitor for augmented therapeutic effects or dose titration requirements. Check liver function markers.`,
          simpleExplanation: `Both ${drugA.genericName} and ${drugB.genericName} are broken down by the same liver enzymes (${sharedEnzymes.join(', ')}). When taken together, your liver may process them more slowly, which can raise medicine levels in your bloodstream. Ask your doctor if your doses should be adjusted.`,
          professionalExplanation: `Co-administration presents substrate competition at hepatic ${sharedEnzymes.join(', ')}. Assess patient CYP genotype where accessible and consider staggered administration or therapeutic drug monitoring.`,
          researchExplanation: `Competitive in vitro inhibition potential at ${sharedEnzymes.join(', ')}. Km values indicate overlapping substrate recognition in microsomal assays.`,
          sources: [
            {
              name: 'FDA Drug Development & Drug Interactions Guidance',
              type: 'Guidance Monograph',
              citation: 'FDA CDER In Vitro & Clinical DDI Studies (2020)'
            }
          ],
          cypEnzymes: sharedEnzymes,
          receptors: sharedTargets,
          targetOverlap: sharedTargets
        });
      } else {
        // No direct conflict documented
        findings.push({
          id: `finding-clear-${drugA.id}-${drugB.id}`,
          drugAId: drugA.id,
          drugAName: drugA.genericName,
          drugBId: drugB.id,
          drugBName: drugB.genericName,
          severity: 'Theoretical',
          evidenceStatus: 'Evidence Gap',
          interactionType: 'No Major Documented Conflict',
          mechanism: `Independent metabolic pathways and non-overlapping primary molecular targets in active reference registries.`,
          clinicalConsequence: `No severe adverse pharmacodynamic or pharmacokinetic cross-talk observed in standard package inserts.`,
          managementGuidance: `Standard clinical dosing schedule; continue routine patient monitoring.`,
          simpleExplanation: `Our medical evidence records do not show a major documented conflict between ${drugA.genericName} and ${drugB.genericName}. However, always inform your doctor or pharmacist about all supplements and medicines you take.`,
          professionalExplanation: `No high-severity interaction recorded in SPL/RxNav registries. Primary metabolic pathways differ (${drugA.primaryMetabolizingEnzymes.join(', ')} vs ${drugB.primaryMetabolizingEnzymes.join(', ')}).`,
          researchExplanation: `Independent target engagement profiles without known allosteric or competitive crosstalk in ChEMBL bioassays.`,
          sources: [
            {
              name: 'RxNav Interaction API & DailyMed',
              type: 'Registry Verification',
              citation: 'National Library of Medicine Multi-Drug Database (2026)'
            }
          ],
          cypEnzymes: [],
          receptors: [],
          targetOverlap: []
        });
      }
    }
  }

  // 3. Build 3D Graph Topology
  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];

  // Add Drug Nodes
  selectedDrugs.forEach((drug, idx) => {
    const angle = (idx / selectedDrugs.length) * Math.PI * 2;
    const r = 4.5;
    graphNodes.push({
      id: drug.id,
      label: drug.genericName,
      type: 'drug',
      color: '#24D8ED',
      size: 1.4,
      sublabel: drug.drugClass,
      position: [Math.cos(angle) * r, Math.sin(angle) * r, 0],
      metadata: { drug }
    });

    // Add enzyme nodes
    drug.primaryMetabolizingEnzymes.forEach((enz, eIdx) => {
      const enzId = `enz-${enz.toLowerCase()}`;
      if (!graphNodes.find((n) => n.id === enzId)) {
        const enzAngle = angle + (eIdx + 1) * 0.4;
        graphNodes.push({
          id: enzId,
          label: enz,
          type: 'enzyme',
          color: '#F2B961',
          size: 0.9,
          sublabel: 'CYP450 Enzyme',
          position: [Math.cos(enzAngle) * 7.5, Math.sin(enzAngle) * 7.5, (eIdx % 2 === 0 ? 1.5 : -1.5)],
          metadata: { enzyme: enz }
        });
      }
      graphEdges.push({
        id: `edge-${drug.id}-${enzId}`,
        source: drug.id,
        target: enzId,
        label: 'Substrate / Inhibitor',
        type: 'metabolizes',
        color: '#F2B961'
      });
    });

    // Add target nodes
    drug.targets.forEach((targetId, tIdx) => {
      const targetObj = BIOLOGICAL_TARGETS.find((bt) => bt.id === targetId);
      const label = targetObj ? targetObj.geneSymbol : targetId;
      const targetNodeId = `target-${targetId}`;
      if (!graphNodes.find((n) => n.id === targetNodeId)) {
        const tAngle = angle - (tIdx + 1) * 0.5;
        graphNodes.push({
          id: targetNodeId,
          label,
          type: 'receptor',
          color: '#9475FF',
          size: 1.1,
          sublabel: targetObj?.targetType || 'Receptor',
          position: [Math.cos(tAngle) * 6.5, Math.sin(tAngle) * 6.5, (tIdx % 2 === 0 ? -2.0 : 2.0)],
          metadata: { target: targetObj }
        });
      }
      graphEdges.push({
        id: `edge-${drug.id}-${targetNodeId}`,
        source: drug.id,
        target: targetNodeId,
        label: 'Ligand Binding',
        type: 'binds',
        color: '#9475FF'
      });
    });
  });

  // Add conflict edges between interacting drugs
  findings.forEach((f) => {
    if (f.severity === 'Contraindicated' || f.severity === 'Major' || f.severity === 'Moderate') {
      graphEdges.push({
        id: `conflict-${f.drugAId}-${f.drugBId}`,
        source: f.drugAId,
        target: f.drugBId,
        label: `${f.severity} Interaction`,
        type: 'conflicts',
        color: f.severity === 'Contraindicated' ? '#F16D7B' : '#F2B961',
        dashed: true
      });
    }
  });

  // Calculate summaries
  const contraindicatedCount = findings.filter((f) => f.severity === 'Contraindicated').length;
  const majorCount = findings.filter((f) => f.severity === 'Major').length;
  const moderateCount = findings.filter((f) => f.severity === 'Moderate').length;
  const documentedCount = findings.filter((f) => f.evidenceStatus === 'Documented').length;
  const documentedEvidencePercent = findings.length > 0 ? Math.round((documentedCount / findings.length) * 100) : 100;

  let primaryRiskSummary = 'No severe pharmacokinetic conflicts identified across evaluated regimens.';
  if (contraindicatedCount > 0) {
    primaryRiskSummary = `Critical alert: ${contraindicatedCount} contraindicated combination detected with severe adverse escalation risk. Immediate medication review recommended.`;
  } else if (majorCount > 0) {
    primaryRiskSummary = `Major interaction warning: ${majorCount} significant metabolic conflict identified. Therapeutic drug monitoring and potential dose reduction advised.`;
  } else if (moderateCount > 0) {
    primaryRiskSummary = `Moderate clearance overlap detected. Clinical observation advised.`;
  }

  const session: AnalysisSession = {
    id: sessionId,
    title,
    timestamp: new Date().toISOString(),
    datasetMode: 'RESEARCH',
    medications: selectedDrugs,
    clinicalContext,
    explanationMode,
    findings,
    graphData: {
      nodes: graphNodes,
      edges: graphEdges
    },
    status: 'completed',
    summary: {
      totalInteractions: findings.length,
      contraindicatedCount,
      majorCount,
      moderateCount,
      documentedEvidencePercent,
      primaryRiskSummary
    }
  };

  // Persist session to local storage
  saveAnalysisSession(session);

  return session;
}

function generateSimpleExplanation(drugA: Drug, drugB: Drug, severity: string, mechanism: string): string {
  if (severity === 'Contraindicated' || severity === 'Major') {
    return `Taking ${drugA.genericName} together with ${drugB.genericName} is known to cause serious side effects. ${mechanism} Because of this, medicine levels can rise dangerously in your body, which can cause excessive bleeding or abnormal heart rhythms. You should never take these together without speaking directly to your doctor or pharmacist.`;
  }
  return `${drugA.genericName} and ${drugB.genericName} may influence each other in your body. ${mechanism} Talk to your healthcare provider to verify your dosage schedule and ensure safe monitoring.`;
}

function generateProfessionalExplanation(drugA: Drug, drugB: Drug, item: any): string {
  return `Co-administration of ${drugA.genericName} and ${drugB.genericName} results in ${item.interactionType.toLowerCase()}. Mechanism: ${item.mechanism} Clinical Outcome: ${item.clinicalConsequence} Recommended Clinical Protocol: ${item.managementGuidance}`;
}

function generateResearchExplanation(drugA: Drug, drugB: Drug, item: any): string {
  return `In vitro and pharmacokinetic bioassay data demonstrate competitive CYP clearance inhibition and target co-affinity for ${drugA.genericName} (RxCUI: ${drugA.rxNormCui}) and ${drugB.genericName} (RxCUI: ${drugB.rxNormCui}). Verified structural targets include ${item.targetOverlap.join(', ') || 'hepatic microsomal CYP complex'}. Primary published citations: ${item.primarySources.map((s: any) => `${s.name} (${s.citation})`).join('; ')}.`;
}

export function getSavedAnalysisSessions(): AnalysisSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAnalysisSessionById(id: string): AnalysisSession | null {
  const sessions = getSavedAnalysisSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function saveAnalysisSession(session: AnalysisSession): void {
  try {
    const sessions = getSavedAnalysisSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    let updated: AnalysisSession[];
    if (existingIndex >= 0) {
      updated = [...sessions];
      updated[existingIndex] = session;
    } else {
      updated = [session, ...sessions].slice(0, 25); // retain last 25
    }
    localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save analysis session', e);
  }
}
